import artifactJson from './phase2DashboardArtifact.json';
import type {
  DateRangeId,
  FilterId,
  Phase2MetricDefinition,
  Phase2MetricId,
  Phase3CategoryPanel,
  Phase2DashboardArtifact,
  Phase2DateRange,
  Phase2DimensionOption,
  Phase2PaymentPanelSlice,
  Phase2PaymentRangePanels,
  Phase2PaymentTypeOption,
  Phase3GeographyPanel,
  Phase3ReviewPanel,
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
  icon: 'orders' | 'gmv' | 'delay';
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

export function getMetricDefinition(metricId: Phase2MetricId): Phase2MetricDefinition {
  return phase2DashboardArtifact.metadata.metricDefinitions[metricId];
}

export function buildMetricCaption(metricId: Phase2MetricId, rangeLabel: string): string {
  return `${getMetricDefinition(metricId).caption}, ${rangeLabel}`;
}

export function buildFilterOptions(rangeId: DateRangeId): Record<FilterId, FilterConfig> {
  return {
    dateRange: {
      label: 'Date Range',
      options: phase2DashboardArtifact.dateRanges.map((range) => ({
        label: range.label,
        value: range.id,
      })),
    },
    customerState: {
      label: 'Customer State',
      options: phase2DashboardArtifact.customerStateOptionsByRange[rangeId].map((option) => ({
        label: option.label,
        value: option.value,
      })),
      disabled: true,
    },
    productCategory: {
      label: 'Product Category',
      options: phase2DashboardArtifact.productCategoryOptionsByRange[rangeId].map((option) => ({
        label: option.label,
        value: option.value,
      })),
      disabled: true,
    },
    paymentType: {
      label: 'Payment Type',
      options: phase2DashboardArtifact.paymentPanelsByRange[rangeId].paymentTypeOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    },
  };
}

export const filterOptions = buildFilterOptions('all');

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
  ];
}

export function getMonthlySeries(rangeId: DateRangeId) {
  return phase2DashboardArtifact.monthlySeriesByRange[rangeId];
}

export function getPaymentPanelsByRange(rangeId: DateRangeId): Phase2PaymentRangePanels {
  return phase2DashboardArtifact.paymentPanelsByRange[rangeId];
}

export function getGeographyPanel(rangeId: DateRangeId): Phase3GeographyPanel {
  return phase2DashboardArtifact.geographyPanelsByRange[rangeId];
}

export function getCategoryPanel(rangeId: DateRangeId): Phase3CategoryPanel {
  return phase2DashboardArtifact.categoryPanelsByRange[rangeId];
}

export function getReviewPanel(rangeId: DateRangeId): Phase3ReviewPanel {
  return phase2DashboardArtifact.reviewPanelsByRange[rangeId];
}

export function getPaymentTypeOptions(rangeId: DateRangeId): Phase2PaymentTypeOption[] {
  return getPaymentPanelsByRange(rangeId).paymentTypeOptions;
}

export function getCustomerStateOptions(rangeId: DateRangeId): Phase2DimensionOption[] {
  return phase2DashboardArtifact.customerStateOptionsByRange[rangeId];
}

export function getProductCategoryOptions(rangeId: DateRangeId): Phase2DimensionOption[] {
  return phase2DashboardArtifact.productCategoryOptionsByRange[rangeId];
}

export function getPaymentPanelSlice(
  rangeId: DateRangeId,
  paymentType: PaymentTypeId,
): Phase2PaymentPanelSlice {
  const fallbackSlice = getPaymentPanelsByRange(rangeId).slicesByPaymentType.all;

  return getPaymentPanelsByRange(rangeId).slicesByPaymentType[paymentType] ?? fallbackSlice;
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
    lateDeliveryRate: kpis.lateDeliveryRate,
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
