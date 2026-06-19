import { useState } from 'react';
import {
  ALL_CATEGORIES_VALUE,
  ALL_STATES_VALUE,
  buildKpiCards,
  getDashboardCategoryPanel,
  getDashboardFilterOptions,
  getDashboardGeographyPanel,
  getDashboardPaymentPanelSlice,
  getDashboardPaymentTypeLabel,
  getDashboardReviewPanel,
  getInitialFilterValues,
} from '../data/dashboardData';
import type { DateRangeId, FilterId, PaymentTypeId } from '../data/dashboardTypes';
import type { MapMetric, TimeGranularity } from '../data/dashboardMock';
import { BrazilMapPanel } from './BrazilMapPanel';
import { CategorySharePanel } from './CategorySharePanel';
import { DelayReviewPanel } from './DelayReviewPanel';
import { FilterBar } from './FilterBar';
import { FreightDistributionPanel } from './FreightDistributionPanel';
import { KpiCard } from './KpiCard';
import { OnTimeDelayPanel } from './OnTimeDelayPanel';
import { PaymentMixPanel } from './PaymentMixPanel';
import { TimeTrendPanel } from './TimeTrendPanel';

function normalizeFilters(
  rangeId: DateRangeId,
  customerState: string,
  productCategory: string,
  paymentType: string,
): Record<FilterId, string> {
  let nextCustomerState = customerState;
  let nextProductCategory = productCategory;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const nextFilterOptions = getDashboardFilterOptions(
      rangeId,
      nextCustomerState,
      nextProductCategory,
    );
    const resolvedCustomerState = nextFilterOptions.customerState.options.some(
      (option) => option.value === nextCustomerState,
    )
      ? nextCustomerState
      : (nextFilterOptions.customerState.options[0]?.value ?? ALL_STATES_VALUE);
    const resolvedProductCategory = nextFilterOptions.productCategory.options.some(
      (option) => option.value === nextProductCategory,
    )
      ? nextProductCategory
      : (nextFilterOptions.productCategory.options[0]?.value ?? ALL_CATEGORIES_VALUE);

    if (
      resolvedCustomerState === nextCustomerState &&
      resolvedProductCategory === nextProductCategory
    ) {
      const paymentOptions = getDashboardFilterOptions(
        rangeId,
        resolvedCustomerState,
        resolvedProductCategory,
      ).paymentType.options;
      const resolvedPaymentType = paymentOptions.some((option) => option.value === paymentType)
        ? paymentType
        : (paymentOptions[0]?.value ?? 'all');

      return {
        dateRange: rangeId,
        customerState: resolvedCustomerState,
        productCategory: resolvedProductCategory,
        paymentType: resolvedPaymentType,
      };
    }

    nextCustomerState = resolvedCustomerState;
    nextProductCategory = resolvedProductCategory;
  }

  const fallbackPaymentOptions = getDashboardFilterOptions(
    rangeId,
    nextCustomerState,
    nextProductCategory,
  ).paymentType.options;
  return {
    dateRange: rangeId,
    customerState: nextCustomerState,
    productCategory: nextProductCategory,
    paymentType: fallbackPaymentOptions.some((option) => option.value === paymentType)
      ? paymentType
      : (fallbackPaymentOptions[0]?.value ?? 'all'),
  };
}

