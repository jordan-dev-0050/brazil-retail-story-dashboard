export type DateRangeId = 'all' | '2017' | '2018_ytd';

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
};

export type Phase2MonthlyPoint = {
  month: string;
  label: string;
  orders: number;
  gmv: number;
};

export type Phase2PaymentTypeOption = {
  value: PaymentTypeId;
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
  };
  dateRanges: Phase2DateRange[];
  kpisByRange: Record<DateRangeId, Phase2Kpis>;
  monthlySeriesByRange: Record<DateRangeId, Phase2MonthlyPoint[]>;
  paymentPanelsByRange: Record<DateRangeId, Phase2PaymentRangePanels>;
};
