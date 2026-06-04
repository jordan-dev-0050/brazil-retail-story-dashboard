import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatOrderCount, formatOrderCountCompact } from '../data/dashboardData';
import type { DashboardPaymentPanelSlice } from '../data/dashboardTypes';
import { ChartCard } from './ChartCard';

type OnTimeDelayPanelProps = {
  slice: DashboardPaymentPanelSlice;
  rangeLabel: string;
  paymentTypeLabel: string;
};

function formatRate(value: number): string {
  return `${value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')}%`;
}

export function OnTimeDelayPanel({
  slice,
  rangeLabel,
  paymentTypeLabel,
}: OnTimeDelayPanelProps) {
  const chartData = [
    {
      name: 'On-time',
      value: slice.onTimeVsDelayed.onTimeOrderCount,
      rate: slice.onTimeVsDelayed.onTimeRate,
      fill: '#4DB98A',
    },
    {
      name: 'Delayed',
      value: slice.onTimeVsDelayed.delayedOrderCount,
      rate: slice.onTimeVsDelayed.delayedRate,
      fill: '#FF9D3F',
    },
  ];

  return (
    <ChartCard
      title="On-time vs Delayed"
      subtitle={`Real-backed delivery classification for ${rangeLabel} / ${paymentTypeLabel}`}
      footer={
        <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate">On-time rate</p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
                {formatRate(slice.onTimeVsDelayed.onTimeRate)}
              </p>
            </div>
            <p className="text-sm font-medium text-emerald-600">
              Delayed {formatRate(slice.onTimeVsDelayed.delayedRate)}
            </p>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="relative h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={4}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[2rem] font-semibold tracking-[-0.03em] text-ink">
              {formatOrderCountCompact(slice.onTimeVsDelayed.totalOrders)}
            </p>
            <p className="text-sm text-slate">Matched Orders</p>
          </div>
        </div>

        <div className="space-y-5">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-start gap-3">
              <span
                className="mt-1 h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <div className="flex-1">
                <p className="font-medium text-ink">{entry.name}</p>
                <p className="mt-1 text-lg text-slate">
                  {`${formatOrderCount(entry.value)} (${formatRate(entry.rate)})`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
