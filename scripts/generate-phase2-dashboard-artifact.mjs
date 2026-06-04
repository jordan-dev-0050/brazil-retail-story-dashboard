import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const COVERAGE_START = '2017-01-01';
const COVERAGE_END = '2018-08-31';

const DATE_RANGES = [
  {
    id: 'all',
    label: 'All Period (2017-01 to 2018-08)',
    start: '2017-01-01',
    end: '2018-08-31',
  },
  {
    id: '2017',
    label: '2017 Full Year',
    start: '2017-01-01',
    end: '2017-12-31',
  },
  {
    id: '2018_ytd',
    label: '2018 YTD (Jan-Aug)',
    start: '2018-01-01',
    end: '2018-08-31',
  },
];

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ordersCsvPath = path.join(projectRoot, 'data', 'olist_orders_dataset.csv');
const orderItemsCsvPath = path.join(projectRoot, 'data', 'olist_order_items_dataset.csv');
const orderPaymentsCsvPath = path.join(projectRoot, 'data', 'olist_order_payments_dataset.csv');
const outputPath = path.join(projectRoot, 'src', 'data', 'phase2DashboardArtifact.json');

const PAYMENT_TYPE_ORDER = ['credit_card', 'boleto', 'voucher', 'debit_card', 'not_defined'];
const PAYMENT_TYPE_LABELS = {
  all: 'All Payment Types',
  credit_card: 'Credit Card',
  boleto: 'Boleto',
  voucher: 'Voucher',
  debit_card: 'Debit Card',
  not_defined: 'Not Defined',
};
const FREIGHT_BANDS = [
  { band: '0-10', min: 0, maxExclusive: 10 },
  { band: '10-20', min: 10, maxExclusive: 20 },
  { band: '20-30', min: 20, maxExclusive: 30 },
  { band: '30-40', min: 30, maxExclusive: 40 },
  { band: '40-50', min: 40, maxExclusive: 50 },
  { band: '50-75', min: 50, maxExclusive: 75 },
  { band: '75-100', min: 75, maxExclusive: 100 },
  { band: '100+', min: 100, maxExclusive: Number.POSITIVE_INFINITY },
];

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];

      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

async function readCsvRows(filePath, onRow) {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const reader = createInterface({ input: stream, crlfDelay: Infinity });
  let headers = [];

  for await (const line of reader) {
    if (!line) {
      continue;
    }

    if (headers.length === 0) {
      headers = parseCsvLine(line);
      continue;
    }

    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    onRow(row);
  }
}

function roundCurrency(value) {
  return Number(value.toFixed(2));
}

function roundPercentage(value) {
  return Number(value.toFixed(2));
}

