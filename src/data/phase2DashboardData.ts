import type {
  DateRangeId,
  FilterId,
  PaymentTypeId,
  Phase2DashboardArtifact,
  Phase2DateRange,
  Phase2DimensionOption,
  Phase2Kpis,
  Phase2MetricDefinition,
  Phase2MetricId,
  Phase2MonthlyPoint,
  Phase2OrderFact,
  Phase2PaymentPanelSlice,
  Phase2PaymentRangePanels,
  Phase2PaymentTypeOption,
  Phase3CategoryPanel,
  Phase3GeographyPanel,
  Phase3ReviewPanel,
} from './phase2DashboardTypes';
import { loadPhase2DashboardArtifact } from './phase2DashboardArtifactLoader';

type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig = {
  label: string;
  options: FilterOption[];
  disabled?: boolean;
  helperText?: string;
};

type KpiCardViewModel = {
  title: string;
  value: string;
  icon: 'orders' | 'gmv' | 'delay' | 'review';
  chipClassName: string;
  caption: string;
};

type TimeTrendSummary = {
  rangeLabel: string;
  rangeStart: string;
  rangeEnd: string;
  monthsCovered: number;
  averageOrders: number;
  averageGmv: number;
  lateDeliveryRate: number;
};

type CohortAggregate = {
  kpis: Phase2Kpis;
  monthlySeries: Phase2MonthlyPoint[];
  customerStateOptions: Phase2DimensionOption[];
  productCategoryOptions: Phase2DimensionOption[];
  categoryPanel: Phase3CategoryPanel;
  paymentPanels: Phase2PaymentRangePanels;
  reviewPanel: Phase3ReviewPanel;
};

let phase2DashboardArtifact: Phase2DashboardArtifact | null = null;
let phase2DashboardArtifactPromise: Promise<Phase2DashboardArtifact> | null = null;
let dateRangeById = {} as Record<DateRangeId, Phase2DateRange>;
const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat('en-US');

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const PAYMENT_TYPE_ORDER = ['credit_card', 'boleto', 'voucher', 'debit_card', 'not_defined'];
const PAYMENT_TYPE_LABELS: Record<string, string> = {
  all: 'All Payment Types',
  credit_card: 'Credit Card',
  boleto: 'Boleto',
  voucher: 'Voucher',
  debit_card: 'Debit Card',
  not_defined: 'Not Defined',
};
const MIN_DELAY_BUCKET = -14;
const MAX_DELAY_BUCKET = 60;
export const ALL_STATES_VALUE = 'all-states';
export const ALL_CATEGORIES_VALUE = 'all-categories';
const rangeFactsCache = new Map<DateRangeId, Phase2OrderFact[]>();
const cohortAggregateCache = new Map<string, CohortAggregate>();

function setPhase2DashboardArtifact(artifact: Phase2DashboardArtifact) {
  phase2DashboardArtifact = artifact;
  dateRangeById = Object.fromEntries(
    artifact.dateRanges.map((range) => [range.id, range]),
  ) as Record<DateRangeId, Phase2DateRange>;
  rangeFactsCache.clear();
  cohortAggregateCache.clear();
}

export async function ensurePhase2DashboardArtifactLoaded(): Promise<Phase2DashboardArtifact> {
  if (phase2DashboardArtifact) {
    return phase2DashboardArtifact;
  }

  phase2DashboardArtifactPromise ??= loadPhase2DashboardArtifact().then((artifact) => {
    setPhase2DashboardArtifact(artifact);
    return artifact;
  });

  return phase2DashboardArtifactPromise;
}

export function getPhase2DashboardArtifact(): Phase2DashboardArtifact {
  if (!phase2DashboardArtifact) {
    throw new Error(
      'Phase 2 dashboard artifact is not loaded yet. Call ensurePhase2DashboardArtifactLoaded() first.',
    );
  }

  return phase2DashboardArtifact;
}

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

function roundPercentage(value: number): number {
  return Number(value.toFixed(2));
}

