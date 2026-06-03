import assert from 'node:assert/strict';
import artifact from '../src/data/phase2DashboardArtifact.json' with { type: 'json' };

const expectedRanges = ['all', '2017', '2018_ytd'];
const expectedMonthCounts = {
  all: 20,
  '2017': 12,
  '2018_ytd': 8,
};
const expectedKpis = {
  all: {
    totalOrders: 96211,
    totalGmv: 13181027.13,
  },
  '2017': {
    totalOrders: 43428,
    totalGmv: 5962902.01,
  },
  '2018_ytd': {
    totalOrders: 52783,
    totalGmv: 7218125.12,
  },
};

assert.equal(artifact.metadata.source, 'olist');
assert.equal(artifact.metadata.currency, 'BRL');
assert.equal(artifact.metadata.timeAxis, 'order_purchase_timestamp');
assert.equal(artifact.metadata.grain, 'month');
assert.equal(artifact.metadata.orderPopulation, 'delivered_orders_only');
assert.equal(artifact.metadata.coverageStart, '2017-01-01');
assert.equal(artifact.metadata.coverageEnd, '2018-08-31');

assert.deepEqual(
  artifact.dateRanges.map((range) => range.id),
  expectedRanges,
);

for (const rangeId of expectedRanges) {
  const kpis = artifact.kpisByRange[rangeId];
  const series = artifact.monthlySeriesByRange[rangeId];
  const summedOrders = series.reduce((total, point) => total + point.orders, 0);
  const summedGmv = Number(series.reduce((total, point) => total + point.gmv, 0).toFixed(2));

  assert.equal(series.length, expectedMonthCounts[rangeId]);
  assert.equal(summedOrders, kpis.totalOrders);
  assert.equal(summedGmv, kpis.totalGmv);
  assert.deepEqual(kpis, expectedKpis[rangeId]);
}

console.log('Phase 2 dashboard artifact checks passed.');
