import artifactJson from './phase2DashboardArtifact.json';
import type {
  DateRangeId,
  FilterId,
  Phase2DashboardArtifact,
  Phase2DateRange,
  Phase2PaymentPanelSlice,
  Phase2PaymentRangePanels,
  Phase2PaymentTypeOption,
  PaymentTypeId,
} from './phase2DashboardTypes';

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
  icon: 'orders' | 'gmv';
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
};

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

export const phase2DashboardArtifact = artifactJson as Phase2DashboardArtifact;

const dateRangeById = Object.fromEntries(
  phase2DashboardArtifact.dateRanges.map((range) => [range.id, range]),
) as Record<DateRangeId, Phase2DateRange>;

export const filterOptions: Record<FilterId, FilterConfig> = {
  dateRange: {
    label: 'Date Range',
    options: phase2DashboardArtifact.dateRanges.map((range) => ({
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
    options: phase2DashboardArtifact.paymentPanelsByRange.all.paymentTypeOptions.map((option) => ({
      label: option.label,
      value: option.value,
    })),
    disabled: true,
  },
};

export function getDateRangeById(rangeId: DateRangeId): Phase2DateRange {
  return dateRangeById[rangeId];
}

export function buildKpiCards(rangeId: DateRangeId): KpiCardViewModel[] {
  const range = getDateRangeById(rangeId);
  const kpis = phase2DashboardArtifact.kpisByRange[rangeId];

  return [
    {
      title: 'Total Orders',
      value: compactNumberFormatter.format(kpis.totalOrders),
      icon: 'orders',
      chipClassName: 'bg-blue-50 text-accent-blue',
      caption: `Delivered orders, ${range.label}`,
    },
    {
      title: 'Total GMV',
      value: compactCurrencyFormatter.format(kpis.totalGmv),
      icon: 'gmv',
      chipClassName: 'bg-emerald-50 text-accent-teal',
      caption: `Sum of order_items.price, ${range.label}`,
    },
  ];
}

export function getMonthlySeries(rangeId: DateRangeId) {
  return phase2DashboardArtifact.monthlySeriesByRange[rangeId];
}

export function getPaymentPanelsByRange(rangeId: DateRangeId): Phase2PaymentRangePanels {
  return phase2DashboardArtifact.paymentPanelsByRange[rangeId];
}

export function getPaymentTypeOptions(rangeId: DateRangeId): Phase2PaymentTypeOption[] {
  return getPaymentPanelsByRange(rangeId).paymentTypeOptions;
}

export function getPaymentPanelSlice(
  rangeId: DateRangeId,
  paymentType: PaymentTypeId,
): Phase2PaymentPanelSlice {
  return getPaymentPanelsByRange(rangeId).slicesByPaymentType[paymentType];
}

export function getTimeTrendSummary(rangeId: DateRangeId): TimeTrendSummary {
  const range = getDateRangeById(rangeId);
  const kpis = phase2DashboardArtifact.kpisByRange[rangeId];
  const series = getMonthlySeries(rangeId);
  const monthsCovered = series.length || 1;

  return {
    rangeLabel: range.label,
    rangeStart: range.start,
    rangeEnd: range.end,
    monthsCovered: series.length,
    averageOrders: kpis.totalOrders / monthsCovered,
    averageGmv: kpis.totalGmv / monthsCovered,
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
