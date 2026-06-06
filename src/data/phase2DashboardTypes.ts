export type DateRangeId = 'all' | '2017' | '2018_ytd';
export type Phase2MetricId = 'totalOrders' | 'totalGmv' | 'lateDeliveryRate';

export type FilterId = 'dateRange' | 'customerState' | 'productCategory' | 'paymentType';
export type PaymentTypeId =
  | 'all'
  | 'credit_card'
  | 'boleto'
  | 'voucher'
  | 'debit_card'
  | 'not_defined'
  | (string & {});

export type Phase2DateRange = {
  id: DateRangeId;
  label: string;
  start: string;
  end: string;
};

export type Phase2Kpis = {
  totalOrders: number;
  totalGmv: number;
  lateDeliveryRate: number;
};

export type Phase2MonthlyPoint = {
  month: string;
  label: string;
  orders: number;
  gmv: number;
  lateDeliveryRate: number;
};

export type Phase2MetricDefinition = {
  label: string;
  unit: 'orders' | 'currency_brl' | 'percentage';
  caption: string;
  summary: string;
  aggregation: string;
  numerator?: string;
  denominator?: string;
  onTimeRule?: string;
};

export type Phase2PaymentTypeOption = {
  value: PaymentTypeId;
  label: string;
  orderCount: number;
};

export type Phase2DimensionOption = {
  value: string;
  label: string;
  orderCount: number;
};

export type Phase2FreightBand = {
  band: string;
  orderCount: number;
};

export type Phase2FreightDistributionPanel = {
  totalOrders: number;
  totalFreightValue: number;
  avgFreightValue: number;
  medianFreightValue: number;
  bands: Phase2FreightBand[];
};

export type Phase2PaymentMixEntry = {
  paymentType: Exclude<PaymentTypeId, 'all'>;
  label: string;
  paymentRowCount: number;
  paymentValue: number;
};

export type Phase2PaymentMixPanel = {
  totalPaymentRowCount: number;
  totalPaymentValue: number;
  entries: Phase2PaymentMixEntry[];
};

export type Phase2OnTimeVsDelayedPanel = {
  totalOrders: number;
  onTimeOrderCount: number;
  delayedOrderCount: number;
  onTimeRate: number;
  delayedRate: number;
};

export type Phase2PaymentPanelSlice = {
  paymentType: PaymentTypeId;
  orderCount: number;
  paymentRowCount: number;
  freightDistribution: Phase2FreightDistributionPanel;
  paymentMix: Phase2PaymentMixPanel;
  onTimeVsDelayed: Phase2OnTimeVsDelayedPanel;
};

export type Phase2PaymentRangePanels = {
  paymentTypeOptions: Phase2PaymentTypeOption[];
  slicesByPaymentType: Record<string, Phase2PaymentPanelSlice>;
};

export type Phase3StateMetric = {
  state: string;
  label: string;
  orderCount: number;
  totalGmv: number;
  lateDeliveryRate: number;
};

export type Phase3GeographyPanel = {
  totalOrders: number;
  totalStates: number;
  stateMetrics: Phase3StateMetric[];
};

export type Phase3CategoryRow = {
  categoryKey: string;
  categoryLabel: string;
  orderCount: number;
  itemCount: number;
  totalGmv: number;
  shareOfItems: number;
};

export type Phase3CategoryPanel = {
  shareBasis: 'item_count';
  totals: {
    totalOrders: number;
    totalItems: number;
    totalGmv: number;
  };
  categories: Phase3CategoryRow[];
  topCategory: Phase3CategoryRow | null;
};

export type Phase3DelayReviewPoint = {
  delayDays: number;
  reviewScoreAvg: number;
  orderCount: number;
};

export type Phase3ReviewPanel = {
  population: {
    totalOrders: number;
    reviewedOrderCount: number;
    missingReviewOrderCount: number;
    reviewRowCount: number;
  };
  delayDaysDomain: {
    min: number;
    max: number;
  };
  correlation: number;
  points: Phase3DelayReviewPoint[];
  trendLine: Array<{
    delayDays: number;
    reviewScoreAvg: number;
  }>;
};

export type Phase2DashboardArtifact = {
  metadata: {
    source: 'olist';
    version: string;
    generatedAt: string;
    currency: 'BRL';
    timeAxis: 'order_purchase_timestamp';
    grain: 'month';
    orderPopulation: 'delivered_orders_only';
    coverageStart: string;
    coverageEnd: string;
    metricDefinitions: Record<Phase2MetricId, Phase2MetricDefinition>;
  };
  dateRanges: Phase2DateRange[];
  kpisByRange: Record<DateRangeId, Phase2Kpis>;
  monthlySeriesByRange: Record<DateRangeId, Phase2MonthlyPoint[]>;
  customerStateOptionsByRange: Record<DateRangeId, Phase2DimensionOption[]>;
  productCategoryOptionsByRange: Record<DateRangeId, Phase2DimensionOption[]>;
  paymentPanelsByRange: Record<DateRangeId, Phase2PaymentRangePanels>;
  geographyPanelsByRange: Record<DateRangeId, Phase3GeographyPanel>;
  categoryPanelsByRange: Record<DateRangeId, Phase3CategoryPanel>;
  reviewPanelsByRange: Record<DateRangeId, Phase3ReviewPanel>;
};
