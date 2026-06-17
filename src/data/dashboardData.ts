import {
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
};

export type DashboardFilterOptions = Record<FilterId, DashboardFilterConfig>;

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

type TimeTrendModel = {
  series: TimeTrendPoint[];
  highlights: TimeTrendHighlight[];
  subtitle: string;
};

export const dashboardArtifact = phase2DashboardArtifact;

const dateRangeOptions = dashboardArtifact.dateRanges.map((range) => ({
  label: range.label,
  value: range.id,
}));

const defaultRangeId = (dateRangeOptions[0]?.value ?? 'all') as DateRangeId;

export { formatCurrency, formatCurrencyCompact, formatOrderCount, formatOrderCountCompact };

export function getDashboardFilterOptions(
  rangeId: Parameters<typeof getPaymentTypeOptions>[0],
): DashboardFilterOptions {
  return buildPhase2FilterOptions(rangeId);
}

export function getInitialFilterValues(): Record<FilterId, string> {
  const initialFilterOptions = getDashboardFilterOptions(defaultRangeId);

  return {
    dateRange: initialFilterOptions.dateRange.options[0]?.value ?? defaultRangeId,
    customerState: initialFilterOptions.customerState.options[0]?.value ?? 'all-states',
    productCategory: initialFilterOptions.productCategory.options[0]?.value ?? 'all-categories',
    paymentType: initialFilterOptions.paymentType.options[0]?.value ?? 'all',
  };
}

export function buildKpiCards(
  rangeId: Parameters<typeof buildPhase2KpiCards>[0],
): KpiCardViewModel[] {
  return buildPhase2KpiCards(rangeId);
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

function getProjectedTimeTrendSeries(
  granularity: Exclude<TimeGranularity, 'monthly'>,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
): TimeTrendPoint[] {
  const template = mockTimeTrendSeries[granularity];
  const summary = getTimeTrendSummary(rangeId);
  const divisor = getTimeProjectionDivisor(granularity);
  const targetAverageOrders = summary.averageOrders / divisor;
  const targetAverageGmv = summary.averageGmv / divisor;
  const templateAverageOrders = average(template.map((point) => point.orders)) || 1;
  const templateAverageGmv = average(template.map((point) => point.gmv)) || 1;
  const templateAverageDelayRate = average(template.map((point) => point.delayRate));

  return template.map((point) => ({
    label: point.label,
    orders: Math.max(1, Math.round((point.orders / templateAverageOrders) * targetAverageOrders)),
    gmv: Math.max(1, Math.round((point.gmv / templateAverageGmv) * targetAverageGmv)),
    delayRate: roundNumber(
      Math.max(0, summary.lateDeliveryRate + (point.delayRate - templateAverageDelayRate)),
    ),
  }));
}

function buildMonthlyTimeTrendModel(
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
): TimeTrendModel {
  const summary = getTimeTrendSummary(rangeId);

  return {
    series: getMonthlySeries(rangeId).map((point) => ({
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
    subtitle: 'Orders / GMV / Late Delivery Rate use real monthly artifact data',
  };
}

function buildProjectedTimeTrendModel(
  granularity: Exclude<TimeGranularity, 'monthly'>,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
): TimeTrendModel {
  const projectedSeries = getProjectedTimeTrendSeries(granularity, rangeId);
  const summary = getTimeTrendSummary(rangeId);
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
        label: `Avg Orders / ${granularityLabel}`,
        value: formatOrderCountCompact(ordersAverage),
        detail: `Projected from real monthly baseline (${summary.rangeLabel})`,
      },
      {
        label: `Avg GMV / ${granularityLabel}`,
        value: formatCurrencyCompact(gmvAverage),
        detail: `Scaled from ${summary.monthsCovered} artifact months at ~${divisor.toFixed(1)} ${pointLabel} per month`,
      },
      {
        label: 'Late Delivery Rate',
        value: `${delayRateAverage.toFixed(1)}%`,
        detail: 'Projection keeps the selected range late-delivery baseline',
      },
    ],
    subtitle: `Daily and weekly views remain interactive projections, anchored to the real monthly artifact for ${summary.rangeLabel}`,
  };
}

export function getTimeTrendModel(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
): TimeTrendModel {
  if (granularity === 'monthly') {
    return buildMonthlyTimeTrendModel(rangeId);
  }

  return buildProjectedTimeTrendModel(granularity, rangeId);
}

export function getTimeTrendSeries(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
): TimeTrendPoint[] {
  return getTimeTrendModel(granularity, rangeId).series;
}

export function getTimeTrendHighlights(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
): TimeTrendHighlight[] {
  return getTimeTrendModel(granularity, rangeId).highlights;
}

export function getTimeTrendSubtitle(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
): string {
  return getTimeTrendModel(granularity, rangeId).subtitle;
}

export function getDashboardPaymentTypeOptions(
  rangeId: Parameters<typeof getPaymentTypeOptions>[0],
): DashboardPaymentTypeOption[] {
  return getPaymentTypeOptions(rangeId);
}

export function getDashboardPaymentTypeLabel(
  rangeId: Parameters<typeof getPaymentTypeOptions>[0],
  paymentType: PaymentTypeId,
): string {
  return (
    getPaymentTypeOptions(rangeId).find((option) => option.value === paymentType)?.label ??
    paymentType
  );
}

export function getDashboardPaymentPanelSlice(
  rangeId: Parameters<typeof getPaymentPanelSlice>[0],
  paymentType: PaymentTypeId,
): DashboardPaymentPanelSlice {
  return getPaymentPanelSlice(rangeId, paymentType);
}

export function getDashboardGeographyPanel(
  rangeId: Parameters<typeof getGeographyPanel>[0],
) {
  return getGeographyPanel(rangeId);
}

export function getDashboardCategoryPanel(
  rangeId: Parameters<typeof getCategoryPanel>[0],
) {
  return getCategoryPanel(rangeId);
}

export function getDashboardReviewPanel(
  rangeId: Parameters<typeof getReviewPanel>[0],
) {
  return getReviewPanel(rangeId);
}

export { getDateRangeById, getMonthlySeries, getTimeTrendSummary };
export type { TimeGranularity };
