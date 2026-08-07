interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'url';
  textarea?: boolean;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function FormField({ label, value, onChange, type = 'text', textarea = false, placeholder, required = false, error }: FormFieldProps) {
  return (
    <label className="grid gap-2 font-semibold">
      {label}
      {textarea ? (
        <textarea
          className="min-h-28 border-2 border-ink bg-paper px-3 py-2 shadow-hard"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="min-h-12 border-2 border-ink bg-paper px-3 shadow-hard"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
        />
      )}
      {error ? <span className="text-sm font-bold text-vital-red">{error}</span> : null}
    </label>
  );
}
