export type FilterId = 'dateRange' | 'customerState' | 'productCategory' | 'paymentType';
export type MapMetric = 'orders' | 'gmv' | 'lateDeliveryRate';
export type TimeGranularity = 'daily' | 'weekly' | 'monthly';

export const filterOptions: Record<
  FilterId,
  { label: string; options: Array<{ label: string; value: string }> }
> = {
  dateRange: {
    label: 'Date Range',
    options: [
      { label: 'Jan 1 - May 31, 2024', value: 'jan-may-2024' },
      { label: 'Q1 2024', value: 'q1-2024' },
      { label: 'FY 2024', value: 'fy-2024' },
    ],
  },
  customerState: {
    label: 'Customer State',
    options: [
      { label: 'All States', value: 'all-states' },
      { label: 'Sao Paulo', value: 'sp' },
      { label: 'Rio de Janeiro', value: 'rj' },
      { label: 'Minas Gerais', value: 'mg' },
    ],
  },
  productCategory: {
    label: 'Product Category',
    options: [
      { label: 'All Categories', value: 'all-categories' },
      { label: 'Casa & Decoracao', value: 'casa-decoracao' },
      { label: 'Eletronicos', value: 'eletronicos' },
      { label: 'Moda & Acessorios', value: 'moda-acessorios' },
    ],
  },
  paymentType: {
    label: 'Payment Type',
    options: [
      { label: 'All Payment Types', value: 'all-payments' },
      { label: 'Credit Card', value: 'credit-card' },
      { label: 'Boleto', value: 'boleto' },
      { label: 'Pix', value: 'pix' },
    ],
  },
};

export const mapLegendLabels: Record<MapMetric, string[]> = {
  orders: ['> 10K', '5K - 10K', '2K - 5K', '1K - 2K', '< 1K'],
  gmv: ['> R$2.0M', 'R$1.2M - R$2.0M', 'R$700K - R$1.2M', 'R$250K - R$700K', '< R$250K'],
  lateDeliveryRate: ['> 14%', '11% - 14%', '9% - 11%', '7% - 9%', '< 7%'],
};

export const mapRegions = [
  {
    id: 'northwest',
    label: 'Amazonas',
    points: '104,104 164,64 236,90 226,150 164,176 102,150 78,122',
    colors: {
      orders: '#b7d1fb',
      gmv: '#d7e6fb',
      lateDeliveryRate: '#bfe4d2',
    },
  },
  {
    id: 'north',
    label: 'Para',
    points: '236,90 306,78 360,116 324,170 262,178 226,150',
    colors: {
      orders: '#9ec3fa',
      gmv: '#c7dbfb',
      lateDeliveryRate: '#a5d7bf',
    },
  },
  {
    id: 'northeast',
    label: 'Bahia',
    points: '360,116 412,134 438,176 418,228 372,236 334,188 324,170',
    colors: {
      orders: '#8bb8f8',
      gmv: '#b7cff8',
      lateDeliveryRate: '#8cc8ab',
    },
  },
  {
    id: 'center-west',
    label: 'Goias',
    points: '178,176 262,178 292,226 254,276 194,268 160,224',
    colors: {
      orders: '#abcaf8',
      gmv: '#cfe0fb',
      lateDeliveryRate: '#b1dcc6',
    },
  },
  {
    id: 'minas',
    label: 'Minas Gerais',
    points: '292,226 350,210 388,238 378,292 322,304 278,282',
    colors: {
      orders: '#4f92ec',
      gmv: '#7eb1f1',
      lateDeliveryRate: '#72ba95',
    },
  },
  {
    id: 'sao-paulo',
    label: 'Sao Paulo',
    points: '278,282 322,304 314,344 258,342 238,308',
    colors: {
      orders: '#2d77e6',
      gmv: '#5896ea',
      lateDeliveryRate: '#4da679',
    },
  },
  {
    id: 'rio',
    label: 'Rio de Janeiro',
    points: '322,304 360,300 354,338 314,344',
    colors: {
      orders: '#2467cd',
      gmv: '#4a86db',
      lateDeliveryRate: '#3b9567',
    },
  },
  {
    id: 'south',
    label: 'Parana',
    points: '238,308 258,342 246,392 210,374 196,328',
    colors: {
      orders: '#7aacf3',
      gmv: '#a7c8f8',
      lateDeliveryRate: '#82c19f',
    },
  },
  {
    id: 'far-south',
    label: 'Rio Grande do Sul',
    points: '210,374 246,392 224,442 182,418',
    colors: {
      orders: '#9dc1f8',
      gmv: '#c6dbfa',
      lateDeliveryRate: '#add8c0',
    },
  },
  {
    id: 'coast',
    label: 'Pernambuco',
    points: '412,134 448,138 458,170 438,176',
    colors: {
      orders: '#6dacef',
      gmv: '#96bef3',
      lateDeliveryRate: '#79c29b',
    },
  },
];

export const timeTrendSeries: Record<
  TimeGranularity,
  Array<{ label: string; orders: number; gmv: number; delayRate: number }>
