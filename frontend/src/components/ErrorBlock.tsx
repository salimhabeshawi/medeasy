import { AlertTriangle } from 'lucide-react';
import { Card } from './Card';

export function ErrorBlock({ title = 'The API did not return a clean readout.', message }: { title?: string; message: string }) {
  return (
    <Card tint="red">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold">{message}</p>
        </div>
      </div>
    </Card>
  );
}
