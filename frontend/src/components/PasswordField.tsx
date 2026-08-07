import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}

export function PasswordField({ label, value, onChange, error, autoComplete, placeholder, required }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-2 font-semibold">
      {label}
      <span className="relative">
        <input
          className="min-h-12 w-full border-2 border-ink bg-paper px-3 pr-12 shadow-hard"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
        </button>
      </span>
      {error ? <span className="text-sm font-bold text-vital-red">{error}</span> : null}
    </label>
  );
}
