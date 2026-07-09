'use client';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-4" role="alert">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-bold text-foreground">Não foi possível carregar o dashboard</h2>
      <p className="text-muted-foreground max-w-sm">{error.message}</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
