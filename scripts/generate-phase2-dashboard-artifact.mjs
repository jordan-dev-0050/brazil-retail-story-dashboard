import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const COVERAGE_START = '2017-01-01';
const COVERAGE_END = '2018-08-31';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_DELAY_BUCKET = -14;
const MAX_DELAY_BUCKET = 60;
const ALL_STATES_VALUE = 'all-states';
const ALL_CATEGORIES_VALUE = 'all-categories';
const UNKNOWN_STATE = 'Unknown';
const UNKNOWN_CATEGORY_KEY = 'unknown_category';
const UNKNOWN_CATEGORY_LABEL = 'Unknown Category';

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
const customersCsvPath = path.join(projectRoot, 'data', 'olist_customers_dataset.csv');
const orderItemsCsvPath = path.join(projectRoot, 'data', 'olist_order_items_dataset.csv');
const productsCsvPath = path.join(projectRoot, 'data', 'olist_products_dataset.csv');
const categoryTranslationCsvPath = path.join(
  projectRoot,
  'data',
  'product_category_name_translation.csv',
);
const orderPaymentsCsvPath = path.join(projectRoot, 'data', 'olist_order_payments_dataset.csv');
const orderReviewsCsvPath = path.join(projectRoot, 'data', 'olist_order_reviews_dataset.csv');
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
      headers = parseCsvLine(line).map((header, index) =>
        index === 0 ? header.replace(/^\uFEFF/, '') : header,
      );
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

