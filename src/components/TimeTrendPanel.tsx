import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  timeTrendHighlights,
  timeTrendSeries,
  type TimeGranularity,
} from '../data/dashboardMock';
import { ChartCard } from './ChartCard';
import { ToggleTabs } from './ToggleTabs';

type TimeTrendPanelProps = {
  granularity: TimeGranularity;
  onGranularityChange: (value: TimeGranularity) => void;
};

const timeTabs = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
] satisfies Array<{ label: string; value: TimeGranularity }>;

const numberFormatter = new Intl.NumberFormat('en-US');

export function TimeTrendPanel({ granularity, onGranularityChange }: TimeTrendPanelProps) {
  const data = timeTrendSeries[granularity];

  return (
    <ChartCard
      title="Time Trend"
      subtitle="Orders / GMV / Late Delivery Over Time"
      actions={<ToggleTabs options={timeTabs} value={granularity} onChange={onGranularityChange} />}
      footer={
        <div className="grid gap-3 md:grid-cols-3">
          {timeTrendHighlights.map((item) => (
            <div
              key={item.label}
              className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.08em] text-slate">{item.label}</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-2xl font-semibold tracking-[-0.03em] text-ink">{item.value}</p>
                <p className="text-sm font-medium text-emerald-600">{item.delta}</p>
              </div>
            </div>
          ))}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-5 text-sm text-slate">
        <span className="font-medium text-accent-blue">Orders</span>
        <span className="font-medium text-accent-teal">GMV (R$)</span>
        <span className="font-medium text-accent-orange">Late Delivery Rate (%)</span>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7891', fontSize: 12 }}
            />
            <YAxis
              yAxisId="orders"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7891', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <YAxis
              yAxisId="gmv"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#4DB98A', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000000}M`}
            />
            <YAxis yAxisId="delay" hide domain={[0, 25]} />
            <Tooltip
              cursor={{ stroke: '#C7D5EA', strokeDasharray: '4 4' }}
              contentStyle={{
                borderRadius: 18,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -30px rgba(45, 70, 116, 0.4)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'delayRate') {
                  return [`${value}%`, 'Late Delivery Rate'];
                }

                if (name === 'gmv') {
                  return [`R$${numberFormatter.format(value)}`, 'GMV'];
                }

                return [numberFormatter.format(value), 'Orders'];
              }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              yAxisId="orders"
              stroke="#3A86F6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="gmv"
              yAxisId="gmv"
              stroke="#4DB98A"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="delayRate"
              yAxisId="delay"
              stroke="#FF9D3F"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
