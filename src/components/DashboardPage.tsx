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
  const filterConfigs = getDashboardFilterOptions(selectedRangeId);
  const selectedPaymentType = (
    filterConfigs.paymentType.options.find((option) => option.value === filters.paymentType)?.value ??
    filterConfigs.paymentType.options[0]?.value ??
    'all'
  ) as PaymentTypeId;
  const kpiCards = buildKpiCards(selectedRangeId);
  const paymentPanelSlice = getDashboardPaymentPanelSlice(selectedRangeId, selectedPaymentType);
  const geographyPanel = getDashboardGeographyPanel(selectedRangeId);
  const categoryPanel = getDashboardCategoryPanel(selectedRangeId);
  const reviewPanel = getDashboardReviewPanel(selectedRangeId);
  const selectedRangeLabel =
    filterConfigs.dateRange.options.find((option) => option.value === selectedRangeId)?.label ??
    selectedRangeId;
  const paymentTypeLabel = getDashboardPaymentTypeLabel(selectedRangeId, selectedPaymentType);

  const updateFilter = (id: FilterId, value: string) => {
    setFilters((current) => {
      if (id !== 'dateRange') {
        return { ...current, [id]: value };
      }

      const nextRangeId = value as DateRangeId;
      const nextPaymentOptions = getDashboardFilterOptions(nextRangeId).paymentType.options;
      const paymentTypeValue = nextPaymentOptions.some(
        (option) => option.value === current.paymentType,
      )
        ? current.paymentType
        : (nextPaymentOptions[0]?.value ?? 'all');

      return {
        ...current,
        dateRange: nextRangeId,
        paymentType: paymentTypeValue,
      };
    });
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <FilterBar configs={filterConfigs} values={filters} onChange={updateFilter} />

        <section className="rounded-[24px] border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-slate shadow-soft">
          <p>
            <span className="font-semibold text-ink">Hybrid boundary:</span> KPI cards are now
            fully real-backed, and monthly Time Trend reads from the dashboard artifact. Payment
            Type still updates only Freight Distribution, Payment Mix, and On-time vs Delayed,
            while Brazil Map, Category Share, and Delay vs Review remain artifact-backed by date
            range only.
          </p>
        </section>

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
          />
          <TimeTrendPanel
            granularity={timeGranularity}
            onGranularityChange={setTimeGranularity}
            rangeId={selectedRangeId}
          />
        </section>

        <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <OnTimeDelayPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
          />
          <FreightDistributionPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
          />
          <div className="md:col-span-2 2xl:col-span-1">
            <DelayReviewPanel panel={reviewPanel} rangeLabel={selectedRangeLabel} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <CategorySharePanel panel={categoryPanel} rangeLabel={selectedRangeLabel} />
          <PaymentMixPanel
            slice={paymentPanelSlice}
            rangeLabel={selectedRangeLabel}
            paymentTypeLabel={paymentTypeLabel}
          />
        </section>
      </div>
    </main>
  );
}
