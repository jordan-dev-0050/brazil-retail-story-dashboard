import {
  ALL_CATEGORIES_VALUE,
  ALL_STATES_VALUE,
  buildFilterOptions as buildPhase2FilterOptions,
  buildKpiCards as buildPhase2KpiCards,
  formatCurrency,
  formatCurrencyCompact,
  formatOrderCount,
  formatOrderCountCompact,
  getCategoryPanel,
  getDateRangeById,
  getGeographyPanel,
  getMonthlySeries,
  getPaymentPanelSlice,
  getPaymentTypeOptions,
  getReviewPanel,
  getMetricDefinition,
  getTimeTrendSummary,
  phase2DashboardArtifact,
} from './phase2DashboardData';
import {
  timeTrendSeries as mockTimeTrendSeries,
  type TimeGranularity,
} from './dashboardMock';
import type {
  DateRangeId,
  DashboardPaymentPanelSlice,
  DashboardPaymentTypeOption,
  FilterId,
  PaymentTypeId,
} from './dashboardTypes';

export type DashboardFilterOption = {
  label: string;
  value: string;
};

export type DashboardFilterConfig = {
  label: string;
  options: DashboardFilterOption[];
  disabled?: boolean;
  helperText?: string;
};

export type DashboardFilterOptions = Record<FilterId, DashboardFilterConfig>;

export type DashboardFilterContractStatus =
  | 'global-cohort-active'
  | 'staged-global-cohort'
  | 'secondary-slice-only'
  | 'focused-mode'
  | 'not-yet-applied';

export type DashboardFilterContractFilter = {
  filterId: FilterId;
  label: string;
  status: DashboardFilterContractStatus;
  summary: string;
};

export type DashboardFilterContractPanel = {
  id:
    | 'kpi-cards'
    | 'time-trend'
    | 'payment-panels'
    | 'delay-review'
    | 'brazil-map'
    | 'category-share';
  label: string;
  status: DashboardFilterContractStatus;
  summary: string;
};

export type DashboardFilterContract = {
  headline: string;
  description: string;
  status: DashboardFilterContractStatus;
  filters: DashboardFilterContractFilter[];
  panels: DashboardFilterContractPanel[];
};

type KpiCardViewModel = {
  title: string;
  value: string;
  icon: 'orders' | 'gmv' | 'delivery' | 'delay' | 'review';
  chipClassName: string;
  caption?: string;
};

type TimeTrendPoint = {
  label: string;
  orders: number;
  gmv: number;
  delayRate: number;
};

type TimeTrendHighlight = {
  label: string;
  value: string;
  detail: string;
};

type TimeTrendMode = 'real-monthly' | 'projected';

type TimeTrendModel = {
  series: TimeTrendPoint[];
  highlights: TimeTrendHighlight[];
  subtitle: string;
  mode: TimeTrendMode;
};

export const dashboardArtifact = phase2DashboardArtifact;

const dateRangeOptions = dashboardArtifact.dateRanges.map((range) => ({
  label: range.label,
  value: range.id,
}));

const defaultRangeId = (dateRangeOptions[0]?.value ?? 'all') as DateRangeId;

export { formatCurrency, formatCurrencyCompact, formatOrderCount, formatOrderCountCompact };
export { ALL_CATEGORIES_VALUE, ALL_STATES_VALUE };

export function getDashboardFilterOptions(
  rangeId: Parameters<typeof getPaymentTypeOptions>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): DashboardFilterOptions {
  return buildPhase2FilterOptions(rangeId, customerState, productCategory);
}