> = {
  daily: [
    { label: 'May 01', orders: 5800, gmv: 980000, delayRate: 6.2 },
    { label: 'May 03', orders: 6140, gmv: 1080000, delayRate: 6.5 },
    { label: 'May 05', orders: 7020, gmv: 1320000, delayRate: 7.4 },
    { label: 'May 07', orders: 6680, gmv: 1180000, delayRate: 7.1 },
    { label: 'May 09', orders: 6420, gmv: 1120000, delayRate: 6.9 },
    { label: 'May 11', orders: 7210, gmv: 1360000, delayRate: 7.8 },
    { label: 'May 13', orders: 7540, gmv: 1410000, delayRate: 8.1 },
    { label: 'May 15', orders: 7000, gmv: 1250000, delayRate: 7.2 },
    { label: 'May 17', orders: 7340, gmv: 1340000, delayRate: 7.7 },
    { label: 'May 19', orders: 7900, gmv: 1460000, delayRate: 8.4 },
    { label: 'May 21', orders: 7560, gmv: 1390000, delayRate: 7.9 },
    { label: 'May 23', orders: 6840, gmv: 1220000, delayRate: 6.8 },
    { label: 'May 25', orders: 6280, gmv: 1020000, delayRate: 6.1 },
    { label: 'May 27', orders: 6460, gmv: 1080000, delayRate: 6.7 },
    { label: 'May 29', orders: 6120, gmv: 1010000, delayRate: 6.4 },
    { label: 'May 31', orders: 6040, gmv: 995000, delayRate: 6.2 },
  ],
  weekly: [
    { label: "Jan '24", orders: 5500, gmv: 820000, delayRate: 5.8 },
    { label: 'W2', orders: 8900, gmv: 1460000, delayRate: 8.1 },
    { label: 'W3', orders: 7300, gmv: 1220000, delayRate: 7.6 },
    { label: 'W4', orders: 6800, gmv: 1100000, delayRate: 6.4 },
    { label: "Feb '24", orders: 7600, gmv: 1320000, delayRate: 6.9 },
    { label: 'W6', orders: 6400, gmv: 1040000, delayRate: 5.9 },
    { label: 'W7', orders: 6150, gmv: 980000, delayRate: 5.5 },
    { label: 'W8', orders: 7080, gmv: 1180000, delayRate: 6.7 },
    { label: "Mar '24", orders: 8520, gmv: 1480000, delayRate: 8.4 },
    { label: 'W10', orders: 7060, gmv: 1200000, delayRate: 6.8 },
    { label: 'W11', orders: 6910, gmv: 1140000, delayRate: 6.4 },
    { label: 'W12', orders: 7720, gmv: 1300000, delayRate: 7.2 },
    { label: "Apr '24", orders: 7160, gmv: 1260000, delayRate: 6.9 },
    { label: 'W14', orders: 7890, gmv: 1360000, delayRate: 7.7 },
    { label: 'W15', orders: 6620, gmv: 1110000, delayRate: 6.1 },
    { label: 'W16', orders: 5740, gmv: 930000, delayRate: 4.9 },
    { label: "May '24", orders: 6260, gmv: 1020000, delayRate: 5.7 },
  ],
  monthly: [
    { label: "Jan '24", orders: 28200, gmv: 4820000, delayRate: 7.1 },
    { label: "Feb '24", orders: 26400, gmv: 4510000, delayRate: 6.3 },
    { label: "Mar '24", orders: 29900, gmv: 5160000, delayRate: 7.8 },
    { label: "Apr '24", orders: 28600, gmv: 4980000, delayRate: 6.9 },
    { label: "May '24", orders: 25400, gmv: 4380000, delayRate: 5.9 },
  ],
};

export const timeTrendHighlights = [
  { label: 'Orders', value: '6.2K', delta: '12.4% WoW' },
  { label: 'GMV (R$)', value: '1.02M', delta: '14.7% WoW' },
  { label: 'Late Delivery Rate', value: '7.3%', delta: '-0.9pp WoW' },
];

export const onTimeDelayData = [
  { name: 'On-time', value: 91300, fill: '#4DB98A' },
  { name: 'Delayed', value: 8100, fill: '#FF9D3F' },
];

export const freightDistributionData = [
  { band: '0-10', orders: 5100 },
  { band: '10-20', orders: 12800 },
  { band: '20-30', orders: 21300 },
  { band: '30-40', orders: 19200 },
  { band: '40-50', orders: 15400 },
  { band: '50-75', orders: 11200 },
  { band: '75-100', orders: 7800 },
  { band: '100+', orders: 6600 },
];

export const delayReviewScatterData = Array.from({ length: 74 }, (_, index) => {
  const delay = 4 + index * 0.72 + (index % 5) * 0.8;
  const review = 4.8 - delay * 0.043 + ((index % 7) - 3) * 0.18;

  return {
    delay: Number(Math.min(60, delay).toFixed(1)),
    review: Number(Math.max(1.6, Math.min(5, review)).toFixed(1)),
  };
});

export const delayReviewTrend = [
  { delay: 0, review: 4.7 },
  { delay: 60, review: 2.2 },
];

export const categoryShareData = [
  { name: 'Casa & Decoracao', share: 24.1, gmv: 'R$3.81M', color: '#2F7AE7' },
  { name: 'Eletronicos', share: 18.3, gmv: 'R$2.89M', color: '#3F86EA' },
  { name: 'Moda & Acessorios', share: 15.6, gmv: 'R$2.47M', color: '#4B91ED' },
  { name: 'Beleza & Saude', share: 12.7, gmv: 'R$2.01M', color: '#5A9AF0' },
  { name: 'Esportes & Lazer', share: 7.5, gmv: 'R$1.19M', color: '#7AAEF3' },
  { name: 'Outros', share: 21.8, gmv: 'R$3.43M', color: '#D7DEE8' },
];

export const paymentMixData = [
  { name: 'Credit Card', share: 48.6, value: 7.67, fill: '#3A86F6' },
  { name: 'Boleto', share: 19.7, value: 3.11, fill: '#4DB98A' },
  { name: 'Pix', share: 17.6, value: 2.78, fill: '#FDB63E' },
  { name: 'Debit Card', share: 8.5, value: 1.34, fill: '#93AACC' },
  { name: 'Other', share: 5.6, value: 0.89, fill: '#D8DEE8' },
];
