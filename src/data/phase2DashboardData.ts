import artifactJson from './phase2DashboardArtifact.json';
import type {
  DateRangeId,
  FilterId,
  Phase2MetricDefinition,
  Phase2MetricId,
  Phase2StateScoped,
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
export const ALL_STATES_VALUE = 'all-states';
export const ALL_CATEGORIES_VALUE = 'all-categories';

const dateRangeById = Object.fromEntries(
  phase2DashboardArtifact.dateRanges.map((range) => [range.id, range]),
) as Record<DateRangeId, Phase2DateRange>;

function getStateScopedValue<T>(
  scopedValue: Phase2StateScoped<T>,
  customerState: string = ALL_STATES_VALUE,
): T {
  if (customerState === ALL_STATES_VALUE) {
    return scopedValue.all;
  }

  return scopedValue.byState[customerState] ?? scopedValue.all;
}

export function getMetricDefinition(metricId: Phase2MetricId): Phase2MetricDefinition {
  return phase2DashboardArtifact.metadata.metricDefinitions[metricId];
}

export function buildMetricCaption(metricId: Phase2MetricId, rangeLabel: string): string {
  return `${getMetricDefinition(metricId).caption}, ${rangeLabel}`;
}

export function buildFilterOptions(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): Record<FilterId, FilterConfig> {
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
      helperText:
        'Active global cohort for KPI, Time Trend, Payment, Review, and Category Share. Brazil Map switches to focused-state mode.',
    },
    productCategory: {
      label: 'Product Category',
      options: phase2DashboardArtifact.productCategoryOptionsByRange[rangeId].map((option) => ({
        label: option.label,
        value: option.value,
      })),
      disabled: true,
      helperText:
        'P06 P1 locks in membership-based category semantics, but activation waits for artifact coverage.',
    },
    paymentType: {
      label: 'Payment Type',
      options: getStateScopedValue(
        phase2DashboardArtifact.paymentPanelsByRange[rangeId],
        customerState,
      ).paymentTypeOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
      helperText:
        'Secondary slice for payment panels only. When Customer State is active, these options are recalculated inside that cohort.',
    },
  };
}

export const filterOptions = buildFilterOptions('all');

export function getDateRangeById(rangeId: DateRangeId): Phase2DateRange {
  return dateRangeById[rangeId];
}

export function buildKpiCards(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): KpiCardViewModel[] {
  const range = getDateRangeById(rangeId);
  const kpis = getStateScopedValue(phase2DashboardArtifact.kpisByRange[rangeId], customerState);
  const reviewPanel = getReviewPanel(rangeId, customerState);
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
) {
  return getStateScopedValue(phase2DashboardArtifact.monthlySeriesByRange[rangeId], customerState);
}

export function getPaymentPanelsByRange(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): Phase2PaymentRangePanels {
  return getStateScopedValue(phase2DashboardArtifact.paymentPanelsByRange[rangeId], customerState);
}

export function getGeographyPanel(rangeId: DateRangeId): Phase3GeographyPanel {
  return phase2DashboardArtifact.geographyPanelsByRange[rangeId];
}

export function getCategoryPanel(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): Phase3CategoryPanel {
  return getStateScopedValue(phase2DashboardArtifact.categoryPanelsByRange[rangeId], customerState);
}

export function getReviewPanel(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): Phase3ReviewPanel {
  return getStateScopedValue(phase2DashboardArtifact.reviewPanelsByRange[rangeId], customerState);
}

export function getPaymentTypeOptions(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): Phase2PaymentTypeOption[] {
  return getPaymentPanelsByRange(rangeId, customerState).paymentTypeOptions;
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
  customerState: string = ALL_STATES_VALUE,
): Phase2PaymentPanelSlice {
  const paymentPanels = getPaymentPanelsByRange(rangeId, customerState);
  const fallbackSlice = paymentPanels.slicesByPaymentType.all;

  return paymentPanels.slicesByPaymentType[paymentType] ?? fallbackSlice;
}

export function getTimeTrendSummary(
  rangeId: DateRangeId,
  customerState: string = ALL_STATES_VALUE,
): TimeTrendSummary {
  const range = getDateRangeById(rangeId);
  const kpis = getStateScopedValue(phase2DashboardArtifact.kpisByRange[rangeId], customerState);
  const series = getMonthlySeries(rangeId, customerState);
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
