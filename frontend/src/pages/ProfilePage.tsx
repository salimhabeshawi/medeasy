import { FormEvent, useState } from 'react';
import { UserCog } from 'lucide-react';
import { ApiError } from '../lib/api';
import { useAuth } from '../providers/auth-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PasswordField } from '../components/PasswordField';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canEdit = user?.role !== 'admin' || Boolean(user?.is_super_admin);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);

    const payload: { name: string; email: string; password?: string; password_confirmation?: string } = {
      name: form.name,
      email: form.email,
    };

    if (form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    try {
      await updateProfile(payload);
      setForm((current) => ({ ...current, password: '', password_confirmation: '' }));
      setMessage('Profile updated.');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        setMessage(error.message);
      } else {
        setMessage('The profile update request failed before the API could answer.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <Card className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs font-bold uppercase">Account chart</p>
            <h1 className="font-display text-4xl font-bold">Edit profile</h1>
          </div>
          <div className="rounded-[10px] border-2 border-ink bg-scrub-blue p-3 text-paper shadow-hard">
            <UserCog aria-hidden="true" />
          </div>
        </div>
        {message ? (
          <div className={`mb-4 rounded-[10px] border-2 border-ink p-3 text-sm font-bold ${errors && Object.keys(errors).length ? 'bg-vital-red' : 'bg-pulse-green'}`}>
            {message}
          </div>
        ) : null}
        {!canEdit ? (
          <div className="grid gap-3 rounded-[10px] border-2 border-ink bg-chart-yellow p-4 font-semibold">
            <p className="font-display text-lg font-bold">Admin profile is locked.</p>
            <p className="text-sm">
              Only the app owner can change admin account details. Contact the owner if you believe this needs an update.
            </p>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2 font-semibold">
              Name
              <input
                className="min-h-12 border-2 border-ink bg-paper px-3 shadow-hard"
                type="text"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                autoComplete="name"
                required
              />
              {errors.name ? <span className="text-sm font-bold text-vital-red">{errors.name[0]}</span> : null}
            </label>
            <label className="grid gap-2 font-semibold">
              Email
              <input
                className="min-h-12 border-2 border-ink bg-paper px-3 shadow-hard"
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                autoComplete="email"
                required
              />
              {errors.email ? <span className="text-sm font-bold text-vital-red">{errors.email[0]}</span> : null}
            </label>
            <PasswordField
              label="New password"
              value={form.password}
              onChange={(value) => update('password', value)}
              error={errors.password?.[0]}
              autoComplete="new-password"
              placeholder="Leave blank to keep current password"
            />
            <PasswordField
              label="Confirm new password"
              value={form.password_confirmation}
              onChange={(value) => update('password_confirmation', value)}
              error={errors.password_confirmation?.[0]}
              autoComplete="new-password"
              placeholder="Repeat the new password"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving' : 'Save changes'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
