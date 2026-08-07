import type { TopicStatus } from '../types/api';

const badgeMap: Record<TopicStatus, { label: string; className: string }> = {
  not_started: { label: 'not started', className: 'bg-vital-red' },
  in_progress: { label: 'in progress', className: 'bg-chart-yellow' },
  complete: { label: 'complete', className: 'bg-pulse-green' },
};

export function StatusBadge({ status }: { status: TopicStatus }) {
  const badge = badgeMap[status];

  return (
    <span className={`inline-flex rounded-full border-2 border-ink px-3 py-1 font-mono text-xs font-bold ${badge.className}`}>
      {badge.label}
    </span>
  );
}
