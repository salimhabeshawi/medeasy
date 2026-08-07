import { ButtonLink } from '../components/Button';
import { Card } from '../components/Card';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="max-w-xl">
        <p className="font-display text-xs font-bold uppercase">404 readout</p>
        <h1 className="mt-2 font-display text-4xl font-bold">This route is not on the chart.</h1>
        <p className="mt-4 font-semibold">Return to the dashboard and continue from a known topic.</p>
        <ButtonLink className="mt-6" to="/dashboard">
          Open dashboard
        </ButtonLink>
      </Card>
    </main>
  );
}
