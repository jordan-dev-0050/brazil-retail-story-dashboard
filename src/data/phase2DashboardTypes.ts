export type DateRangeId = 'all' | '2017' | '2018_ytd';

export type FilterId = 'dateRange' | 'customerState' | 'productCategory' | 'paymentType';

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
};
