import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function SvgBase(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17M8.5 13h3M8.5 16.5h6" />
    </SvgBase>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M12 20.5c3.9-4.2 5.9-7.2 5.9-10a5.9 5.9 0 1 0-11.8 0c0 2.8 2 5.8 5.9 10Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </SvgBase>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="M4 7.5v9L12 21l8-4.5v-9" />
      <path d="M12 12v9" />
    </SvgBase>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.8" />
      <path d="M3 10h18M7 14.5h3.5" />
    </SvgBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="m7 10 5 5 5-5" />
    </SvgBase>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="9" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
      <path d="M4 5h2l2.1 9.2h8.9l2.1-6.2H8.2" />
    </SvgBase>
  );
}

export function CoinIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M9.3 10.2c0-1.3 1.2-2.2 2.7-2.2 1.4 0 2.6.8 2.6 2 0 2.7-5.5 1.4-5.5 4 0 1.3 1.2 2.2 2.8 2.2 1.5 0 2.7-.9 2.7-2.2M12 7.2v9.6" />
    </SvgBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.6v4.8l3.4 2" />
    </SvgBase>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="m12 3.8 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3.8Z" />
    </SvgBase>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M3.5 7.5h10v8.5h-10zM13.5 10h3.2l2 2.2v3.8h-5.2z" />
      <circle cx="8" cy="18" r="1.4" />
      <circle cx="17" cy="18" r="1.4" />
    </SvgBase>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M8 4.5h8v2.3a4 4 0 0 1-4 4 4 4 0 0 1-4-4V4.5ZM8 6H4.5a3 3 0 0 0 3 3M16 6h3.5a3 3 0 0 1-3 3M12 10.8v4.1M8.2 19h7.6M10 14.9h4" />
    </SvgBase>
  );
}
