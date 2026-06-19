import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Phase3ReviewPanel } from '../data/phase2DashboardTypes';
import { formatOrderCount } from '../data/dashboardData';
import { ChartCard } from './ChartCard';

type DelayReviewPanelProps = {
  panel: Phase3ReviewPanel;
  rangeLabel: string;
  customerStateLabel: string;
  productCategoryLabel: string;
};

type TooltipPayload = {
  payload?: {
    delayDays: number;
    reviewScoreAvg: number;
    orderCount?: number;
  };
};

function ReviewTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm shadow-soft">
      <p className="font-medium text-ink">{point.delayDays} days</p>
      <p className="mt-1 text-slate">Avg review: {point.reviewScoreAvg.toFixed(2)}</p>
      {typeof point.orderCount === 'number' ? (
        <p className="text-slate">Orders: {formatOrderCount(point.orderCount)}</p>
      ) : null}
    </div>
  );
}

export function DelayReviewPanel({
  panel,
  rangeLabel,
  customerStateLabel,
  productCategoryLabel,
}: DelayReviewPanelProps) {
  const coverageRate =
    panel.population.totalOrders === 0
      ? 0
      : (panel.population.reviewedOrderCount / panel.population.totalOrders) * 100;

  return (
    <ChartCard
      title="Delay vs Review Relationship"
      subtitle={`Delivered orders with reviews in ${rangeLabel} within ${customerStateLabel} / ${productCategoryLabel}.`}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-slate-100 bg-slate-50/80 px-4 py-4 text-sm text-slate">
          <span>
            Reviewed orders: {formatOrderCount(panel.population.reviewedOrderCount)} /{' '}
            {formatOrderCount(panel.population.totalOrders)} ({coverageRate.toFixed(1)}%)
          </span>
          <span>Review rows: {formatOrderCount(panel.population.reviewRowCount)}</span>
        </div>
      }
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate">Review Score</p>
        <p className="text-sm font-medium text-accent-blue">
          Correlation: {panel.correlation.toFixed(2)}
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" />
            <XAxis
              type="number"
              dataKey="delayDays"
              name="Delivery Delay"
              unit=" days"
              domain={[panel.delayDaysDomain.min, panel.delayDaysDomain.max]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7891', fontSize: 12 }}
              label={{
                value: 'Delivery Delay (Days)',
                position: 'insideBottom',
                offset: -4,
                fill: '#6B7891',
              }}
            />
            <YAxis
              type="number"
              dataKey="reviewScoreAvg"
              name="Review Score"
              domain={[1, 5]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7891', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '4 4' }}
              content={<ReviewTooltip />}
            />
            <Scatter data={panel.points} fill="#3A86F6" />
            <Scatter
              data={panel.trendLine}
              line={{ stroke: '#6A8DC4', strokeDasharray: '5 5', strokeWidth: 2 }}
              shape={() => <g />}
              fill="transparent"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
