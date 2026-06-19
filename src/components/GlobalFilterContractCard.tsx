import type {
  DashboardFilterContract,
  DashboardFilterContractStatus,
} from '../data/dashboardData';

type GlobalFilterContractCardProps = {
  contract: DashboardFilterContract;
};

const statusStyles: Record<DashboardFilterContractStatus, string> = {
  'global-cohort-active': 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'staged-global-cohort': 'border-amber-200 bg-amber-50 text-amber-800',
  'secondary-slice-only': 'border-blue-200 bg-blue-50 text-blue-800',
  'focused-mode': 'border-cyan-200 bg-cyan-50 text-cyan-800',
  'not-yet-applied': 'border-slate-200 bg-slate-100 text-slate-700',
};

const statusLabels: Record<DashboardFilterContractStatus, string> = {
  'global-cohort-active': 'Global Cohort Active',
  'staged-global-cohort': 'Staged Global Cohort',
  'secondary-slice-only': 'Secondary Slice Only',
  'focused-mode': 'Focused Mode',
  'not-yet-applied': 'Not Yet Applied',
};

function StatusBadge({ status }: { status: DashboardFilterContractStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function GlobalFilterContractCard({ contract }: GlobalFilterContractCardProps) {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-soft sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">{contract.headline}</h2>
        <StatusBadge status={contract.status} />
      </div>
      <p className="mt-2 max-w-5xl text-sm text-slate">{contract.description}</p>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          {contract.filters.map((filter) => (
            <div
              key={filter.filterId}
              className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink">{filter.label}</p>
                <StatusBadge status={filter.status} />
              </div>
              <p className="mt-2 text-sm text-slate">{filter.summary}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {contract.panels.map((panel) => (
            <div
              key={panel.id}
              className="rounded-[20px] border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{panel.label}</p>
                <StatusBadge status={panel.status} />
              </div>
              <p className="mt-2 text-sm text-slate">{panel.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