function roundMetric(value: number): number {
  return Number(value.toFixed(2));
}

function buildMonthKeys(start: string, end: string): string[] {
  const months: string[] = [];
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

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const monthLabel = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const yearLabel = String(year).slice(-2);
  return `${monthLabel} '${yearLabel}`;
}

function isWithinRange(dateText: string, start: string, end: string): boolean {
  return dateText >= start && dateText <= end;
}

function compareByOrderCountThenLabel(
  left: { label: string; orderCount: number },
  right: { label: string; orderCount: number },
): number {
  if (right.orderCount !== left.orderCount) {
    return right.orderCount - left.orderCount;
  }

  return left.label.localeCompare(right.label);
}

function compareCategories(
  left: { categoryLabel: string; itemCount: number; totalGmv: number },
  right: { categoryLabel: string; itemCount: number; totalGmv: number },
): number {
  if (right.itemCount !== left.itemCount) {
    return right.itemCount - left.itemCount;
  }

  if (right.totalGmv !== left.totalGmv) {
    return right.totalGmv - left.totalGmv;
  }

  return left.categoryLabel.localeCompare(right.categoryLabel);
}

function buildDimensionOptions(
  allLabel: string,
  allValue: string,
  rows: Phase2DimensionOption[],
  totalOrders: number,
): Phase2DimensionOption[] {
  return [
    {
      value: allValue,
      label: allLabel,
      orderCount: totalOrders,
    },
    ...rows,
  ];
}

