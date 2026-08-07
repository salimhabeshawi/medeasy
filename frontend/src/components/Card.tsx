import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tint?: 'paper' | 'red' | 'blue' | 'green' | 'yellow';
}

const tints = {
  paper: 'bg-paper',
  red: 'bg-vital-red',
  blue: 'bg-scrub-blue text-paper',
  green: 'bg-pulse-green',
  yellow: 'bg-chart-yellow',
};

export function Card({ tint = 'paper', className = '', ...props }: CardProps) {
  return <div className={`hard-surface ${tints[tint]} p-5 sm:p-6 ${className}`} {...props} />;
}
