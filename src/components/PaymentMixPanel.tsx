import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { paymentMixData } from '../data/dashboardMock';
import { ChartCard } from './ChartCard';
import { CardIcon } from './Icons';

export function PaymentMixPanel() {
  return (
    <ChartCard
      title="Payment Mix"
      footer={
        <div className="flex items-center gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent-blue shadow-soft">
            <CardIcon className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate">
            Top Payment Method:{' '}
            <span className="font-semibold text-accent-blue">Credit Card (48.6%)</span>
          </p>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="relative h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentMixData}
                dataKey="share"
                innerRadius={72}
                outerRadius={112}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={4}
              >
                {paymentMixData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[2rem] font-semibold tracking-[-0.03em] text-ink">R$15.8M</p>
            <p className="text-sm text-slate">Total GMV</p>
          </div>
        </div>

        <div className="space-y-4">
          {paymentMixData.map((entry) => (
            <div key={entry.name} className="grid grid-cols-[1fr_72px_88px] items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                <p className="font-medium text-ink">{entry.name}</p>
              </div>
              <p className="text-right text-sm text-slate">{entry.share}%</p>
              <p className="text-right text-sm text-slate">{`R$${entry.value.toFixed(2)}M`}</p>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
