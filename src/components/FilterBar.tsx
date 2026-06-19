import type { ChangeEvent } from 'react';
import type { DashboardFilterOptions } from '../data/dashboardData';
import type { FilterId } from '../data/dashboardTypes';
import { BoxIcon, CalendarIcon, CardIcon, ChevronDownIcon, MapPinIcon } from './Icons';

type FilterBarProps = {
  configs: DashboardFilterOptions;
  values: Record<FilterId, string>;
  onChange: (id: FilterId, value: string) => void;
};

const iconMap = {
  dateRange: CalendarIcon,
  customerState: MapPinIcon,
  productCategory: BoxIcon,
  paymentType: CardIcon,
};

export function FilterBar({ configs, values, onChange }: FilterBarProps) {
  const handleChange = (id: FilterId) => (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(id, event.target.value);
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[180px_repeat(4,minmax(0,1fr))]">
      <div className="flex items-center px-2">
        <h1 className="text-[1.95rem] font-semibold tracking-[-0.035em] text-ink">
          Global Filters
        </h1>
      </div>

      {(Object.keys(configs) as FilterId[]).map((id) => {
        const Icon = iconMap[id];
        const config = configs[id];
        const selectId = `filter-${id}`;

        return (
          <div
            key={id}
            className={`relative flex items-center gap-3 rounded-[24px] border border-white/80 bg-white/95 px-4 py-4 shadow-panel backdrop-blur ${
              config.disabled ? 'opacity-70' : ''
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor={selectId} className="block text-sm font-medium text-slate">
                {config.label}
              </label>
              <div className="relative mt-1">
                <select
                  id={selectId}
                  disabled={config.disabled}
                  value={values[id]}
                  onChange={handleChange(id)}
                  className={`w-full appearance-none bg-transparent pr-8 text-base font-medium outline-none ${
                    config.disabled ? 'cursor-not-allowed text-slate' : 'cursor-pointer text-ink'
                  }`}
                >
                  {config.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 text-slate" />
              </div>
              {config.helperText ? (
                <p className="mt-2 text-xs leading-5 text-slate">{config.helperText}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
