import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ClipboardPlus } from 'lucide-react';
import { ApiError } from '../lib/api';
import { useAuth } from '../providers/auth-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PasswordField } from '../components/PasswordField';

export function RegisterPage() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);

    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        setMessage(error.message);
      } else {
        setMessage('The register request failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs font-bold uppercase">New chart</p>
            <h1 className="font-display text-4xl font-bold">Register</h1>
          </div>
          <div className="rounded-[10px] border-2 border-ink bg-chart-yellow p-3 shadow-hard">
            <ClipboardPlus aria-hidden="true" />
          </div>
        </div>
        {message ? <div className="mb-4 rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}
        <form className="grid gap-4" onSubmit={onSubmit}>
          {(['name', 'email'] as const).map((field) => (
            <label className="grid gap-2 font-semibold" key={field}>
              {field[0].toUpperCase() + field.slice(1)}
              <input
                className="min-h-12 border-2 border-ink bg-paper px-3 shadow-hard"
                type={field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(event) => update(field, event.target.value)}
                autoComplete={field}
                required
              />
              {errors[field] ? <span className="text-sm font-bold text-vital-red">{errors[field][0]}</span> : null}
            </label>
          ))}
          <PasswordField
            label="Password"
            value={form.password}
            onChange={(value) => update('password', value)}
            error={errors.password?.[0]}
            autoComplete="new-password"
            required
          />
          <PasswordField
            label="Confirm password"
            value={form.password_confirmation}
            onChange={(value) => update('password_confirmation', value)}
            error={errors.password_confirmation?.[0]}
            autoComplete="new-password"
            required
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-sm font-semibold">
          Already registered?{' '}
          <Link className="font-display font-bold underline decoration-2 underline-offset-4" to="/login">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