function buildMonthKeys(start, end) {
  const months = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const limit = new Date(`${end}T00:00:00Z`);

  cursor.setUTCDate(1);
  limit.setUTCDate(1);

  while (cursor <= limit) {
    const year = cursor.getUTCFullYear();
    const month = String(cursor.getUTCMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const monthLabel = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const yearLabel = String(year).slice(-2);
  return `${monthLabel} '${yearLabel}`;
}

function isWithinRange(dateText, start, end) {
  return dateText >= start && dateText <= end;
}

function formatPaymentTypeLabel(paymentType) {
  return (
    PAYMENT_TYPE_LABELS[paymentType] ??
    paymentType
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

function buildEmptyFreightBands() {
  return FREIGHT_BANDS.map(({ band }) => ({
    band,
    orderCount: 0,
  }));
}

function getFreightBandId(freightValue) {
  return FREIGHT_BANDS.find(
    ({ min, maxExclusive }) => freightValue >= min && freightValue < maxExclusive,
  )?.band;
}

function getMedianCurrency(values) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return roundCurrency(sorted[middleIndex]);
  }

  return roundCurrency((sorted[middleIndex - 1] + sorted[middleIndex]) / 2);
}

function buildPaymentTypeOrder(paymentTypeSet) {
  const knownTypes = PAYMENT_TYPE_ORDER.filter((paymentType) => paymentTypeSet.has(paymentType));
  const unknownTypes = Array.from(paymentTypeSet).filter(
    (paymentType) => !PAYMENT_TYPE_ORDER.includes(paymentType),
  );

  unknownTypes.sort((left, right) => left.localeCompare(right));
  return ['all', ...knownTypes, ...unknownTypes];
}

function buildPaymentSlice(rangeOrders, paymentType, paymentsByOrder) {
  const matchedOrders =
    paymentType === 'all'
      ? rangeOrders
      : rangeOrders.filter((order) =>
          (paymentsByOrder.get(order.orderId) ?? []).some(
            (paymentRow) => paymentRow.paymentType === paymentType,
          ),
        );

  const freightBands = buildEmptyFreightBands();
  const freightBandById = new Map(freightBands.map((entry) => [entry.band, entry]));
  const paymentValueByType = new Map();
  const paymentRowCountByType = new Map();
  const freightValues = [];

  let totalFreightValue = 0;
  let paymentRowCount = 0;
  let totalPaymentValue = 0;
  let onTimeOrderCount = 0;

  for (const order of matchedOrders) {
    totalFreightValue += order.freightValue;
    freightValues.push(order.freightValue);

    const bandId = getFreightBandId(order.freightValue);
    const freightBand = bandId ? freightBandById.get(bandId) : undefined;

    if (freightBand) {
      freightBand.orderCount += 1;
    }

    if (order.isOnTime) {
      onTimeOrderCount += 1;
    }

    for (const paymentRow of paymentsByOrder.get(order.orderId) ?? []) {
      paymentRowCount += 1;
      totalPaymentValue += paymentRow.paymentValue;
      paymentValueByType.set(
        paymentRow.paymentType,
        roundCurrency((paymentValueByType.get(paymentRow.paymentType) ?? 0) + paymentRow.paymentValue),
      );
      paymentRowCountByType.set(
        paymentRow.paymentType,
        (paymentRowCountByType.get(paymentRow.paymentType) ?? 0) + 1,
      );
    }
  }

  const delayedOrderCount = matchedOrders.length - onTimeOrderCount;
  const paymentTypes = buildPaymentTypeOrder(new Set(paymentValueByType.keys())).filter(
    (candidate) => candidate !== 'all',
  );

  return {
    paymentType,
    orderCount: matchedOrders.length,
    paymentRowCount,
    freightDistribution: {
      totalOrders: matchedOrders.length,
      totalFreightValue: roundCurrency(totalFreightValue),
      avgFreightValue:
        matchedOrders.length === 0 ? 0 : roundCurrency(totalFreightValue / matchedOrders.length),
      medianFreightValue: getMedianCurrency(freightValues),
      bands: freightBands,
    },
    paymentMix: {
      totalPaymentRowCount: paymentRowCount,
      totalPaymentValue: roundCurrency(totalPaymentValue),
      entries: paymentTypes.map((candidate) => ({
        paymentType: candidate,
        label: formatPaymentTypeLabel(candidate),
        paymentRowCount: paymentRowCountByType.get(candidate) ?? 0,
        paymentValue: paymentValueByType.get(candidate) ?? 0,
      })),
    },
    onTimeVsDelayed: {
      totalOrders: matchedOrders.length,
      onTimeOrderCount,
      delayedOrderCount,
      onTimeRate:
        matchedOrders.length === 0 ? 0 : roundPercentage((onTimeOrderCount / matchedOrders.length) * 100),
      delayedRate:
        matchedOrders.length === 0 ? 0 : roundPercentage((delayedOrderCount / matchedOrders.length) * 100),
    },
  };
}

const orderMetricsById = new Map();

await readCsvRows(orderItemsCsvPath, (row) => {
  const price = Number.parseFloat(row.price ?? '0');
  const freightValue = Number.parseFloat(row.freight_value ?? '0');

  const currentMetrics = orderMetricsById.get(row.order_id) ?? {
    gmv: 0,
    freightValue: 0,
  };

  orderMetricsById.set(row.order_id, {
    gmv: Number.isNaN(price) ? currentMetrics.gmv : roundCurrency(currentMetrics.gmv + price),
    freightValue: Number.isNaN(freightValue)
      ? currentMetrics.freightValue
      : roundCurrency(currentMetrics.freightValue + freightValue),
  });
});

const qualifyingOrders = [];
const qualifyingOrderIds = new Set();

await readCsvRows(ordersCsvPath, (row) => {
  const purchaseDate = (row.order_purchase_timestamp ?? '').slice(0, 10);

  if (
    row.order_status !== 'delivered' ||
    purchaseDate.length !== 10 ||
    !isWithinRange(purchaseDate, COVERAGE_START, COVERAGE_END)
  ) {
    return;
  }

  const orderMetrics = orderMetricsById.get(row.order_id) ?? {
    gmv: 0,
    freightValue: 0,
  };
  const deliveredDate = (row.order_delivered_customer_date ?? '').slice(0, 10);
  const estimatedDate = (row.order_estimated_delivery_date ?? '').slice(0, 10);

  qualifyingOrders.push({
    orderId: row.order_id,
    purchaseDate,
    month: purchaseDate.slice(0, 7),
    gmv: orderMetrics.gmv,
    freightValue: orderMetrics.freightValue,
    isOnTime:
      deliveredDate.length === 10 && estimatedDate.length === 10 && deliveredDate <= estimatedDate,
  });
  qualifyingOrderIds.add(row.order_id);
});

const paymentsByOrder = new Map();

await readCsvRows(orderPaymentsCsvPath, (row) => {
  if (!qualifyingOrderIds.has(row.order_id)) {
    return;
  }

  const paymentValue = Number.parseFloat(row.payment_value ?? '0');
  const paymentRows = paymentsByOrder.get(row.order_id) ?? [];

  paymentRows.push({
    paymentType: row.payment_type,
    paymentValue: Number.isNaN(paymentValue) ? 0 : roundCurrency(paymentValue),
  });

  paymentsByOrder.set(row.order_id, paymentRows);
});

const artifact = {
  metadata: {
    source: 'olist',
    version: '0.2.0',
    generatedAt: new Date().toISOString(),
    currency: 'BRL',
    timeAxis: 'order_purchase_timestamp',
    grain: 'month',
    orderPopulation: 'delivered_orders_only',
    coverageStart: COVERAGE_START,
    coverageEnd: COVERAGE_END,
  },
  dateRanges: DATE_RANGES,
  kpisByRange: {},
  monthlySeriesByRange: {},
  paymentPanelsByRange: {},
};

for (const range of DATE_RANGES) {
  const seriesByMonth = new Map(
    buildMonthKeys(range.start, range.end).map((month) => [
      month,
      {
        month,
        label: formatMonthLabel(month),
        orders: 0,
        gmv: 0,
      },
    ]),
  );

  let totalOrders = 0;
  let totalGmv = 0;
  const rangeOrders = [];

  for (const order of qualifyingOrders) {
    if (!isWithinRange(order.purchaseDate, range.start, range.end)) {
      continue;
    }

    rangeOrders.push(order);
    totalOrders += 1;
    totalGmv += order.gmv;

    const monthEntry = seriesByMonth.get(order.month);

    if (monthEntry) {
      monthEntry.orders += 1;
      monthEntry.gmv = roundCurrency(monthEntry.gmv + order.gmv);
    }
  }

  artifact.kpisByRange[range.id] = {
    totalOrders,
    totalGmv: roundCurrency(totalGmv),
  };

  artifact.monthlySeriesByRange[range.id] = Array.from(seriesByMonth.values());

  const paymentTypesInRange = new Set();

  for (const order of rangeOrders) {
    for (const paymentRow of paymentsByOrder.get(order.orderId) ?? []) {
      paymentTypesInRange.add(paymentRow.paymentType);
    }
  }

  const paymentTypeIds = buildPaymentTypeOrder(paymentTypesInRange);
  const slicesByPaymentType = {};

  for (const paymentType of paymentTypeIds) {
    slicesByPaymentType[paymentType] = buildPaymentSlice(rangeOrders, paymentType, paymentsByOrder);
  }

  artifact.paymentPanelsByRange[range.id] = {
    paymentTypeOptions: paymentTypeIds.map((paymentType) => ({
      value: paymentType,
      label: formatPaymentTypeLabel(paymentType),
      orderCount: slicesByPaymentType[paymentType].orderCount,
    })),
    slicesByPaymentType,
  };
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