export function getDashboardFilterContract(): DashboardFilterContract {
  return {
    headline: 'P06 P3 category-cohort contract',
    description:
      'Customer State and Product Category now form the active global cohort for KPI, Trend, Payment, and Review. Payment Type remains a secondary slice inside that cohort, Category Share uses focused-category semantics instead of collapsing to a single-category chart, and Brazil Map still keeps Product Category out of its range-scoped state view.',
    status: 'global-cohort-active',
    filters: [
      {
        filterId: 'customerState',
        label: 'Customer State',
        status: 'global-cohort-active',
        summary:
          'Single-value order-level cohort. It is active now across KPI, Trend, Payment, Review, and Category Share, with focused-mode handling on Brazil Map.',
      },
      {
        filterId: 'productCategory',
        label: 'Product Category',
        status: 'global-cohort-active',
        summary:
          'Membership-based order cohort. KPI, Trend, Payment, and Review consume it directly now, while Category Share switches into focused-category mode.',
      },
      {
        filterId: 'paymentType',
        label: 'Payment Type',
        status: 'secondary-slice-only',
        summary:
          'Remains outside the global cohort. It only slices Freight, Payment Mix, and On-time vs Delayed within the selected date range.',
      },
    ],
    panels: [
      {
        id: 'kpi-cards',
        label: 'KPI Cards',
        status: 'global-cohort-active',
        summary:
          'Reads the same Customer State cohort as the rest of the supported summary layer.',
      },
      {
        id: 'time-trend',
        label: 'Time Trend',
        status: 'global-cohort-active',
        summary:
          'Monthly real-backed data and projected daily or weekly views now recalculate from the selected Customer State cohort.',
      },
      {
        id: 'payment-panels',
        label: 'Payment Panels',
        status: 'global-cohort-active',
        summary:
          'Customer State and Product Category define the matched order population first, then Payment Type continues to slice within that cohort.',
      },
      {
        id: 'delay-review',
        label: 'Delay vs Review',
        status: 'global-cohort-active',
        summary:
          'Review coverage now follows the selected Customer State cohort instead of staying date-range only.',
      },
      {
        id: 'brazil-map',
        label: 'Brazil Map',
        status: 'focused-mode',
        summary:
          'Requires special handling. Customer State uses focused-state mode, while Product Category is explicitly not applied on the range-scoped map.',
      },
      {
        id: 'category-share',
        label: 'Category Share',
        status: 'focused-mode',
        summary:
          'Keeps the full state cohort visible and highlights the selected Product Category instead of silently collapsing the ranking to one row.',
      },
    ],
  };
}

export function getInitialFilterValues(): Record<FilterId, string> {
  const initialFilterOptions = getDashboardFilterOptions(
    defaultRangeId,
    ALL_STATES_VALUE,
    ALL_CATEGORIES_VALUE,
  );

  return {
    dateRange: initialFilterOptions.dateRange.options[0]?.value ?? defaultRangeId,
    customerState: initialFilterOptions.customerState.options[0]?.value ?? 'all-states',
    productCategory: initialFilterOptions.productCategory.options[0]?.value ?? 'all-categories',
    paymentType: initialFilterOptions.paymentType.options[0]?.value ?? 'all',
  };
}

export function buildKpiCards(
  rangeId: Parameters<typeof buildPhase2KpiCards>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): KpiCardViewModel[] {
  return buildPhase2KpiCards(rangeId, customerState, productCategory);
}

function getTimeProjectionDivisor(granularity: Exclude<TimeGranularity, 'monthly'>): number {
  return granularity === 'daily' ? 30 : 4.3;
}

function roundNumber(value: number): number {
  return Number(value.toFixed(1));
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function parseUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function getUtcDaySpan(start: Date, end: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / millisecondsPerDay));
}

function getProjectedPointDate(
  pointIndex: number,
  pointCount: number,
  rangeStart: string,
  rangeEnd: string,
): Date {
  const start = parseUtcDate(rangeStart);
  const end = parseUtcDate(rangeEnd);
  const daySpan = getUtcDaySpan(start, end);

  if (pointCount <= 1 || daySpan === 0) {
    return start;
  }

  const offsetDays = Math.round((pointIndex / (pointCount - 1)) * daySpan);
  return addUtcDays(start, offsetDays);
}

function formatProjectedDailyLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

