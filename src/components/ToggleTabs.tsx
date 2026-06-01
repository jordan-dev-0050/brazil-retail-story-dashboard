type TabOption<T extends string> = {
  label: string;
  value: T;
};

type ToggleTabsProps<T extends string> = {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function ToggleTabs<T extends string>({
  options,
  value,
  onChange,
}: ToggleTabsProps<T>) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              active
                ? 'bg-accent-blue text-white shadow-soft'
                : 'text-slate hover:bg-white hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
