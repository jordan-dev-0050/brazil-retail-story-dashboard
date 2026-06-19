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
    lateDeliveryRate: 6.8,
  },
  '2017': {
    totalOrders: 43428,
    totalGmv: 5962902.01,
    lateDeliveryRate: 5.65,
  },
  '2018_ytd': {
    totalOrders: 52783,
    totalGmv: 7218125.12,
    lateDeliveryRate: 7.74,
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
const expectedGeographyChecks = {
  all: {
    topState: {
      state: 'SP',
      label: 'SP',
      orderCount: 40406,
      totalGmv: 5055587.13,
      lateDeliveryRate: 4.51,
    },
    secondState: {
      state: 'RJ',
      label: 'RJ',
      orderCount: 12310,
      totalGmv: 1751433.85,
      lateDeliveryRate: 12.14,
    },
  },
  '2017': {
    topState: {
      state: 'SP',
      label: 'SP',
      orderCount: 17071,
      totalGmv: 2136258.96,
      lateDeliveryRate: 3.81,
    },
  },
  '2018_ytd': {
    topState: {
      state: 'SP',
      label: 'SP',
      orderCount: 23335,
      totalGmv: 2919328.17,
      lateDeliveryRate: 5.03,
    },
  },
};
const expectedCategoryChecks = {
  all: {
    topCategory: {
      categoryKey: 'bed_bath_table',
      categoryLabel: 'Bed Bath Table',
      orderCount: 9267,
      itemCount: 10945,
      totalGmv: 1022955.77,
      shareOfItems: 9.96,
    },
  },
  '2017': {
    topCategory: {
      categoryKey: 'bed_bath_table',
      categoryLabel: 'Bed Bath Table',
      orderCount: 4423,
      itemCount: 5135,
      totalGmv: 490596.92,
      shareOfItems: 10.36,
    },
  },
  '2018_ytd': {
    topCategory: {
      categoryKey: 'health_beauty',
      categoryLabel: 'Health Beauty',
      orderCount: 5305,
      itemCount: 5841,
      totalGmv: 755724.5,
      shareOfItems: 9.68,
    },
  },
};
const expectedReviewChecks = {
  all: {
    population: {
      totalOrders: 96211,
      reviewedOrderCount: 95560,
      missingReviewOrderCount: 651,
      reviewRowCount: 96087,
    },
    correlation: -0.34,
    pointAtMinus14: {
      delayDays: -14,
      reviewScoreAvg: 4.33,
      orderCount: 41614,
    },
    pointAt0: {
      delayDays: 0,
      reviewScoreAvg: 4.04,
      orderCount: 1280,
    },
    pointAt60: {
      delayDays: 60,
      reviewScoreAvg: 2.84,
      orderCount: 80,
    },
    trendLine: [
      { delayDays: -14, reviewScoreAvg: 4.44 },
      { delayDays: 60, reviewScoreAvg: 1 },
    ],
  },
  '2017': {
    correlation: -0.33,
    pointAt0: {
      delayDays: 0,
      reviewScoreAvg: 3.86,
      orderCount: 421,
    },
  },
  '2018_ytd': {
    correlation: -0.36,
    pointAt60: {
      delayDays: 60,
      reviewScoreAvg: 2.63,
      orderCount: 27,
    },
  },
};

function sum(array, getter) {
  return array.reduce((total, item) => total + getter(item), 0);
}

function assertClose(actual, expected, epsilon = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `Expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

function sumMonthlyOrders(series) {
  return sum(series, (point) => point.orders);
}

function sumMonthlyGmv(series) {
  return Number(sum(series, (point) => point.gmv).toFixed(2));
}

assert.equal(artifact.metadata.source, 'olist');
assert.equal(artifact.metadata.version, '0.5.0');
assert.equal(artifact.metadata.currency, 'BRL');
assert.equal(artifact.metadata.timeAxis, 'order_purchase_timestamp');
assert.equal(artifact.metadata.grain, 'month');
assert.equal(artifact.metadata.orderPopulation, 'delivered_orders_only');
assert.equal(artifact.metadata.coverageStart, '2017-01-01');
assert.equal(artifact.metadata.coverageEnd, '2018-08-31');
assert.deepEqual(artifact.metadata.metricDefinitions.totalOrders, {
  label: 'Total Orders',
  unit: 'orders',
  caption: 'Delivered orders',
  summary: 'Distinct delivered orders purchased within the selected date range.',
  aggregation: 'count_distinct(order_id)',
});
assert.deepEqual(artifact.metadata.metricDefinitions.totalGmv, {
  label: 'Total GMV',
  unit: 'currency_brl',
  caption: 'Sum of order_items.price',
  summary: 'Sum of item prices for delivered orders; freight is excluded.',
  aggregation: 'sum(order_items.price)',
});
assert.deepEqual(artifact.metadata.metricDefinitions.lateDeliveryRate, {
  label: 'Late Delivery Rate',
  unit: 'percentage',
  caption: 'Delivered after estimated date',
  summary:
    'Share of delivered orders where order_delivered_customer_date is after order_estimated_delivery_date.',
  aggregation: 'delayed_delivered_orders / delivered_orders * 100',
  numerator: 'delayed_delivered_orders',
  denominator: 'delivered_orders_only',
  onTimeRule: 'order_delivered_customer_date <= order_estimated_delivery_date',
});

assert.deepEqual(
  artifact.dateRanges.map((range) => range.id),
  expectedRanges,
);

for (const rangeId of expectedRanges) {
  const kpis = artifact.kpisByRange[rangeId].all;
  const series = artifact.monthlySeriesByRange[rangeId].all;
  const paymentPanels = artifact.paymentPanelsByRange[rangeId].all;
  const stateOptions = artifact.customerStateOptionsByRange[rangeId];
  const categoryOptions = artifact.productCategoryOptionsByRange[rangeId];
  const geographyPanel = artifact.geographyPanelsByRange[rangeId];
  const categoryPanel = artifact.categoryPanelsByRange[rangeId].all;
  const reviewPanel = artifact.reviewPanelsByRange[rangeId].all;
  const summedOrders = sumMonthlyOrders(series);
  const summedGmv = sumMonthlyGmv(series);
  const weightedLateDeliveryRate =
    summedOrders === 0
      ? 0
      : Number(
          (
            (sum(series, (point) => point.orders * (point.lateDeliveryRate / 100)) / summedOrders) * 100
          ).toFixed(2),
        );

  assert.equal(series.length, expectedMonthCounts[rangeId]);
  assert.equal(summedOrders, kpis.totalOrders);
  assert.equal(summedGmv, kpis.totalGmv);
  assert.deepEqual(kpis, expectedKpis[rangeId]);
  assert.ok(series.every((point) => typeof point.lateDeliveryRate === 'number'));
  assertClose(weightedLateDeliveryRate, kpis.lateDeliveryRate, 0.03);

  assert.ok(paymentPanels);
  assert.equal(paymentPanels.paymentTypeOptions[0].value, 'all');
  assert.equal(paymentPanels.paymentTypeOptions[0].orderCount, kpis.totalOrders);
  assert.ok(artifact.kpisByRange[rangeId].byState.SP);
  assert.ok(artifact.monthlySeriesByRange[rangeId].byState.SP);
  assert.ok(artifact.paymentPanelsByRange[rangeId].byState.SP);
  assert.ok(artifact.categoryPanelsByRange[rangeId].byState.SP);
  assert.ok(artifact.reviewPanelsByRange[rangeId].byState.SP);

  for (const option of paymentPanels.paymentTypeOptions) {
    const slice = paymentPanels.slicesByPaymentType[option.value];
    const freightOrderCount = sum(slice.freightDistribution.bands, (band) => band.orderCount);
    const paymentMixRowCount = sum(slice.paymentMix.entries, (entry) => entry.paymentRowCount);
    const paymentMixValue = Number(
      sum(slice.paymentMix.entries, (entry) => entry.paymentValue).toFixed(2),
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

  assert.equal(stateOptions[0].value, 'all-states');
  assert.equal(stateOptions[0].orderCount, kpis.totalOrders);
  assert.equal(categoryOptions[0].value, 'all-categories');
  assert.equal(categoryOptions[0].orderCount, kpis.totalOrders);

  assert.equal(geographyPanel.totalOrders, kpis.totalOrders);
  assert.equal(geographyPanel.totalStates, geographyPanel.stateMetrics.length);
  assert.equal(sum(geographyPanel.stateMetrics, (entry) => entry.orderCount), kpis.totalOrders);
  assert.equal(
    Number(sum(geographyPanel.stateMetrics, (entry) => entry.totalGmv).toFixed(2)),
    kpis.totalGmv,
  );

  assert.equal(categoryPanel.shareBasis, 'item_count');
  assert.equal(categoryPanel.totals.totalOrders, kpis.totalOrders);
  assert.equal(categoryPanel.topCategory?.categoryKey, categoryPanel.categories[0]?.categoryKey ?? null);
  assert.equal(
    sum(categoryPanel.categories, (entry) => entry.itemCount),
    categoryPanel.totals.totalItems,
  );
  assert.equal(
    Number(sum(categoryPanel.categories, (entry) => entry.totalGmv).toFixed(2)),
    categoryPanel.totals.totalGmv,
  );
  assertClose(Number(sum(categoryPanel.categories, (entry) => entry.shareOfItems).toFixed(2)), 100);

  assert.equal(reviewPanel.population.totalOrders, kpis.totalOrders);
  assert.equal(
    reviewPanel.population.reviewedOrderCount + reviewPanel.population.missingReviewOrderCount,
    kpis.totalOrders,
  );
  assert.equal(sum(reviewPanel.points, (entry) => entry.orderCount), reviewPanel.population.reviewedOrderCount);
  assert.equal(reviewPanel.delayDaysDomain.min, reviewPanel.points[0]?.delayDays ?? 0);
  assert.equal(
    reviewPanel.delayDaysDomain.max,
    reviewPanel.points[reviewPanel.points.length - 1]?.delayDays ?? 0,
  );
  assert.equal(reviewPanel.trendLine.length, 2);
  assert.ok(reviewPanel.trendLine.every((point) => point.reviewScoreAvg >= 1 && point.reviewScoreAvg <= 5));

  const spStateMetric = geographyPanel.stateMetrics.find((entry) => entry.state === 'SP');
  const spKpis = artifact.kpisByRange[rangeId].byState.SP;
  const spSeries = artifact.monthlySeriesByRange[rangeId].byState.SP;
  const spPaymentAll = artifact.paymentPanelsByRange[rangeId].byState.SP.slicesByPaymentType.all;
  const spCategoryPanel = artifact.categoryPanelsByRange[rangeId].byState.SP;
  const spReviewPanel = artifact.reviewPanelsByRange[rangeId].byState.SP;

  assert.ok(spStateMetric);
  assert.equal(spKpis.totalOrders, spStateMetric.orderCount);
  assert.equal(spKpis.totalGmv, spStateMetric.totalGmv);
  assertClose(spKpis.lateDeliveryRate, spStateMetric.lateDeliveryRate, 0.03);
  assert.equal(sumMonthlyOrders(spSeries), spKpis.totalOrders);
  assert.equal(sumMonthlyGmv(spSeries), spKpis.totalGmv);
  assert.equal(spPaymentAll.orderCount, spKpis.totalOrders);
  assert.equal(spCategoryPanel.totals.totalOrders, spKpis.totalOrders);
  assert.equal(spReviewPanel.population.totalOrders, spKpis.totalOrders);
}

const allRangeOptions = artifact.paymentPanelsByRange.all.all.paymentTypeOptions.map((option) => option.value);
assert.ok(allRangeOptions.includes('credit_card'));
assert.ok(allRangeOptions.includes('boleto'));
assert.ok(allRangeOptions.includes('voucher'));
assert.ok(allRangeOptions.includes('debit_card'));
assert.ok(!allRangeOptions.includes('pix'));

for (const [rangeId, rangeChecks] of Object.entries(expectedSliceChecks)) {
  for (const [paymentType, expectedSlice] of Object.entries(rangeChecks)) {
    const slice = artifact.paymentPanelsByRange[rangeId].all.slicesByPaymentType[paymentType];
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

for (const [rangeId, expected] of Object.entries(expectedGeographyChecks)) {
  const geographyPanel = artifact.geographyPanelsByRange[rangeId];

  assert.deepEqual(geographyPanel.stateMetrics[0], expected.topState);

  if (expected.secondState) {
    assert.deepEqual(geographyPanel.stateMetrics[1], expected.secondState);
  }
}

for (const [rangeId, expected] of Object.entries(expectedCategoryChecks)) {
  const categoryPanel = artifact.categoryPanelsByRange[rangeId].all;
  assert.deepEqual(categoryPanel.topCategory, expected.topCategory);
}

for (const [rangeId, expected] of Object.entries(expectedReviewChecks)) {
  const reviewPanel = artifact.reviewPanelsByRange[rangeId].all;

  if (expected.population) {
    assert.deepEqual(reviewPanel.population, expected.population);
    assert.deepEqual(reviewPanel.trendLine, expected.trendLine);
    assert.deepEqual(
      reviewPanel.points.find((point) => point.delayDays === -14),
      expected.pointAtMinus14,
    );
  }

  assert.equal(reviewPanel.correlation, expected.correlation);

  if (expected.pointAt0) {
    assert.deepEqual(
      reviewPanel.points.find((point) => point.delayDays === 0),
      expected.pointAt0,
    );
  }

  if (expected.pointAt60) {
    assert.deepEqual(
      reviewPanel.points.find((point) => point.delayDays === 60),
      expected.pointAt60,
    );
  }
}

assert.ok(
  artifact.paymentPanelsByRange.all.all.slicesByPaymentType.all.paymentRowCount >
    artifact.paymentPanelsByRange.all.all.slicesByPaymentType.all.orderCount,
);
assert.deepEqual(
  [...artifact.paymentPanelsByRange['2017'].all.slicesByPaymentType.voucher.paymentMix.entries]
    .map((entry) => entry.paymentType)
    .sort(),
  ['credit_card', 'voucher'],
);
assert.deepEqual(
  artifact.paymentPanelsByRange['2018_ytd'].all.slicesByPaymentType.boleto.paymentMix.entries.map(
    (entry) => entry.paymentType,
  ),
  ['boleto'],
);

console.log('Phase 2/3 dashboard artifact checks passed.');