function formatProjectedWeeklyLabel(date: Date): string {
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(date);
  const weekOfMonth = Math.min(5, Math.floor((date.getUTCDate() - 1) / 7) + 1);

  return `${monthLabel} W${weekOfMonth}`;
}

function getProjectedLabel(
  granularity: Exclude<TimeGranularity, 'monthly'>,
  pointIndex: number,
  pointCount: number,
  summary: ReturnType<typeof getTimeTrendSummary>,
): string {
  const date = getProjectedPointDate(
    pointIndex,
    pointCount,
    summary.rangeStart,
    summary.rangeEnd,
  );

  return granularity === 'daily'
    ? formatProjectedDailyLabel(date)
    : formatProjectedWeeklyLabel(date);
}

function getMonthlyAnchorPoint(
  monthlySeries: ReturnType<typeof getMonthlySeries>,
  pointIndex: number,
  pointCount: number,
) {
  const slot = Math.min(
    monthlySeries.length - 1,
    Math.floor((pointIndex / Math.max(1, pointCount)) * monthlySeries.length),
  );

  return monthlySeries[Math.max(0, slot)];
}

function getProjectedTimeTrendSeries(
  granularity: Exclude<TimeGranularity, 'monthly'>,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): TimeTrendPoint[] {
  const template = mockTimeTrendSeries[granularity];
  const summary = getTimeTrendSummary(rangeId, customerState, productCategory);
  const monthlySeries = getMonthlySeries(rangeId, customerState, productCategory);
  const divisor = getTimeProjectionDivisor(granularity);
  const templateAverageOrders = average(template.map((point) => point.orders)) || 1;
  const templateAverageGmv = average(template.map((point) => point.gmv)) || 1;
  const templateAverageDelayRate = average(template.map((point) => point.delayRate));

  return template.map((point, index) => {
    const monthlyAnchor = getMonthlyAnchorPoint(monthlySeries, index, template.length);
    const projectedOrdersBaseline = monthlyAnchor.orders / divisor;
    const projectedGmvBaseline = monthlyAnchor.gmv / divisor;

    return {
      label: getProjectedLabel(granularity, index, template.length, summary),
      orders: Math.max(
        1,
        Math.round((point.orders / templateAverageOrders) * projectedOrdersBaseline),
      ),
      gmv: Math.max(1, Math.round((point.gmv / templateAverageGmv) * projectedGmvBaseline)),
      delayRate: roundNumber(
        Math.max(
          0,
          monthlyAnchor.lateDeliveryRate + (point.delayRate - templateAverageDelayRate),
        ),
      ),
    };
  });
}

function buildMonthlyTimeTrendModel(
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): TimeTrendModel {
  const summary = getTimeTrendSummary(rangeId, customerState, productCategory);

  return {
    series: getMonthlySeries(rangeId, customerState, productCategory).map((point) => ({
      label: point.label,
      orders: point.orders,
      gmv: point.gmv,
      delayRate: point.lateDeliveryRate,
    })),
    highlights: [
      {
        label: 'Avg Orders / Month',
        value: formatOrderCountCompact(summary.averageOrders),
        detail: `${summary.monthsCovered} real months covered`,
      },
      {
        label: 'Avg GMV / Month',
        value: formatCurrencyCompact(summary.averageGmv),
        detail: `Real monthly total ${formatCurrency(summary.averageGmv * summary.monthsCovered)}`,
      },
      {
        label: 'Late Delivery Rate',
        value: `${summary.lateDeliveryRate.toFixed(1)}%`,
        detail: `${getMetricDefinition('lateDeliveryRate').summary} (${summary.rangeLabel})`,
      },
    ],
    subtitle: 'Real monthly artifact data. Daily and weekly tabs switch to explicit projections.',
    mode: 'real-monthly',
  };
}