function formatPaymentTypeLabel(paymentType: string): string {
  return (
    PAYMENT_TYPE_LABELS[paymentType] ??
    paymentType
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

function buildPaymentTypeOrder(paymentTypeSet: Set<string>): string[] {
  const knownTypes = PAYMENT_TYPE_ORDER.filter((paymentType) => paymentTypeSet.has(paymentType));
  const unknownTypes = Array.from(paymentTypeSet).filter(
    (paymentType) => !PAYMENT_TYPE_ORDER.includes(paymentType),
  );

  unknownTypes.sort((left, right) => left.localeCompare(right));
  return ['all', ...knownTypes, ...unknownTypes];
}

function calculatePearsonCorrelation(points: Array<{ x: number; y: number }>): number {
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

function buildTrendLine(
  points: Array<{ x: number; y: number }>,
  minDelay: number,
  maxDelay: number,
) {
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

function buildPaymentSlice(
  matchedOrders: Phase2OrderFact[],
  paymentType: string,
): Phase2PaymentPanelSlice {
  const cohortOrders =
    paymentType === 'all'
      ? matchedOrders
      : matchedOrders.filter((order) =>
          order.payments.some((paymentRow) => paymentRow.paymentType === paymentType),
        );

  const freightBands = [
    { band: '0-10', min: 0, maxExclusive: 10 },
    { band: '10-20', min: 10, maxExclusive: 20 },
    { band: '20-30', min: 20, maxExclusive: 30 },
    { band: '30-40', min: 30, maxExclusive: 40 },
    { band: '40-50', min: 40, maxExclusive: 50 },
    { band: '50-75', min: 50, maxExclusive: 75 },
    { band: '75-100', min: 75, maxExclusive: 100 },
    { band: '100+', min: 100, maxExclusive: Number.POSITIVE_INFINITY },
  ].map(({ band }) => ({
    band,
    orderCount: 0,
  }));
  const freightBandById = new Map(freightBands.map((entry) => [entry.band, entry]));
  const paymentValueByType = new Map<string, number>();
  const paymentRowCountByType = new Map<string, number>();
  const freightValues: number[] = [];

  let totalFreightValue = 0;
  let paymentRowCount = 0;
  let totalPaymentValue = 0;
  let onTimeOrderCount = 0;

  for (const order of cohortOrders) {
    totalFreightValue += order.freightValue;
    freightValues.push(order.freightValue);

    const band =
      order.freightValue < 10
        ? '0-10'
        : order.freightValue < 20
          ? '10-20'
          : order.freightValue < 30
            ? '20-30'
            : order.freightValue < 40
              ? '30-40'
              : order.freightValue < 50
                ? '40-50'
                : order.freightValue < 75
                  ? '50-75'
                  : order.freightValue < 100
                    ? '75-100'
                    : '100+';
    const freightBand = freightBandById.get(band);

    if (freightBand) {
      freightBand.orderCount += 1;
    }

    if (order.isOnTime) {
      onTimeOrderCount += 1;
    }

    for (const paymentRow of order.payments) {
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

  const sortedFreightValues = [...freightValues].sort((left, right) => left - right);
  const middleIndex = Math.floor(sortedFreightValues.length / 2);
  const medianFreightValue =
    sortedFreightValues.length === 0
      ? 0
      : sortedFreightValues.length % 2 === 1
        ? roundCurrency(sortedFreightValues[middleIndex] ?? 0)
        : roundCurrency(
            ((sortedFreightValues[middleIndex - 1] ?? 0) + (sortedFreightValues[middleIndex] ?? 0)) / 2,
          );
  const delayedOrderCount = cohortOrders.length - onTimeOrderCount;
  const paymentTypes = buildPaymentTypeOrder(new Set(paymentValueByType.keys())).filter(
    (candidate) => candidate !== 'all',
  );

  return {
    paymentType: paymentType as PaymentTypeId,
    orderCount: cohortOrders.length,
    paymentRowCount,
    freightDistribution: {
      totalOrders: cohortOrders.length,
      totalFreightValue: roundCurrency(totalFreightValue),
      avgFreightValue:
        cohortOrders.length === 0 ? 0 : roundCurrency(totalFreightValue / cohortOrders.length),
      medianFreightValue,
      bands: freightBands,
    },
    paymentMix: {
      totalPaymentRowCount: paymentRowCount,
      totalPaymentValue: roundCurrency(totalPaymentValue),
      entries: paymentTypes.map((candidate) => ({
        paymentType: candidate as Exclude<PaymentTypeId, 'all'>,
        label: formatPaymentTypeLabel(candidate),
        paymentRowCount: paymentRowCountByType.get(candidate) ?? 0,
        paymentValue: paymentValueByType.get(candidate) ?? 0,
      })),
    },
    onTimeVsDelayed: {
      totalOrders: cohortOrders.length,
      onTimeOrderCount,
      delayedOrderCount,
      onTimeRate:
        cohortOrders.length === 0 ? 0 : roundPercentage((onTimeOrderCount / cohortOrders.length) * 100),
      delayedRate:
        cohortOrders.length === 0 ? 0 : roundPercentage((delayedOrderCount / cohortOrders.length) * 100),
    },
  };
}

function getDateRangeFacts(rangeId: DateRangeId): Phase2OrderFact[] {
  const cached = rangeFactsCache.get(rangeId);

  if (cached) {
    return cached;
  }

  const range = getDateRangeById(rangeId);
  const facts = getPhase2DashboardArtifact().orderFacts.filter((order) =>
    isWithinRange(order.purchaseDate, range.start, range.end),
  );
  rangeFactsCache.set(rangeId, facts);
  return facts;
}

function getCohortFacts(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): Phase2OrderFact[] {
  return getDateRangeFacts(rangeId).filter((order) => {
    if (customerState !== ALL_STATES_VALUE && order.customerState !== customerState) {
      return false;
    }

    if (productCategory !== ALL_CATEGORIES_VALUE) {
      return order.categories.some((category) => category.categoryKey === productCategory);
    }

    return true;
  });
}

function buildCohortAggregate(
  range: Phase2DateRange,
  cohortFacts: Phase2OrderFact[],
): CohortAggregate {
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
  const stateMetricsByState = new Map<
    string,
    { label: string; orderCount: number; totalGmv: number; delayedOrderCount: number }
  >();
  const categoryMetricsByKey = new Map<
    string,
    { categoryLabel: string; orderCount: number; itemCount: number; totalGmv: number }
  >();

  for (const order of cohortFacts) {
    totalOrders += 1;
    totalGmv += order.gmv;
    delayedOrders += order.isOnTime ? 0 : 1;

    const monthEntry = seriesByMonth.get(order.month);
    if (monthEntry) {
      monthEntry.orders += 1;
      monthEntry.gmv = roundCurrency(monthEntry.gmv + order.gmv);
      monthEntry.delayedOrders += order.isOnTime ? 0 : 1;
    }

    const stateMetric = stateMetricsByState.get(order.customerState) ?? {
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
        categoryLabel: category.categoryLabel,
        orderCount: 0,
        itemCount: 0,
        totalGmv: 0,
      };
      categoryMetric.orderCount += 1;
      categoryMetric.itemCount += category.itemCount;
      categoryMetric.totalGmv = roundCurrency(categoryMetric.totalGmv + category.totalGmv);
      categoryMetricsByKey.set(category.categoryKey, categoryMetric);
      totalCategoryItems += category.itemCount;
    }
  }

  const kpis: Phase2Kpis = {
    totalOrders,
    totalGmv: roundCurrency(totalGmv),
    lateDeliveryRate: totalOrders === 0 ? 0 : roundPercentage((delayedOrders / totalOrders) * 100),
  };

  const monthlySeries: Phase2MonthlyPoint[] = Array.from(seriesByMonth.values()).map((monthEntry) => ({
    month: monthEntry.month,
    label: monthEntry.label,
    orders: monthEntry.orders,
    gmv: monthEntry.gmv,
    lateDeliveryRate:
      monthEntry.orders === 0
        ? 0
        : roundPercentage((monthEntry.delayedOrders / monthEntry.orders) * 100),
  }));

  const customerStateOptions = buildDimensionOptions(
    'All States',
    ALL_STATES_VALUE,
    Array.from(stateMetricsByState.entries())
      .map(([state, metric]) => ({
        value: state,
        label: metric.label,
        orderCount: metric.orderCount,
      }))
      .sort(compareByOrderCountThenLabel),
    totalOrders,
  );

  const categories = Array.from(categoryMetricsByKey.entries())
    .map(([categoryKey, metric]) => ({
      categoryKey,
      categoryLabel: metric.categoryLabel,
      orderCount: metric.orderCount,
      itemCount: metric.itemCount,
      totalGmv: metric.totalGmv,
      shareOfItems:
        totalCategoryItems === 0 ? 0 : roundPercentage((metric.itemCount / totalCategoryItems) * 100),
    }))
    .sort(compareCategories);

  const productCategoryOptions = buildDimensionOptions(
    'All Categories',
    ALL_CATEGORIES_VALUE,
    categories.map((category) => ({
      value: category.categoryKey,
      label: category.categoryLabel,
      orderCount: category.orderCount,
    })),
    totalOrders,
  );

  const categoryPanel: Phase3CategoryPanel = {
    shareBasis: 'item_count',
    totals: {
      totalOrders,
      totalItems: totalCategoryItems,
      totalGmv: roundCurrency(totalGmv),
    },
    categories,
    topCategory: categories[0] ?? null,
  };

  const paymentTypesInRange = new Set<string>();
  for (const order of cohortFacts) {
    for (const paymentRow of order.payments) {
      paymentTypesInRange.add(paymentRow.paymentType);
    }
  }
  const paymentTypeIds = buildPaymentTypeOrder(paymentTypesInRange);
  const slicesByPaymentType: Record<string, Phase2PaymentPanelSlice> = {};
  for (const paymentType of paymentTypeIds) {
    slicesByPaymentType[paymentType] = buildPaymentSlice(cohortFacts, paymentType);
  }
  const paymentPanels: Phase2PaymentRangePanels = {
    paymentTypeOptions: paymentTypeIds.map((paymentType) => ({
      value: paymentType as PaymentTypeId,
      label: formatPaymentTypeLabel(paymentType),
      orderCount: slicesByPaymentType[paymentType]?.orderCount ?? 0,
    })),
    slicesByPaymentType,
  };

  const reviewPopulation: Array<{ x: number; y: number }> = [];
  const bucketByDelayDays = new Map<number, { delayDays: number; reviewScoreSum: number; orderCount: number }>();
  let reviewRowCount = 0;

  for (const order of cohortFacts) {
    if (!order.review || order.delayDays === null) {
      continue;
    }

    const averageReviewScore = order.review.reviewScoreSum / order.review.reviewRowCount;
    const bucketDelayDays = Math.max(MIN_DELAY_BUCKET, Math.min(MAX_DELAY_BUCKET, order.delayDays));
    reviewRowCount += order.review.reviewRowCount;
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

  const reviewPanel: Phase3ReviewPanel = {
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

  return {
    kpis,
    monthlySeries,
    customerStateOptions,
    productCategoryOptions,
    categoryPanel,
    paymentPanels,
    reviewPanel,
  };
}

function getCohortAggregate(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): CohortAggregate {
  const cacheKey = `${rangeId}::${customerState}::${productCategory}`;
  const cached = cohortAggregateCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const aggregate = buildCohortAggregate(
    getDateRangeById(rangeId),
    getCohortFacts(rangeId, customerState, productCategory),
  );
  cohortAggregateCache.set(cacheKey, aggregate);
  return aggregate;
}

function toFilterOptions(options: Phase2DimensionOption[] | Phase2PaymentTypeOption[]): FilterOption[] {
  return options.map((option) => ({
    label: option.label,
    value: option.value,
  }));
}

export function getMetricDefinition(metricId: Phase2MetricId): Phase2MetricDefinition {
  return getPhase2DashboardArtifact().metadata.metricDefinitions[metricId];
}

export function buildMetricCaption(metricId: Phase2MetricId, rangeLabel: string): string {
  return `${getMetricDefinition(metricId).caption}, ${rangeLabel}`;
}

export function buildFilterOptions(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): Record<FilterId, FilterConfig> {
  const stateScopedOptions = getCohortAggregate(rangeId, ALL_STATES_VALUE, productCategory);
  const categoryScopedOptions = getCohortAggregate(rangeId, customerState, ALL_CATEGORIES_VALUE);
  const activeCohort = getCohortAggregate(rangeId, customerState, productCategory);

  return {
    dateRange: {
      label: 'Date Range',
      options: getPhase2DashboardArtifact().dateRanges.map((range) => ({
        label: range.label,
        value: range.id,
      })),
      helperText: 'Applies to all panels.',
    },
    customerState: {
      label: 'Customer State',
      options: toFilterOptions(stateScopedOptions.customerStateOptions),
      helperText:
        productCategory === ALL_CATEGORIES_VALUE
          ? 'Applies to KPIs, Trend, Payment, Review, and Category Share.'
          : 'Applies within the selected product category.',
    },
    productCategory: {
      label: 'Product Category',
      options: toFilterOptions(categoryScopedOptions.productCategoryOptions),
      helperText:
        customerState === ALL_STATES_VALUE
          ? 'Applies to KPIs, Trend, Payment, Review, and Category Share.'
          : 'Applies within the selected customer state.',
    },
    paymentType: {
      label: 'Payment Type',
      options: toFilterOptions(activeCohort.paymentPanels.paymentTypeOptions),
      helperText: 'Applies to payment panels only.',
    },
  };
}

export function getDateRangeById(rangeId: DateRangeId): Phase2DateRange {
  return dateRangeById[rangeId];
}

export function buildKpiCards(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): KpiCardViewModel[] {
  const range = getDateRangeById(rangeId);
  const cohort = getCohortAggregate(rangeId, customerState, productCategory);
  const kpis = cohort.kpis;
  const reviewPanel = cohort.reviewPanel;
  const reviewedOrderCount = reviewPanel.points.reduce((total, point) => total + point.orderCount, 0);
  const averageReviewScore =
    reviewedOrderCount === 0
      ? 0
      : reviewPanel.points.reduce(
          (total, point) => total + point.reviewScoreAvg * point.orderCount,
          0,
        ) / reviewedOrderCount;

  return [
    {
      title: 'Total Orders',
      value: compactNumberFormatter.format(kpis.totalOrders),
      icon: 'orders',
      chipClassName: 'bg-blue-50 text-accent-blue',
      caption: buildMetricCaption('totalOrders', range.label),
    },
    {
      title: 'Total GMV',
      value: compactCurrencyFormatter.format(kpis.totalGmv),
      icon: 'gmv',
      chipClassName: 'bg-emerald-50 text-accent-teal',
      caption: buildMetricCaption('totalGmv', range.label),
    },
    {
      title: 'Late Delivery Rate',
      value: `${kpis.lateDeliveryRate.toFixed(1)}%`,
      icon: 'delay',
      chipClassName: 'bg-orange-50 text-orange-500',
      caption: buildMetricCaption('lateDeliveryRate', range.label),
    },
    {
      title: 'Avg Review Score',
      value: `${averageReviewScore.toFixed(1)} / 5`,
      icon: 'review',
      chipClassName: 'bg-amber-50 text-amber-500',
      caption: `Reviewed delivered orders, ${range.label}`,
    },
  ];
}

export function getMonthlySeries(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): Phase2MonthlyPoint[] {
  return getCohortAggregate(rangeId, customerState, productCategory).monthlySeries;
}

export function getPaymentPanelsByRange(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): Phase2PaymentRangePanels {
  return getCohortAggregate(rangeId, customerState, productCategory).paymentPanels;
}

export function getGeographyPanel(rangeId: DateRangeId): Phase3GeographyPanel {
  return getPhase2DashboardArtifact().geographyPanelsByRange[rangeId];
}

export function getCategoryPanel(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): Phase3CategoryPanel {
  return getCohortAggregate(rangeId, customerState, ALL_CATEGORIES_VALUE).categoryPanel;
}

export function getReviewPanel(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): Phase3ReviewPanel {
  return getCohortAggregate(rangeId, customerState, productCategory).reviewPanel;
}

export function getPaymentTypeOptions(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): Phase2PaymentTypeOption[] {
  return getPaymentPanelsByRange(rangeId, customerState, productCategory).paymentTypeOptions;
}

export function getCustomerStateOptions(
  rangeId: DateRangeId,
  productCategory: string = ALL_CATEGORIES_VALUE,
): Phase2DimensionOption[] {
  return getCohortAggregate(rangeId, ALL_STATES_VALUE, productCategory).customerStateOptions;
}

export function getProductCategoryOptions(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): Phase2DimensionOption[] {
  return getCohortAggregate(rangeId, customerState, ALL_CATEGORIES_VALUE).productCategoryOptions;
}

export function getPaymentPanelSlice(
  rangeId: DateRangeId,
  paymentType: PaymentTypeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): Phase2PaymentPanelSlice {
  const paymentPanels = getPaymentPanelsByRange(rangeId, customerState, productCategory);
  const fallbackSlice = paymentPanels.slicesByPaymentType.all;

  return paymentPanels.slicesByPaymentType[paymentType] ?? fallbackSlice;
}

export function getTimeTrendSummary(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): TimeTrendSummary {
  const range = getDateRangeById(rangeId);
  const cohort = getCohortAggregate(rangeId, customerState, productCategory);
  const monthsCovered = cohort.monthlySeries.length || 1;

  return {
    rangeLabel: range.label,
    rangeStart: range.start,
    rangeEnd: range.end,
    monthsCovered: cohort.monthlySeries.length,
    averageOrders: cohort.kpis.totalOrders / monthsCovered,
    averageGmv: cohort.kpis.totalGmv / monthsCovered,
    lateDeliveryRate: cohort.kpis.lateDeliveryRate,
  };
}

export function formatOrderCount(value: number): string {
  return integerFormatter.format(value);
}

export function formatOrderCountCompact(value: number): string {
  return compactNumberFormatter.format(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCurrencyCompact(value: number): string {
  return compactCurrencyFormatter.format(value);
}
