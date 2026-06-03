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
const outputPath = path.join(projectRoot, 'src', 'data', 'phase2DashboardArtifact.json');

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

const orderPriceById = new Map();

await readCsvRows(orderItemsCsvPath, (row) => {
  const price = Number.parseFloat(row.price ?? '0');

  if (Number.isNaN(price)) {
    return;
  }

  orderPriceById.set(row.order_id, roundCurrency((orderPriceById.get(row.order_id) ?? 0) + price));
});

const qualifyingOrders = [];

await readCsvRows(ordersCsvPath, (row) => {
  const purchaseDate = (row.order_purchase_timestamp ?? '').slice(0, 10);

  if (
    row.order_status !== 'delivered' ||
    purchaseDate.length !== 10 ||
    !isWithinRange(purchaseDate, COVERAGE_START, COVERAGE_END)
  ) {
    return;
  }

  qualifyingOrders.push({
    orderId: row.order_id,
    purchaseDate,
    month: purchaseDate.slice(0, 7),
    gmv: orderPriceById.get(row.order_id) ?? 0,
  });
});

const artifact = {
  metadata: {
    source: 'olist',
    version: '0.1.0',
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

  for (const order of qualifyingOrders) {
    if (!isWithinRange(order.purchaseDate, range.start, range.end)) {
      continue;
    }

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
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