export function DashboardPage() {
  const [filters, setFilters] = useState<Record<FilterId, string>>(() => getInitialFilterValues());
  const [mapMetric, setMapMetric] = useState<MapMetric>('orders');
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('monthly');

  const selectedRangeId = filters.dateRange as DateRangeId;
  const filterConfigs = getDashboardFilterOptions(
    selectedRangeId,
    filters.customerState,
    filters.productCategory,
  );
  const selectedCustomerState =
    filterConfigs.customerState.options.find((option) => option.value === filters.customerState)?.value ??
    filterConfigs.customerState.options[0]?.value ??
    ALL_STATES_VALUE;
  const selectedCustomerStateLabel =
    filterConfigs.customerState.options.find((option) => option.value === selectedCustomerState)?.label ??
    'All States';
  const selectedProductCategory =
    filterConfigs.productCategory.options.find((option) => option.value === filters.productCategory)?.value ??
    filterConfigs.productCategory.options[0]?.value ??
    ALL_CATEGORIES_VALUE;
  const selectedProductCategoryLabel =
    filterConfigs.productCategory.options.find((option) => option.value === selectedProductCategory)?.label ??
    'All Categories';
  const selectedPaymentType = (
    filterConfigs.paymentType.options.find((option) => option.value === filters.paymentType)?.value ??
    filterConfigs.paymentType.options[0]?.value ??
    'all'
  ) as PaymentTypeId;
  const isProductCategoryFocused = selectedProductCategory !== ALL_CATEGORIES_VALUE;
  const kpiCards = buildKpiCards(
    selectedRangeId,
    selectedCustomerState,
    selectedProductCategory,
  );
  const paymentPanelSlice = getDashboardPaymentPanelSlice(
    selectedRangeId,
    selectedPaymentType,
    selectedCustomerState,
    selectedProductCategory,
  );
  const geographyPanel = getDashboardGeographyPanel(selectedRangeId);
  const categoryPanel = getDashboardCategoryPanel(selectedRangeId, selectedCustomerState);
  const reviewPanel = getDashboardReviewPanel(
    selectedRangeId,
    selectedCustomerState,
    selectedProductCategory,
  );
  const selectedRangeLabel =
    filterConfigs.dateRange.options.find((option) => option.value === selectedRangeId)?.label ??
    selectedRangeId;
  const paymentTypeLabel = getDashboardPaymentTypeLabel(
    selectedRangeId,
    selectedPaymentType,
    selectedCustomerState,
    selectedProductCategory,
  );

  const updateFilter = (id: FilterId, value: string) => {
    setFilters((current) => {
      const nextRangeId = (id === 'dateRange' ? value : current.dateRange) as DateRangeId;
      const nextCustomerState = id === 'customerState' ? value : current.customerState;
      const nextProductCategory = id === 'productCategory' ? value : current.productCategory;
      const nextPaymentType = id === 'paymentType' ? value : current.paymentType;

      return normalizeFilters(
        nextRangeId,
        nextCustomerState,
        nextProductCategory,
        nextPaymentType,
      );
    });
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <FilterBar configs={filterConfigs} values={filters} onChange={updateFilter} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
          <BrazilMapPanel
            metric={mapMetric}
            onMetricChange={setMapMetric}
            panel={geographyPanel}
            rangeLabel={selectedRangeLabel}
            focusedState={selectedCustomerState}
            focusedStateLabel={selectedCustomerStateLabel}
            activeProductCategoryLabel={
              isProductCategoryFocused ? selectedProductCategoryLabel : null
            }
          />
          <TimeTrendPanel
            granularity={timeGranularity}
            onGranularityChange={setTimeGranularity}
            rangeId={selectedRangeId}
            customerState={selectedCustomerState}
            customerStateLabel={selectedCustomerStateLabel}
            productCategory={selectedProductCategory}
            productCategoryLabel={selectedProductCategoryLabel}
          />
        </section>

        <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <OnTimeDelayPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
            customerStateLabel={selectedCustomerStateLabel}
            productCategoryLabel={selectedProductCategoryLabel}
          />
          <FreightDistributionPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
            customerStateLabel={selectedCustomerStateLabel}
            productCategoryLabel={selectedProductCategoryLabel}
          />
          <div className="md:col-span-2 2xl:col-span-1">
            <DelayReviewPanel
              panel={reviewPanel}
              rangeLabel={selectedRangeLabel}
              customerStateLabel={selectedCustomerStateLabel}
              productCategoryLabel={selectedProductCategoryLabel}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <CategorySharePanel
            panel={categoryPanel}
            rangeLabel={selectedRangeLabel}
            customerStateLabel={selectedCustomerStateLabel}
            focusedCategory={isProductCategoryFocused ? selectedProductCategoryLabel : null}
            focusedCategoryKey={isProductCategoryFocused ? selectedProductCategory : null}
          />
          <PaymentMixPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
            customerStateLabel={selectedCustomerStateLabel}
            productCategoryLabel={selectedProductCategoryLabel}
          />
        </section>
      </div>
    </main>
  );
}
