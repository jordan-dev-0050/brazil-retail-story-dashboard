import { mapLegendLabels, mapRegions, type MapMetric } from '../data/dashboardMock';
import { ChartCard } from './ChartCard';
import { ToggleTabs } from './ToggleTabs';

type BrazilMapPanelProps = {
  metric: MapMetric;
  onMetricChange: (value: MapMetric) => void;
};

const mapTabs = [
  { label: 'Orders', value: 'orders' },
  { label: 'GMV', value: 'gmv' },
  { label: 'Late Delivery Rate', value: 'lateDeliveryRate' },
] satisfies Array<{ label: string; value: MapMetric }>;

export function BrazilMapPanel({ metric, onMetricChange }: BrazilMapPanelProps) {
  return (
    <ChartCard
      title="Brazil Map"
      subtitle="Orders / GMV by State"
      actions={<ToggleTabs options={mapTabs} value={metric} onChange={onMetricChange} />}
      contentClassName="space-y-4"
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
                    fill={region.colors[metric]}
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
            <p className="text-sm font-semibold text-ink">
              {metric === 'orders'
                ? 'Orders'
                : metric === 'gmv'
                  ? 'GMV'
                  : 'Late Delivery Rate'}
            </p>
            <div className="mt-3 space-y-3">
              {mapLegendLabels[metric].map((label, index) => {
                const color = ['#2467CD', '#4F92EC', '#8BB8F8', '#B7D1FB', '#E1ECFE'][index];

                return (
                  <div key={label} className="flex items-center gap-3 text-sm text-slate">
                    <span className="h-4 w-4 rounded-[6px]" style={{ backgroundColor: color }} />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
