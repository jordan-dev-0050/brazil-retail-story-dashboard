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
  getTimeTrendSummary,
  phase2DashboardArtifact,
} from './phase2DashboardData';
import {
  kpiCards as mockKpiCards,
  timeTrendHighlights as mockTimeTrendHighlights,
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
  delta?: string;
  comparison?: string;
  tone?: 'positive' | 'negative' | 'neutral';
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
  const realCards = buildPhase2KpiCards(rangeId);
  const [ordersCard, gmvCard] = realCards;
  const range = getDateRangeById(rangeId);

  return [
    {
      ...ordersCard,
      caption: `Delivered orders, ${range.label}`,
    },
    {
      ...gmvCard,
      caption: `Sum of order_items.price, ${range.label}`,
    },
    ...mockKpiCards.slice(2),
  ];
}

export function getTimeTrendSeries(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getMonthlySeries>[0],
): TimeTrendPoint[] {
  if (granularity !== 'monthly') {
    return mockTimeTrendSeries[granularity];
  }

  const realMonthlySeries = getMonthlySeries(rangeId);
  const mockMonthlySeries = mockTimeTrendSeries.monthly;
  const fallbackDelayRate =
    mockMonthlySeries.length > 0 ? mockMonthlySeries[mockMonthlySeries.length - 1].delayRate : 0;

  return realMonthlySeries.map((point, index) => ({
    ...point,
    delayRate: mockMonthlySeries[index]?.delayRate ?? fallbackDelayRate,
  }));
}

export function getTimeTrendHighlights(
  granularity: TimeGranularity,
  rangeId: Parameters<typeof getTimeTrendSummary>[0],
): TimeTrendHighlight[] {
  if (granularity !== 'monthly') {
    return mockTimeTrendHighlights.map((item) => ({
      label: item.label,
      value: item.value,
      detail: item.delta,
    }));
  }

  const summary = getTimeTrendSummary(rangeId);
  const monthlySeries = getTimeTrendSeries('monthly', rangeId);
  const averageDelayRate =
    monthlySeries.reduce((total, point) => total + point.delayRate, 0) / (monthlySeries.length || 1);

  return [
    {
      label: 'Orders',
      value: formatOrderCountCompact(summary.averageOrders),
      detail: `${summary.monthsCovered} months covered`,
    },
    {
      label: 'GMV (R$)',
      value: formatCurrencyCompact(summary.averageGmv),
      detail: `Total ${formatCurrency(summary.averageGmv * summary.monthsCovered)}`,
    },
    {
      label: 'Late Delivery Rate',
      value: `${averageDelayRate.toFixed(1)}%`,
      detail: 'Mock-backed monthly delay reference',
    },
  ];
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
