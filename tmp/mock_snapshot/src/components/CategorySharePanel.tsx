import { categoryShareData } from '../data/dashboardMock';
import { ChartCard } from './ChartCard';
import { TrophyIcon } from './Icons';

export function CategorySharePanel() {
  return (
    <ChartCard
      title="Category Share / Top Categories"
      footer={
        <div className="flex items-center gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent-blue shadow-soft">
            <TrophyIcon className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate">
            Top Category by Orders:{' '}
            <span className="font-semibold text-accent-blue">Casa & Decoracao (24.1%)</span>
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
        {categoryShareData.map((category) => (
          <div key={category.name} className="grid grid-cols-[minmax(0,1fr)_72px_88px] gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-ink">{category.name}</p>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${category.share}%`, backgroundColor: category.color }}
                />
              </div>
            </div>
            <p className="text-right text-sm font-medium text-ink">{category.share}%</p>
            <p className="text-right text-sm text-slate">{category.gmv}</p>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