function roundMetric(value) {
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

function toTitleCase(value) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normaliseCategory(rawCategoryName, translatedCategoryName) {
  const raw = rawCategoryName.trim();
  const translated = translatedCategoryName.trim();

  if (!raw) {
    return {
      key: UNKNOWN_CATEGORY_KEY,
      label: UNKNOWN_CATEGORY_LABEL,
    };
  }

  const keySource = translated || raw;
  const key = keySource.toLowerCase().replace(/\s+/g, '_');
  const label = translated ? toTitleCase(translated) : toTitleCase(raw);

  return { key, label };
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

function compareByOrderCountThenLabel(left, right) {
  if (right.orderCount !== left.orderCount) {
    return right.orderCount - left.orderCount;
  }

  return left.label.localeCompare(right.label);
}

function compareCategories(left, right) {
  if (right.itemCount !== left.itemCount) {
    return right.itemCount - left.itemCount;
  }

  if (right.totalGmv !== left.totalGmv) {
    return right.totalGmv - left.totalGmv;
  }

  return left.categoryLabel.localeCompare(right.categoryLabel);
}

function getDateDiffInDays(leftDate, rightDate) {
  return Math.round(
    (Date.parse(`${leftDate}T00:00:00Z`) - Date.parse(`${rightDate}T00:00:00Z`)) / MS_PER_DAY,
  );
}

function buildDimensionOptions(allLabel, allValue, rows, totalOrders) {
  return [
    {
      value: allValue,
      label: allLabel,
      orderCount: totalOrders,
    },
    ...rows,
  ];
}

function calculatePearsonCorrelation(points) {
  if (points.length < 2) {
    return 0;
  }

  const count = points.length;
  const sumX = points.reduce((total, point) => total + point.x, 0);
  const sumY = points.reduce((total, point) => total + point.y, 0);
  const meanX = sumX / count;
  const meanY = sumY / count;

  let numerator = 0;
  let denominatorLeft = 0;
  let denominatorRight = 0;

  for (const point of points) {
    const deltaX = point.x - meanX;
    const deltaY = point.y - meanY;
    numerator += deltaX * deltaY;
    denominatorLeft += deltaX ** 2;
    denominatorRight += deltaY ** 2;
  }

  const denominator = Math.sqrt(denominatorLeft * denominatorRight);
  return denominator === 0 ? 0 : roundMetric(numerator / denominator);
}

function buildTrendLine(points, minDelay, maxDelay) {
  if (points.length < 2) {
    return [];
  }

  const count = points.length;
  const sumX = points.reduce((total, point) => total + point.x, 0);
  const sumY = points.reduce((total, point) => total + point.y, 0);
  const sumXY = points.reduce((total, point) => total + point.x * point.y, 0);
  const sumXX = points.reduce((total, point) => total + point.x * point.x, 0);
  const denominator = count * sumXX - sumX * sumX;

  if (denominator === 0) {
    const averageY = roundMetric(sumY / count);
    return [
      { delayDays: minDelay, reviewScoreAvg: averageY },
      { delayDays: maxDelay, reviewScoreAvg: averageY },
    ];
  }

  const slope = (count * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / count;

  return [
    {
      delayDays: minDelay,
      reviewScoreAvg: roundMetric(Math.max(1, Math.min(5, intercept + slope * minDelay))),
    },
    {
      delayDays: maxDelay,
      reviewScoreAvg: roundMetric(Math.max(1, Math.min(5, intercept + slope * maxDelay))),
    },
  ];
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

const customerStateByCustomerId = new Map();
const translatedCategoryByRawCategory = new Map();
const categoryByProductId = new Map();
const orderMetricsById = new Map();
const orderCategoriesById = new Map();

await readCsvRows(customersCsvPath, (row) => {
  customerStateByCustomerId.set(row.customer_id, (row.customer_state ?? '').trim() || UNKNOWN_STATE);
});

await readCsvRows(categoryTranslationCsvPath, (row) => {
  translatedCategoryByRawCategory.set(
    (row.product_category_name ?? '').trim(),
    (row.product_category_name_english ?? '').trim(),
  );
});

await readCsvRows(productsCsvPath, (row) => {
  const rawCategory = (row.product_category_name ?? '').trim();
  categoryByProductId.set(
    row.product_id,
    normaliseCategory(rawCategory, translatedCategoryByRawCategory.get(rawCategory) ?? ''),
  );
});

await readCsvRows(orderItemsCsvPath, (row) => {
  const price = Number.parseFloat(row.price ?? '0');
  const freightValue = Number.parseFloat(row.freight_value ?? '0');
  const safePrice = Number.isNaN(price) ? 0 : roundCurrency(price);
  const safeFreightValue = Number.isNaN(freightValue) ? 0 : roundCurrency(freightValue);
  const currentMetrics = orderMetricsById.get(row.order_id) ?? {
    gmv: 0,
    freightValue: 0,
  };

  orderMetricsById.set(row.order_id, {
    gmv: roundCurrency(currentMetrics.gmv + safePrice),
    freightValue: roundCurrency(currentMetrics.freightValue + safeFreightValue),
  });

  const category = categoryByProductId.get(row.product_id) ?? {
    key: UNKNOWN_CATEGORY_KEY,
    label: UNKNOWN_CATEGORY_LABEL,
  };
  const categoriesForOrder = orderCategoriesById.get(row.order_id) ?? new Map();
  const currentCategoryMetrics = categoriesForOrder.get(category.key) ?? {
    categoryKey: category.key,
    categoryLabel: category.label,
    itemCount: 0,
    totalGmv: 0,
  };

  categoriesForOrder.set(category.key, {
    categoryKey: category.key,
    categoryLabel: category.label,
    itemCount: currentCategoryMetrics.itemCount + 1,
    totalGmv: roundCurrency(currentCategoryMetrics.totalGmv + safePrice),
  });
  orderCategoriesById.set(row.order_id, categoriesForOrder);
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
  const delayDays =
    deliveredDate.length === 10 && estimatedDate.length === 10
      ? getDateDiffInDays(deliveredDate, estimatedDate)
      : null;

  qualifyingOrders.push({
    orderId: row.order_id,
    purchaseDate,
    month: purchaseDate.slice(0, 7),
    gmv: orderMetrics.gmv,
    freightValue: orderMetrics.freightValue,
    isOnTime:
      deliveredDate.length === 10 && estimatedDate.length === 10 && deliveredDate <= estimatedDate,
    delayDays,
    customerState: customerStateByCustomerId.get(row.customer_id) ?? UNKNOWN_STATE,
    categories: Array.from((orderCategoriesById.get(row.order_id) ?? new Map()).values()),
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

const reviewsByOrder = new Map();

await readCsvRows(orderReviewsCsvPath, (row) => {
  if (!qualifyingOrderIds.has(row.order_id)) {
    return;
  }

  const reviewScore = Number.parseFloat(row.review_score ?? '0');
  const safeReviewScore = Number.isNaN(reviewScore) ? 0 : reviewScore;
  const currentReviewSummary = reviewsByOrder.get(row.order_id) ?? {
    reviewRowCount: 0,
    reviewScoreSum: 0,
  };

  reviewsByOrder.set(row.order_id, {
    reviewRowCount: currentReviewSummary.reviewRowCount + 1,
    reviewScoreSum: currentReviewSummary.reviewScoreSum + safeReviewScore,
  });
});

const artifact = {
  metadata: {
    source: 'olist',
    version: '0.3.0',
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
  customerStateOptionsByRange: {},
  productCategoryOptionsByRange: {},
  paymentPanelsByRange: {},
  geographyPanelsByRange: {},
  categoryPanelsByRange: {},
  reviewPanelsByRange: {},
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
        delayedOrders: 0,
      },
    ]),
  );

  let totalOrders = 0;
  let totalGmv = 0;
  let delayedOrders = 0;
  let totalCategoryItems = 0;
  const rangeOrders = [];
  const stateMetricsByState = new Map();
  const categoryMetricsByKey = new Map();

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
      monthEntry.delayedOrders += order.isOnTime ? 0 : 1;
    }

    delayedOrders += order.isOnTime ? 0 : 1;

    const stateMetric = stateMetricsByState.get(order.customerState) ?? {
      state: order.customerState,
      label: order.customerState,
      orderCount: 0,
      totalGmv: 0,
      delayedOrderCount: 0,
    };

    stateMetric.orderCount += 1;
    stateMetric.totalGmv = roundCurrency(stateMetric.totalGmv + order.gmv);
    stateMetric.delayedOrderCount += order.isOnTime ? 0 : 1;
    stateMetricsByState.set(order.customerState, stateMetric);

    for (const category of order.categories) {
      const categoryMetric = categoryMetricsByKey.get(category.categoryKey) ?? {
        categoryKey: category.categoryKey,
        categoryLabel: category.categoryLabel,
        orderCount: 0,
        itemCount: 0,
        totalGmv: 0,
      };

      categoryMetric.orderCount += 1;
      categoryMetric.itemCount += category.itemCount;
      categoryMetric.totalGmv = roundCurrency(categoryMetric.totalGmv + category.totalGmv);
      totalCategoryItems += category.itemCount;
      categoryMetricsByKey.set(category.categoryKey, categoryMetric);
    }
  }

  artifact.kpisByRange[range.id] = {
    totalOrders,
    totalGmv: roundCurrency(totalGmv),
    lateDeliveryRate: totalOrders === 0 ? 0 : roundPercentage((delayedOrders / totalOrders) * 100),
  };
  artifact.monthlySeriesByRange[range.id] = Array.from(seriesByMonth.values()).map((monthEntry) => ({
    month: monthEntry.month,
    label: monthEntry.label,
    orders: monthEntry.orders,
    gmv: monthEntry.gmv,
    lateDeliveryRate:
      monthEntry.orders === 0
        ? 0
        : roundPercentage((monthEntry.delayedOrders / monthEntry.orders) * 100),
  }));

  const stateMetrics = Array.from(stateMetricsByState.values())
    .map((stateMetric) => ({
      state: stateMetric.state,
      label: stateMetric.label,
      orderCount: stateMetric.orderCount,
      totalGmv: stateMetric.totalGmv,
      lateDeliveryRate:
        stateMetric.orderCount === 0
          ? 0
          : roundPercentage((stateMetric.delayedOrderCount / stateMetric.orderCount) * 100),
    }))
    .sort(compareByOrderCountThenLabel);

  artifact.customerStateOptionsByRange[range.id] = buildDimensionOptions(
    'All States',
    ALL_STATES_VALUE,
    stateMetrics.map((stateMetric) => ({
      value: stateMetric.state,
      label: stateMetric.label,
      orderCount: stateMetric.orderCount,
    })),
    totalOrders,
  );
  artifact.geographyPanelsByRange[range.id] = {
    totalOrders,
    totalStates: stateMetrics.length,
    stateMetrics,
  };

  const categories = Array.from(categoryMetricsByKey.values())
    .sort(compareCategories)
    .map((categoryMetric) => ({
      categoryKey: categoryMetric.categoryKey,
      categoryLabel: categoryMetric.categoryLabel,
      orderCount: categoryMetric.orderCount,
      itemCount: categoryMetric.itemCount,
      totalGmv: categoryMetric.totalGmv,
      shareOfItems:
        totalCategoryItems === 0 ? 0 : roundPercentage((categoryMetric.itemCount / totalCategoryItems) * 100),
    }));

  artifact.productCategoryOptionsByRange[range.id] = buildDimensionOptions(
    'All Categories',
    ALL_CATEGORIES_VALUE,
    categories.map((category) => ({
      value: category.categoryKey,
      label: category.categoryLabel,
      orderCount: category.orderCount,
    })),
    totalOrders,
  );
  artifact.categoryPanelsByRange[range.id] = {
    shareBasis: 'item_count',
    totals: {
      totalOrders,
      totalItems: totalCategoryItems,
      totalGmv: roundCurrency(totalGmv),
    },
    categories,
    topCategory: categories[0] ?? null,
  };

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

  const reviewPopulation = [];
  const bucketByDelayDays = new Map();
  let reviewRowCount = 0;

  for (const order of rangeOrders) {
    const reviewSummary = reviewsByOrder.get(order.orderId);

    if (!reviewSummary || order.delayDays === null) {
      continue;
    }

    const averageReviewScore = reviewSummary.reviewScoreSum / reviewSummary.reviewRowCount;
    const bucketDelayDays = Math.max(MIN_DELAY_BUCKET, Math.min(MAX_DELAY_BUCKET, order.delayDays));
    reviewRowCount += reviewSummary.reviewRowCount;
    reviewPopulation.push({
      x: bucketDelayDays,
      y: averageReviewScore,
    });

    const currentBucket = bucketByDelayDays.get(bucketDelayDays) ?? {
      delayDays: bucketDelayDays,
      reviewScoreSum: 0,
      orderCount: 0,
    };

    currentBucket.reviewScoreSum += averageReviewScore;
    currentBucket.orderCount += 1;
    bucketByDelayDays.set(bucketDelayDays, currentBucket);
  }

  const points = Array.from(bucketByDelayDays.values())
    .sort((left, right) => left.delayDays - right.delayDays)
    .map((bucket) => ({
      delayDays: bucket.delayDays,
      reviewScoreAvg: roundMetric(bucket.reviewScoreSum / bucket.orderCount),
      orderCount: bucket.orderCount,
    }));
  const minDelay = points[0]?.delayDays ?? 0;
  const maxDelay = points[points.length - 1]?.delayDays ?? 0;

  artifact.reviewPanelsByRange[range.id] = {
    population: {
      totalOrders,
      reviewedOrderCount: reviewPopulation.length,
      missingReviewOrderCount: totalOrders - reviewPopulation.length,
      reviewRowCount,
    },
    delayDaysDomain: {
      min: minDelay,
      max: maxDelay,
    },
    correlation: calculatePearsonCorrelation(reviewPopulation),
    points,
    trendLine: buildTrendLine(reviewPopulation, minDelay, maxDelay),
  };
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
