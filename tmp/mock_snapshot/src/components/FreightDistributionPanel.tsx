import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { freightDistributionData } from '../data/dashboardMock';
import { ChartCard } from './ChartCard';
import { TruckIcon } from './Icons';

export function FreightDistributionPanel() {
  return (
    <ChartCard
      title="Freight Distribution"
      footer={
        <div className="grid gap-3 md:grid-cols-[72px_1fr_1fr]">
          <div className="flex items-center justify-center rounded-[20px] border border-blue-100 bg-blue-50/70 text-accent-blue">
            <TruckIcon className="h-7 w-7" />
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-sm text-slate">Avg Freight Cost</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">R$32.45</p>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-sm text-slate">Med Freight Cost</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">R$25.10</p>
          </div>
        </div>
      }
    >
      <div className="mb-2 text-sm font-medium text-accent-blue">Orders</div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={freightDistributionData} barSize={22}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" vertical={false} />
            <XAxis dataKey="band" tickLine={false} axisLine={false} tick={{ fill: '#6B7891', fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7891', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(58, 134, 246, 0.08)' }}
              contentStyle={{
                borderRadius: 18,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -30px rgba(45, 70, 116, 0.4)',
              }}
              formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, 'Orders']}
            />
            <Bar dataKey="orders" fill="#3A86F6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
