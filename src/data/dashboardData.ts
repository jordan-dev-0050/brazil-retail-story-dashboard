import {
  buildKpiCards as buildPhase2KpiCards,
  formatCurrency,
  formatCurrencyCompact,
  formatOrderCount,
  formatOrderCountCompact,
  getDateRangeById,
  getMonthlySeries,
  getTimeTrendSummary,
  phase2DashboardArtifact,
} from './phase2DashboardData';
import {
  filterOptions as mockFilterOptions,
  kpiCards as mockKpiCards,
  timeTrendHighlights as mockTimeTrendHighlights,
  timeTrendSeries as mockTimeTrendSeries,
  type TimeGranularity,
} from './dashboardMock';
import type { FilterId } from './dashboardTypes';

type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig = {
  label: string;
  options: FilterOption[];
  disabled?: boolean;
};

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

export const filterOptions: Record<FilterId, FilterConfig> = {
  dateRange: {
    label: 'Date Range',
    options: dashboardArtifact.dateRanges.map((range) => ({
      label: range.label,
      value: range.id,
    })),
  },
  customerState: {
    label: mockFilterOptions.customerState.label,
    options: mockFilterOptions.customerState.options,
  },
  productCategory: {
    label: mockFilterOptions.productCategory.label,
    options: mockFilterOptions.productCategory.options,
  },
  paymentType: {
    label: mockFilterOptions.paymentType.label,
    options: mockFilterOptions.paymentType.options,
  },
};

export { formatCurrency, formatCurrencyCompact, formatOrderCount, formatOrderCountCompact };

export function buildKpiCards(rangeId: Parameters<typeof buildPhase2KpiCards>[0]): KpiCardViewModel[] {
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

export { getDateRangeById, getMonthlySeries, getTimeTrendSummary };
export type { TimeGranularity };
