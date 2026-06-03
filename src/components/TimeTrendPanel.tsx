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
  formatCurrency,
  formatCurrencyCompact,
  formatOrderCount,
  formatOrderCountCompact,
  getMonthlySeries,
  getTimeTrendSummary,
} from '../data/dashboardData';
import type { DateRangeId } from '../data/dashboardTypes';
import { ChartCard } from './ChartCard';

type TimeTrendPanelProps = {
  rangeId: DateRangeId;
};

const numberFormatter = new Intl.NumberFormat('en-US');

export function TimeTrendPanel({ rangeId }: TimeTrendPanelProps) {
  const data = getMonthlySeries(rangeId);
  const summary = getTimeTrendSummary(rangeId);

  return (
    <ChartCard
      title="Time Trend"
      subtitle="Delivered orders and GMV by order purchase month"
      footer={
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-slate">Selected Window</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-ink">
              {summary.rangeLabel}
            </p>
            <p className="mt-1 text-sm text-slate">
              {summary.rangeStart} to {summary.rangeEnd}
            </p>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-slate">Avg Orders / Month</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
              {formatOrderCountCompact(summary.averageOrders)}
            </p>
            <p className="mt-1 text-sm text-slate">{summary.monthsCovered} months covered</p>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-slate">Avg GMV / Month</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
              {formatCurrencyCompact(summary.averageGmv)}
            </p>
            <p className="mt-1 text-sm text-slate">
              Total {formatCurrency(summary.averageGmv * summary.monthsCovered)}
            </p>
          </div>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-5 text-sm text-slate">
        <span className="font-medium text-accent-blue">Orders</span>
        <span className="font-medium text-accent-teal">GMV (R$)</span>
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
              tickFormatter={(value) => `${Math.round(value / 1000)}K`}
            />
            <YAxis
              yAxisId="gmv"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#4DB98A', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000000}M`}
            />
            <Tooltip
              cursor={{ stroke: '#C7D5EA', strokeDasharray: '4 4' }}
              contentStyle={{
                borderRadius: 18,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -30px rgba(45, 70, 116, 0.4)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'gmv') {
                  return [`R$${numberFormatter.format(value)}`, 'GMV'];
                }

                return [formatOrderCount(value), 'Orders'];
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
