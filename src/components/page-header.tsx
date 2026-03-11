import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, description, actions, className }) => {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-4 md:py-6", className)}>
      <div className="grid gap-1">
        <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
};

export { PageHeader };
