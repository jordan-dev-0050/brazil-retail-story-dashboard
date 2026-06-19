import type { Phase3CategoryPanel } from '../data/phase2DashboardTypes';
import { formatCurrencyCompact } from '../data/dashboardData';
import { ChartCard } from './ChartCard';
import { TrophyIcon } from './Icons';

type CategorySharePanelProps = {
  panel: Phase3CategoryPanel;
  focusedCategory: string | null;
  focusedCategoryKey: string | null;
};

const barColors = ['#2F7AE7', '#3F86EA', '#4B91ED', '#5A9AF0', '#7AAEF3', '#A7C8F8'];

function formatShare(value: number) {
  return `${value.toFixed(2)}%`;
}

export function CategorySharePanel({
  panel,
  focusedCategory,
  focusedCategoryKey,
}: CategorySharePanelProps) {
  const categories = panel.categories.slice(0, 6);
  const topCategory = panel.topCategory;
  const focusedCategoryRow = focusedCategoryKey
    ? panel.categories.find((category) => category.categoryKey === focusedCategoryKey) ?? null
    : null;
  const subtitle = focusedCategory
    ? 'Focused on selected category.'
    : 'Shows full category ranking.';

  return (
    <ChartCard
      title="Category Share / Top Categories"
      subtitle={subtitle}
      footer={
        <div className="flex items-center gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent-blue shadow-soft">
            <TrophyIcon className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate">
            {focusedCategoryRow ? 'Focused Category:' : 'Top Category by Item Share:'}{' '}
            <span className="font-semibold text-accent-blue">
              {focusedCategoryRow
                ? `${focusedCategoryRow.categoryLabel} (${formatShare(focusedCategoryRow.shareOfItems)})`
                : topCategory
                  ? `${topCategory.categoryLabel} (${formatShare(topCategory.shareOfItems)})`
                  : 'N/A'}
            </span>
          </p>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_72px_88px] gap-4 text-xs uppercase tracking-[0.08em] text-slate">
        <span>Category</span>
        <span className="text-right">Share</span>
        <span className="text-right">GMV (R$)</span>
      </div>
      <div className="space-y-5">
        {categories.map((category, index) => (
          <div
            key={category.categoryKey}
            className="grid grid-cols-[minmax(0,1fr)_72px_88px] gap-4"
          >
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-ink">{category.categoryLabel}</p>
                {focusedCategoryRow?.categoryKey === category.categoryKey ? (
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-blue">
                    Focused
                  </span>
                ) : null}
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(category.shareOfItems, 2)}%`,
                    backgroundColor: barColors[index] ?? '#D7DEE8',
                  }}
                />
              </div>
            </div>
            <p className="text-right text-sm font-medium text-ink">{formatShare(category.shareOfItems)}</p>
            <p className="text-right text-sm text-slate">{formatCurrencyCompact(category.totalGmv)}</p>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
