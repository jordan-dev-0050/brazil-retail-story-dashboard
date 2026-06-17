import { CalendarIcon, CartIcon, ClockIcon, CoinIcon, StarIcon } from './Icons';

type IconName = 'orders' | 'gmv' | 'delivery' | 'delay' | 'review';

type KpiCardProps = {
  title: string;
  value: string;
  icon: IconName;
  chipClassName: string;
  caption?: string;
};

const iconMap = {
  orders: CartIcon,
  gmv: CoinIcon,
  delivery: CalendarIcon,
  delay: ClockIcon,
  review: StarIcon,
};

export function KpiCard({
  title,
  value,
  icon,
  chipClassName,
  caption,
}: KpiCardProps) {
  const Icon = iconMap[icon];

  return (
    <article className="rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-panel backdrop-blur">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${chipClassName}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate">{title}</p>
          <p className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-ink">{value}</p>
        </div>
      </div>
      {caption ? (
        <p className="mt-4 text-sm text-slate">{caption}</p>
      ) : null}
    </article>
  );
}
