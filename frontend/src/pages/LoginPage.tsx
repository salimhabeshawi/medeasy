import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { ApiError } from '../lib/api';
import { useAuth } from '../providers/auth-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PasswordField } from '../components/PasswordField';

export function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      await login({ email, password });
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        setMessage(error.message);
      } else {
        setMessage('The login request failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs font-bold uppercase">Access chart</p>
            <h1 className="font-display text-4xl font-bold">Log in</h1>
          </div>
          <div className="rounded-[10px] border-2 border-ink bg-vital-red p-3 shadow-hard">
            <Activity aria-hidden="true" />
          </div>
        </div>
        {message ? <div className="mb-4 rounded-[10px] border-2 border-ink bg-vital-red p-3 text-sm font-bold">{message}</div> : null}
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 font-semibold">
            Email
            <input
              className="min-h-12 border-2 border-ink bg-paper px-3 shadow-hard"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            {errors.email ? <span className="text-sm font-bold text-vital-red">{errors.email[0]}</span> : null}
          </label>
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            error={errors.password?.[0]}
            autoComplete="current-password"
            required
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Checking' : 'Log in'}
          </Button>
        </form>
        <p className="mt-6 text-sm font-semibold">
          No account yet?{' '}
          <Link className="font-display font-bold underline decoration-2 underline-offset-4" to="/register">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
