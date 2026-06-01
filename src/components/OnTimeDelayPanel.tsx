import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { onTimeDelayData } from '../data/dashboardMock';
import { ChartCard } from './ChartCard';

export function OnTimeDelayPanel() {
  return (
    <ChartCard
      title="On-time vs Delayed Comparison"
      footer={
        <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate">On-time rate</p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">91.8%</p>
            </div>
            <p className="text-sm font-medium text-emerald-600">▲ 2.6pp vs Dec 1 - Dec 31, 2023</p>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="relative h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={onTimeDelayData}
                dataKey="value"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={4}
              >
                {onTimeDelayData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[2rem] font-semibold tracking-[-0.03em] text-ink">99.4K</p>
            <p className="text-sm text-slate">Total Orders</p>
          </div>
        </div>

        <div className="space-y-5">
          {onTimeDelayData.map((entry) => (
            <div key={entry.name} className="flex items-start gap-3">
              <span
                className="mt-1 h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <div className="flex-1">
                <p className="font-medium text-ink">{entry.name}</p>
                <p className="mt-1 text-lg text-slate">
                  {entry.name === 'On-time' ? '91.3K (91.8%)' : '8.1K (8.2%)'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