function buildProjectedTimeTrendModel(
  granularity: Exclude<TimeGranularity, 'monthly'>,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): TimeTrendModel {
  const projectedSeries = getProjectedTimeTrendSeries(
    granularity,
    rangeId,
    customerState,
    productCategory,
  );
  const summary = getTimeTrendSummary(rangeId, customerState, productCategory);
  const granularityLabel = granularity === 'daily' ? 'Day' : 'Week';
  const divisor = getTimeProjectionDivisor(granularity);
  const pointLabel = granularity === 'daily' ? 'days' : 'weeks';
  const ordersAverage = average(projectedSeries.map((point) => point.orders));
  const gmvAverage = average(projectedSeries.map((point) => point.gmv));
  const delayRateAverage = average(projectedSeries.map((point) => point.delayRate));

  return {
    series: projectedSeries,
    highlights: [
      {
        label: `Projected Orders / ${granularityLabel}`,
        value: formatOrderCountCompact(ordersAverage),
        detail: `Projected from ${summary.monthsCovered} real monthly points in ${summary.rangeLabel}`,
      },
      {
        label: `Projected GMV / ${granularityLabel}`,
        value: formatCurrencyCompact(gmvAverage),
        detail: `Scaled from the monthly artifact at about ${divisor.toFixed(1)} ${pointLabel} per month`,
      },
      {
        label: 'Late Delivery Rate',
        value: `${delayRateAverage.toFixed(1)}%`,
        detail: 'Projection preserves each month\'s real late-delivery baseline while interpolating intra-period shape',
      },
    ],
    subtitle: `Projected ${granularity} checkpoints derived from real monthly artifact data for ${summary.rangeLabel}`,
    mode: 'projected',
  };
}

export function getTimeTrendModel(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): TimeTrendModel {
  if (granularity === 'monthly') {
    return buildMonthlyTimeTrendModel(rangeId, customerState, productCategory);
  }

  return buildProjectedTimeTrendModel(granularity, rangeId, customerState, productCategory);
}

export function getTimeTrendSeries(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): TimeTrendPoint[] {
  return getTimeTrendModel(granularity, rangeId, customerState, productCategory).series;
}

export function getTimeTrendHighlights(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): TimeTrendHighlight[] {
  return getTimeTrendModel(granularity, rangeId, customerState, productCategory).highlights;
}

export function getTimeTrendSubtitle(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): string {
  return getTimeTrendModel(granularity, rangeId, customerState, productCategory).subtitle;
}

export function getTimeTrendMode(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): TimeTrendMode {
  return getTimeTrendModel(granularity, rangeId, customerState, productCategory).mode;
}

export function getDashboardPaymentTypeOptions(
  rangeId: Parameters<typeof getPaymentTypeOptions>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): DashboardPaymentTypeOption[] {
  return getPaymentTypeOptions(rangeId, customerState, productCategory);
}

export function getDashboardPaymentTypeLabel(
  rangeId: Parameters<typeof getPaymentTypeOptions>[0],
  paymentType: PaymentTypeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): string {
  return (
    getPaymentTypeOptions(rangeId, customerState, productCategory).find(
      (option) => option.value === paymentType,
    )?.label ?? paymentType
  );
}

export function getDashboardPaymentPanelSlice(
  rangeId: Parameters<typeof getPaymentPanelSlice>[0],
  paymentType: PaymentTypeId,
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
): DashboardPaymentPanelSlice {
  return getPaymentPanelSlice(rangeId, paymentType, customerState, productCategory);
}

export function getDashboardGeographyPanel(
  rangeId: Parameters<typeof getGeographyPanel>[0],
) {
  return getGeographyPanel(rangeId);
}

export function getDashboardCategoryPanel(
  rangeId: Parameters<typeof getCategoryPanel>[0],
  customerState: string = ALL_STATES_VALUE,
) {
  return getCategoryPanel(rangeId, customerState);
}

export function getDashboardReviewPanel(
  rangeId: Parameters<typeof getReviewPanel>[0],
  customerState: string = ALL_STATES_VALUE,
  productCategory: string = ALL_CATEGORIES_VALUE,
) {
  return getReviewPanel(rangeId, customerState, productCategory);
}

export { getDateRangeById, getMonthlySeries, getTimeTrendSummary };
export type { TimeGranularity };
