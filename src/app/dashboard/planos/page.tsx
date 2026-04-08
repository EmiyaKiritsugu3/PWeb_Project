import { Suspense } from 'react';
import { getPlanos } from '@/lib/data';
import { PlanosClient } from './planos-client';
import { Skeleton } from '@/components/ui/skeleton';

async function PlanosDataWrapper() {
  const planos = await getPlanos();
  const serialized = JSON.parse(JSON.stringify(planos));
  return <PlanosClient initialPlanos={serialized} />;
}

function PlanosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<PlanosSkeleton />}>
      <PlanosDataWrapper />
    </Suspense>
  );
}
