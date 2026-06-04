import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { delayReviewScatterData, delayReviewTrend } from '../data/dashboardMock';
import { ChartCard } from './ChartCard';

export function DelayReviewPanel() {
  return (
    <ChartCard title="Delay vs Review Relationship">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate">Review Score</p>
        <p className="text-sm font-medium text-accent-blue">Correlation: -0.42</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" />
            <XAxis
              type="number"
              dataKey="delay"
              name="Delivery Delay"
              unit=" days"
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
              dataKey="review"
              name="Review Score"
              domain={[1, 5]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7891', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '4 4' }}
              contentStyle={{
                borderRadius: 18,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -30px rgba(45, 70, 116, 0.4)',
              }}
              formatter={(value: number, name: string) => [
                name === 'delay' ? `${value} days` : value,
                name === 'delay' ? 'Delay' : 'Review Score',
              ]}
            />
            <Scatter data={delayReviewScatterData} fill="#3A86F6" />
            <Scatter
              data={delayReviewTrend}
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
