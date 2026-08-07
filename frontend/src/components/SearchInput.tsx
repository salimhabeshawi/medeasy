import { Search, X } from 'lucide-react';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`relative block ${className}`}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[10px] border-2 border-ink bg-paper py-2.5 pl-11 pr-10 font-semibold shadow-hard"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="pressable absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[8px] border-2 border-ink bg-paper-muted p-1"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      ) : null}
    </label>
  );
}
