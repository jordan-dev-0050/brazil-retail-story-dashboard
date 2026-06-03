import { useState } from 'react';
import { buildKpiCards, filterOptions } from '../data/dashboardData';
import type { DateRangeId, FilterId } from '../data/dashboardTypes';
import type { MapMetric } from '../data/dashboardMock';
import { BrazilMapPanel } from './BrazilMapPanel';
import { CategorySharePanel } from './CategorySharePanel';
import { DelayReviewPanel } from './DelayReviewPanel';
import { FilterBar } from './FilterBar';
import { FreightDistributionPanel } from './FreightDistributionPanel';
import { KpiCard } from './KpiCard';
import { OnTimeDelayPanel } from './OnTimeDelayPanel';
import { PaymentMixPanel } from './PaymentMixPanel';
import { TimeTrendPanel } from './TimeTrendPanel';

const initialFilterValues = Object.fromEntries(
  (Object.keys(filterOptions) as FilterId[]).map((id) => [id, filterOptions[id].options[0].value]),
) as Record<FilterId, string>;

export function DashboardPage() {
  const [filters, setFilters] = useState<Record<FilterId, string>>(initialFilterValues);
  const [mapMetric, setMapMetric] = useState<MapMetric>('orders');

  const selectedRangeId = filters.dateRange as DateRangeId;
  const kpiCards = buildKpiCards(selectedRangeId);

  const updateFilter = (id: FilterId, value: string) => {
    setFilters((current) => ({ ...current, [id]: value }));
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <FilterBar values={filters} onChange={updateFilter} />

        <section className="grid gap-4 sm:grid-cols-2">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
          <BrazilMapPanel metric={mapMetric} onMetricChange={setMapMetric} />
          <TimeTrendPanel rangeId={selectedRangeId} />
        </section>

        <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <OnTimeDelayPanel />
          <FreightDistributionPanel />
          <div className="md:col-span-2 2xl:col-span-1">
            <DelayReviewPanel />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <CategorySharePanel />
          <PaymentMixPanel />
        </section>
      </div>
    </main>
  );
}
