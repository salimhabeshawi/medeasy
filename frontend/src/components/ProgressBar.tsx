export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const bounded = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        {label ? <span className="font-display text-xs font-bold uppercase">{label}</span> : <span />}
        <span className="rounded-[8px] border-2 border-ink bg-paper px-2 py-1 font-mono text-sm font-bold">{bounded}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-[8px] border-2 border-ink bg-paper-muted">
        <div className="h-full border-r-2 border-ink bg-pulse-green" style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}
