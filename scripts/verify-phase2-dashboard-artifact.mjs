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
const expectedSliceChecks = {
  all: {
    all: {
      orderCount: 96211,
      paymentRowCount: 100473,
      avgFreightValue: 22.78,
      medianFreightValue: 17.17,
      onTimeOrderCount: 89672,
      delayedOrderCount: 6539,
      totalPaymentValue: 15375875.44,
      paymentMixValues: {
        credit_card: 12063100.59,
        boleto: 2762300.8,
        voucher: 342294.66,
        debit_card: 208179.39,
      },
    },
    credit_card: {
      orderCount: 74095,
      paymentRowCount: 77416,
      avgFreightValue: 22.86,
      medianFreightValue: 17.37,
      onTimeOrderCount: 69127,
      delayedOrderCount: 4968,
      totalPaymentValue: 12248153.72,
      paymentMixValues: {
        credit_card: 12063100.59,
        voucher: 185003.13,
        debit_card: 50,
      },
    },
  },
  '2017': {
    voucher: {
      orderCount: 1850,
      paymentRowCount: 4001,
      avgFreightValue: 20.04,
      medianFreightValue: 16.11,
      onTimeOrderCount: 1750,
      delayedOrderCount: 100,
      totalPaymentValue: 237189.02,
      paymentMixValues: {
        voucher: 164661.87,
        credit_card: 72527.15,
      },
    },
  },
  '2018_ytd': {
    boleto: {
      orderCount: 9998,
      paymentRowCount: 9998,
      avgFreightValue: 23.51,
      medianFreightValue: 17.95,
      onTimeOrderCount: 9144,
      delayedOrderCount: 854,
      totalPaymentValue: 1432274.41,
      paymentMixValues: {
        boleto: 1432274.41,
      },
    },
  },
};

assert.equal(artifact.metadata.source, 'olist');
assert.equal(artifact.metadata.version, '0.2.0');
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
  const paymentPanels = artifact.paymentPanelsByRange[rangeId];
  const summedOrders = series.reduce((total, point) => total + point.orders, 0);
  const summedGmv = Number(series.reduce((total, point) => total + point.gmv, 0).toFixed(2));

  assert.equal(series.length, expectedMonthCounts[rangeId]);
  assert.equal(summedOrders, kpis.totalOrders);
  assert.equal(summedGmv, kpis.totalGmv);
  assert.deepEqual(kpis, expectedKpis[rangeId]);

  assert.ok(paymentPanels);
  assert.equal(paymentPanels.paymentTypeOptions[0].value, 'all');
  assert.equal(paymentPanels.paymentTypeOptions[0].orderCount, kpis.totalOrders);

  for (const option of paymentPanels.paymentTypeOptions) {
    const slice = paymentPanels.slicesByPaymentType[option.value];
    const freightOrderCount = slice.freightDistribution.bands.reduce(
      (total, band) => total + band.orderCount,
      0,
    );
    const paymentMixRowCount = slice.paymentMix.entries.reduce(
      (total, entry) => total + entry.paymentRowCount,
      0,
    );
    const paymentMixValue = Number(
      slice.paymentMix.entries.reduce((total, entry) => total + entry.paymentValue, 0).toFixed(2),
    );

    assert.ok(slice);
    assert.equal(option.orderCount, slice.orderCount);
    assert.equal(slice.freightDistribution.totalOrders, slice.orderCount);
    assert.equal(freightOrderCount, slice.orderCount);
    assert.equal(
      slice.onTimeVsDelayed.onTimeOrderCount + slice.onTimeVsDelayed.delayedOrderCount,
      slice.orderCount,
    );
    assert.equal(slice.onTimeVsDelayed.totalOrders, slice.orderCount);
    assert.equal(slice.paymentMix.totalPaymentRowCount, slice.paymentRowCount);
    assert.equal(paymentMixRowCount, slice.paymentRowCount);
    assert.equal(paymentMixValue, slice.paymentMix.totalPaymentValue);
  }
}

const allRangeOptions = artifact.paymentPanelsByRange.all.paymentTypeOptions.map((option) => option.value);
assert.ok(allRangeOptions.includes('credit_card'));
assert.ok(allRangeOptions.includes('boleto'));
assert.ok(allRangeOptions.includes('voucher'));
assert.ok(allRangeOptions.includes('debit_card'));
assert.ok(!allRangeOptions.includes('pix'));

for (const [rangeId, rangeChecks] of Object.entries(expectedSliceChecks)) {
  for (const [paymentType, expectedSlice] of Object.entries(rangeChecks)) {
    const slice = artifact.paymentPanelsByRange[rangeId].slicesByPaymentType[paymentType];
    const paymentMixValues = Object.fromEntries(
      slice.paymentMix.entries.map((entry) => [entry.paymentType, entry.paymentValue]),
    );

    assert.equal(slice.orderCount, expectedSlice.orderCount);
    assert.equal(slice.paymentRowCount, expectedSlice.paymentRowCount);
    assert.equal(slice.freightDistribution.avgFreightValue, expectedSlice.avgFreightValue);
    assert.equal(slice.freightDistribution.medianFreightValue, expectedSlice.medianFreightValue);
    assert.equal(slice.onTimeVsDelayed.onTimeOrderCount, expectedSlice.onTimeOrderCount);
    assert.equal(slice.onTimeVsDelayed.delayedOrderCount, expectedSlice.delayedOrderCount);
    assert.equal(slice.paymentMix.totalPaymentValue, expectedSlice.totalPaymentValue);
    assert.deepEqual(paymentMixValues, expectedSlice.paymentMixValues);
  }
}

assert.ok(
  artifact.paymentPanelsByRange.all.slicesByPaymentType.all.paymentRowCount >
    artifact.paymentPanelsByRange.all.slicesByPaymentType.all.orderCount,
);
assert.deepEqual(
  [...artifact.paymentPanelsByRange['2017'].slicesByPaymentType.voucher.paymentMix.entries]
    .map((entry) => entry.paymentType)
    .sort(),
  ['credit_card', 'voucher'],
);
assert.deepEqual(
  artifact.paymentPanelsByRange['2018_ytd'].slicesByPaymentType.boleto.paymentMix.entries.map(
    (entry) => entry.paymentType,
  ),
  ['boleto'],
);

console.log('Phase 2 dashboard artifact checks passed.');
