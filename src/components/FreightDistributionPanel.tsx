import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency, formatOrderCount } from '../data/dashboardData';
import type { DashboardPaymentPanelSlice } from '../data/dashboardTypes';
import { ChartCard } from './ChartCard';

type FreightDistributionPanelProps = {
  slice: DashboardPaymentPanelSlice;
  rangeLabel: string;
  paymentTypeLabel: string;
  customerStateLabel: string;
};

function formatAxisCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }

  return String(value);
}

export function FreightDistributionPanel({
  slice,
  rangeLabel,
  paymentTypeLabel,
  customerStateLabel,
}: FreightDistributionPanelProps) {
  const freightData = slice.freightDistribution.bands.map((entry) => ({
    band: entry.band,
    orderCount: entry.orderCount,
  }));

  return (
    <ChartCard
      title="Freight Distribution"
      subtitle={`Real-backed order-level freight for ${rangeLabel} / ${customerStateLabel} / ${paymentTypeLabel}. Product Category remains staged on top of this payment slice.`}
      footer={
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-blue-100 bg-blue-50/70 px-4 py-3 text-accent-blue">
            <p className="text-sm text-slate">Matched Orders</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
              {formatOrderCount(slice.freightDistribution.totalOrders)}
            </p>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-sm text-slate">Avg Freight Cost</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
              {formatCurrency(slice.freightDistribution.avgFreightValue)}
            </p>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-sm text-slate">Median Freight Cost</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
              {formatCurrency(slice.freightDistribution.medianFreightValue)}
            </p>
          </div>
        </div>
      }
    >
      <div className="mb-2 text-sm font-medium text-accent-blue">Orders</div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={freightData} barSize={22}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="band"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7891', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7891', fontSize: 12 }}
              tickFormatter={formatAxisCount}
            />
            <Tooltip
              cursor={{ fill: 'rgba(58, 134, 246, 0.08)' }}
              contentStyle={{
                borderRadius: 18,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -30px rgba(45, 70, 116, 0.4)',
              }}
              formatter={(value: number) => [formatOrderCount(value), 'Orders']}
            />
            <Bar dataKey="orderCount" fill="#3A86F6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
