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
    label: 'Customer State',
    options: [{ label: 'All States', value: 'all-states' }],
    disabled: true,
  },
  productCategory: {
    label: 'Product Category',
    options: [{ label: 'All Categories', value: 'all-categories' }],
    disabled: true,
  },
  paymentType: {
    label: 'Payment Type',
    options: [{ label: 'All Payment Types', value: 'all-payments' }],
    disabled: true,
  },
};

export { formatCurrency, formatCurrencyCompact, formatOrderCount, formatOrderCountCompact };

export const buildKpiCards = buildPhase2KpiCards;
export { getDateRangeById, getMonthlySeries, getTimeTrendSummary };
