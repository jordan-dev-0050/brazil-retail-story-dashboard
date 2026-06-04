import { mapRegions, type MapMetric } from '../data/dashboardMock';
import type { Phase3GeographyPanel } from '../data/phase2DashboardTypes';
import {
  formatCurrencyCompact,
  formatOrderCount,
  formatOrderCountCompact,
} from '../data/dashboardData';
import { ChartCard } from './ChartCard';
import { ToggleTabs } from './ToggleTabs';

type BrazilMapPanelProps = {
  metric: MapMetric;
  onMetricChange: (value: MapMetric) => void;
  panel: Phase3GeographyPanel;
  rangeLabel: string;
};

const mapTabs = [
  { label: 'Orders', value: 'orders' },
  { label: 'GMV', value: 'gmv' },
  { label: 'Late Delivery Rate', value: 'lateDeliveryRate' },
] satisfies Array<{ label: string; value: MapMetric }>;

const regionStateById = {
  northwest: 'AM',
  north: 'PA',
  northeast: 'BA',
  'center-west': 'GO',
  minas: 'MG',
  'sao-paulo': 'SP',
  rio: 'RJ',
  south: 'PR',
  'far-south': 'RS',
  coast: 'PE',
} as const;

const fillPalettes: Record<MapMetric, string[]> = {
  orders: ['#E1ECFE', '#B7D1FB', '#8BB8F8', '#4F92EC', '#2467CD'],
  gmv: ['#D7E6FB', '#C7DBFB', '#96BEF3', '#5896EA', '#2467CD'],
  lateDeliveryRate: ['#D9F0E3', '#B7E0C8', '#8CC8AB', '#5BAE84', '#2E7D59'],
};

function getMetricValue(metric: MapMetric, item: Phase3GeographyPanel['stateMetrics'][number]) {
  if (metric === 'orders') {
    return item.orderCount;
  }

  if (metric === 'gmv') {
    return item.totalGmv;
  }

  return item.lateDeliveryRate;
}

function formatMetricValue(metric: MapMetric, value: number) {
  if (metric === 'orders') {
    return formatOrderCountCompact(value);
  }

  if (metric === 'gmv') {
    return formatCurrencyCompact(value);
  }

  return `${value.toFixed(2)}%`;
}

function formatLegendLabel(metric: MapMetric, min: number, max: number) {
  if (metric === 'orders') {
    return `${formatOrderCountCompact(min)} - ${formatOrderCountCompact(max)}`;
  }

  if (metric === 'gmv') {
    return `${formatCurrencyCompact(min)} - ${formatCurrencyCompact(max)}`;
  }

  return `${min.toFixed(1)}% - ${max.toFixed(1)}%`;
}

export function BrazilMapPanel({ metric, onMetricChange, panel, rangeLabel }: BrazilMapPanelProps) {
  const stateMetricByCode = new Map(panel.stateMetrics.map((item) => [item.state, item]));
  const visibleMetrics = mapRegions
    .map((region) => stateMetricByCode.get(regionStateById[region.id as keyof typeof regionStateById]))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const metricValues = visibleMetrics.map((item) => getMetricValue(metric, item));
  const legendMin = metricValues.length > 0 ? Math.min(...metricValues) : 0;
  const legendMax = metricValues.length > 0 ? Math.max(...metricValues) : 0;
  const step = metricValues.length > 1 ? (legendMax - legendMin) / 5 : 0;
  const legendItems = fillPalettes[metric].map((color, index) => {
    const rangeStart = legendMin + step * index;
    const rangeEnd = index === 4 ? legendMax : legendMin + step * (index + 1);

    return {
      color,
      label: formatLegendLabel(metric, rangeStart, rangeEnd),
    };
  });
  const topStates = [...panel.stateMetrics]
    .sort((left, right) => getMetricValue(metric, right) - getMetricValue(metric, left))
    .slice(0, 5);
  const leader = topStates[0];

  const resolveRegionFill = (regionId: string) => {
    const stateCode = regionStateById[regionId as keyof typeof regionStateById];
    const stateMetric = stateCode ? stateMetricByCode.get(stateCode) : undefined;

    if (!stateMetric) {
      return '#EEF2F7';
    }

    const value = getMetricValue(metric, stateMetric);

    if (step === 0) {
      return fillPalettes[metric][fillPalettes[metric].length - 1];
    }

    const rawIndex = Math.floor((value - legendMin) / step);
    const paletteIndex = Math.max(0, Math.min(fillPalettes[metric].length - 1, rawIndex));
    return fillPalettes[metric][paletteIndex];
  };

  return (
    <ChartCard
      title="Brazil Map"
      subtitle={`Real artifact metrics for ${rangeLabel}. Simplified silhouette, state values from Olist joins.`}
      actions={<ToggleTabs options={mapTabs} value={metric} onChange={onMetricChange} />}
      contentClassName="space-y-4"
      footer={
        <div className="grid gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-slate">Coverage</p>
            <p className="mt-1 text-sm text-slate">
              {formatOrderCount(panel.totalOrders)} delivered orders across {panel.totalStates} states.
            </p>
          </div>
          {leader ? (
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-[0.08em] text-slate">Top State</p>
              <p className="mt-1 text-sm font-semibold text-accent-blue">
                {leader.label} | {formatMetricValue(metric, getMetricValue(metric, leader))}
              </p>
            </div>
          ) : null}
        </div>
      }
    >
      <div className="rounded-[28px] bg-[linear-gradient(180deg,#eef5ff_0%,#e8f1fd_100%)] p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_140px] lg:items-end">
          <div className="rounded-[24px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.78),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.06))] p-3 panel-grid">
            <svg viewBox="0 0 520 470" className="h-full w-full">
              <defs>
                <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#7fa3d6" floodOpacity="0.18" />
                </filter>
              </defs>
              <g filter="url(#mapShadow)">
                {mapRegions.map((region) => (
                  <polygon
                    key={region.id}
                    points={region.points}
                    fill={resolveRegionFill(region.id)}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                ))}
                <path
                  d="M80 122 164 64l142 14 142 60 10 32-24 58-54 12-24 96-44 4-22 102-42-24-40-72-34-18-22-104-92-98Z"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>

          <div className="w-full rounded-[22px] border border-white/80 bg-white/75 p-4 shadow-soft">
            <p className="text-sm font-semibold text-ink">{mapTabs.find((tab) => tab.value === metric)?.label}</p>
            <div className="mt-3 space-y-3">
              {legendItems
                .slice()
                .reverse()
                .map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-slate">
                    <span
                      className="h-4 w-4 rounded-[6px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {topStates.map((state) => (
                <div key={state.state} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-ink">{state.label}</span>
                  <span className="text-slate">
                    {formatMetricValue(metric, getMetricValue(metric, state))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
