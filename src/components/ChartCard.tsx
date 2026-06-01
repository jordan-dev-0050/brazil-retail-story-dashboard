import type { ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export function ChartCard({
  title,
  subtitle,
  actions,
  footer,
  className = '',
  contentClassName = '',
  children,
}: ChartCardProps) {
  return (
    <section
      className={`rounded-[30px] border border-white/70 bg-white/95 p-5 shadow-panel backdrop-blur sm:p-6 ${className}`}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.15rem] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate">{subtitle}</p> : null}
        </div>
        {actions}
      </header>
      <div className={contentClassName}>{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
