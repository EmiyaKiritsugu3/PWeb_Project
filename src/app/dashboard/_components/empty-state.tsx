import { Card, CardContent } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  testId?: string;
}

export function EmptyState({ icon, title, description, testId }: Readonly<EmptyStateProps>) {
  return (
    <Card glass data-testid={testId} className="border-dashed border-white/10">
      <CardContent className="flex flex-col items-center justify-center text-center py-16 gap-6">
        <div className="p-6 rounded-full bg-white/5 border border-white/5 animate-float">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold font-headline">{title}</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
