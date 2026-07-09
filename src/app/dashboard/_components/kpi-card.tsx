import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  delta?: number;
  icon: ReactNode;
}

function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${Math.round(delta * 100)}%`;
}

export function KpiCard({ title, value, delta, icon }: Readonly<KpiCardProps>) {
  const hasDelta = delta !== undefined;
  const positive = delta !== undefined && delta >= 0;

  return (
    <Card
      glass
      data-testid={`kpi-${title}`}
      className="group relative overflow-hidden border-white/5 transition-all duration-200 active:scale-[0.98] md:hover:border-primary/30 md:duration-500 md:hover:-translate-y-1 glow-cyan"
      aria-label={`${title}: ${value}${hasDelta ? `, variação ${formatDelta(delta!)}` : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-blue-600/10 text-primary border border-white/5 md:group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="text-2xl md:text-3xl font-headline font-black tracking-tight text-foreground drop-shadow-sm">
          {value}
        </div>
        {hasDelta && (
          <span
            className={cn(
              'mt-2 inline-flex items-center gap-1 text-xs font-bold',
              positive ? 'text-green-400' : 'text-red-400'
            )}
          >
            <span aria-hidden="true">{positive ? '▲' : '▼'}</span>{' '}
            <span>{formatDelta(delta!)}</span>
          </span>
        )}
      </CardContent>
    </Card>
  );
}
