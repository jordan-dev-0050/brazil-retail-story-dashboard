import { useState } from 'react';
import {
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

export function DashboardPage() {
  const [filters, setFilters] = useState<Record<FilterId, string>>(() => getInitialFilterValues());
  const [mapMetric, setMapMetric] = useState<MapMetric>('orders');
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('monthly');

  const selectedRangeId = filters.dateRange as DateRangeId;
  const filterConfigs = getDashboardFilterOptions(selectedRangeId, filters.customerState);
  const selectedCustomerState =
    filterConfigs.customerState.options.find((option) => option.value === filters.customerState)?.value ??
    filterConfigs.customerState.options[0]?.value ??
    'all-states';
  const selectedCustomerStateLabel =
    filterConfigs.customerState.options.find((option) => option.value === selectedCustomerState)?.label ??
    'All States';
  const selectedPaymentType = (
    filterConfigs.paymentType.options.find((option) => option.value === filters.paymentType)?.value ??
    filterConfigs.paymentType.options[0]?.value ??
    'all'
  ) as PaymentTypeId;
  const kpiCards = buildKpiCards(selectedRangeId, selectedCustomerState);
  const paymentPanelSlice = getDashboardPaymentPanelSlice(
    selectedRangeId,
    selectedPaymentType,
    selectedCustomerState,
  );
  const geographyPanel = getDashboardGeographyPanel(selectedRangeId);
  const categoryPanel = getDashboardCategoryPanel(selectedRangeId, selectedCustomerState);
  const reviewPanel = getDashboardReviewPanel(selectedRangeId, selectedCustomerState);
  const selectedRangeLabel =
    filterConfigs.dateRange.options.find((option) => option.value === selectedRangeId)?.label ??
    selectedRangeId;
  const paymentTypeLabel = getDashboardPaymentTypeLabel(
    selectedRangeId,
    selectedPaymentType,
    selectedCustomerState,
  );

  const updateFilter = (id: FilterId, value: string) => {
    setFilters((current) => {
      if (id === 'customerState') {
        const nextCustomerState = value;
        const nextPaymentOptions = getDashboardFilterOptions(
          current.dateRange as DateRangeId,
          nextCustomerState,
        ).paymentType.options;
        const paymentTypeValue = nextPaymentOptions.some(
          (option) => option.value === current.paymentType,
        )
          ? current.paymentType
          : (nextPaymentOptions[0]?.value ?? 'all');

        return {
          ...current,
          customerState: nextCustomerState,
          paymentType: paymentTypeValue,
        };
      }

      if (id !== 'dateRange') {
        return { ...current, [id]: value };
      }

      const nextRangeId = value as DateRangeId;
      const nextFilterOptions = getDashboardFilterOptions(nextRangeId, current.customerState);
      const customerStateValue = nextFilterOptions.customerState.options.some(
        (option) => option.value === current.customerState,
      )
        ? current.customerState
        : (nextFilterOptions.customerState.options[0]?.value ?? 'all-states');
      const nextPaymentOptions = getDashboardFilterOptions(
        nextRangeId,
        customerStateValue,
      ).paymentType.options;
      const paymentTypeValue = nextPaymentOptions.some(
        (option) => option.value === current.paymentType,
      )
        ? current.paymentType
        : (nextPaymentOptions[0]?.value ?? 'all');

      return {
        ...current,
        dateRange: nextRangeId,
        customerState: customerStateValue,
        paymentType: paymentTypeValue,
      };
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
          />
          <TimeTrendPanel
            granularity={timeGranularity}
            onGranularityChange={setTimeGranularity}
            rangeId={selectedRangeId}
            customerState={selectedCustomerState}
            customerStateLabel={selectedCustomerStateLabel}
          />
        </section>

        <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <OnTimeDelayPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
            customerStateLabel={selectedCustomerStateLabel}
          />
          <FreightDistributionPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
            customerStateLabel={selectedCustomerStateLabel}
          />
          <div className="md:col-span-2 2xl:col-span-1">
            <DelayReviewPanel
              panel={reviewPanel}
              rangeLabel={selectedRangeLabel}
              customerStateLabel={selectedCustomerStateLabel}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <CategorySharePanel
            panel={categoryPanel}
            rangeLabel={selectedRangeLabel}
            customerStateLabel={selectedCustomerStateLabel}
          />
          <PaymentMixPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
            customerStateLabel={selectedCustomerStateLabel}
          />
        </section>
      </div>
    </main>
  );
}
