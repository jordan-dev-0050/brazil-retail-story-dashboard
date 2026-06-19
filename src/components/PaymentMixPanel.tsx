import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatCurrencyCompact } from '../data/dashboardData';
import type { DashboardPaymentPanelSlice } from '../data/dashboardTypes';
import { ChartCard } from './ChartCard';
import { CardIcon } from './Icons';

type PaymentMixPanelProps = {
  slice: DashboardPaymentPanelSlice;
  rangeLabel: string;
  paymentTypeLabel: string;
  customerStateLabel: string;
  productCategoryLabel: string;
};

const paymentTypeColors: Record<string, string> = {
  credit_card: '#3A86F6',
  boleto: '#4DB98A',
  voucher: '#FDB63E',
  debit_card: '#93AACC',
  not_defined: '#D8DEE8',
};

function formatShare(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

export function PaymentMixPanel({
  slice,
  rangeLabel,
  paymentTypeLabel,
  customerStateLabel,
  productCategoryLabel,
}: PaymentMixPanelProps) {
  const totalPaymentValue = slice.paymentMix.totalPaymentValue;
  const chartData = slice.paymentMix.entries.map((entry) => ({
    ...entry,
    share: totalPaymentValue === 0 ? 0 : (entry.paymentValue / totalPaymentValue) * 100,
    fill: paymentTypeColors[entry.paymentType] ?? '#D8DEE8',
  }));
  const topEntry = [...chartData].sort((left, right) => right.paymentValue - left.paymentValue)[0];

  return (
    <ChartCard
      title="Payment Mix"
      subtitle={`Real-backed payment rows for ${rangeLabel} / ${customerStateLabel} / ${productCategoryLabel} / ${paymentTypeLabel}.`}
      footer={
        <div className="rounded-[22px] border border-blue-100 bg-blue-50/60 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent-blue shadow-soft">
              <CardIcon className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate">
              {topEntry ? (
                <>
                  Top Payment Method:{' '}
                  <span className="font-semibold text-accent-blue">
                    {`${topEntry.label} (${formatShare(topEntry.share)}%)`}
                  </span>
                </>
              ) : (
                'No payment rows matched this cohort.'
              )}
            </p>
          </div>
          <p className="mt-3 text-sm text-slate">
            Membership-based cohort: split-payment orders can still contribute multiple methods in
            the mix.
          </p>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="relative h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="share"
                innerRadius={72}
                outerRadius={112}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={4}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.paymentType} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[2rem] font-semibold tracking-[-0.03em] text-ink">
              {formatCurrencyCompact(totalPaymentValue)}
            </p>
            <p className="text-sm text-slate">Total Payment Value</p>
          </div>
        </div>

        <div className="space-y-4">
          {chartData.map((entry) => (
            <div
              key={entry.paymentType}
              className="grid grid-cols-[1fr_72px_116px] items-center gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                <p className="font-medium text-ink">{entry.label}</p>
              </div>
              <p className="text-right text-sm text-slate">{`${formatShare(entry.share)}%`}</p>
              <p className="text-right text-sm text-slate">{formatCurrency(entry.paymentValue)}</p>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
