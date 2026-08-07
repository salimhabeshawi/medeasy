import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

const variants = {
  primary: 'bg-vital-red text-ink',
  secondary: 'bg-paper text-ink',
  blue: 'bg-scrub-blue text-paper',
  green: 'bg-pulse-green text-ink',
  yellow: 'bg-chart-yellow text-ink',
};

type Variant = keyof typeof variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

export function Button({ className = '', variant = 'primary', icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={`pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border-2 border-ink px-4 py-2 font-display text-sm font-bold uppercase shadow-hard disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  icon?: ReactNode;
}

export function ButtonLink({ className = '', variant = 'primary', icon, children, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={`pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border-2 border-ink px-4 py-2 font-display text-sm font-bold uppercase shadow-hard ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}
