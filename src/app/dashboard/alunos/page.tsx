import { Suspense } from 'react';
import { getAlunos, getPlanos } from '@/lib/data';
import { AlunosClient } from './alunos-client';
import { TableSkeleton } from '@/components/ui/dashboard-skeletons';

// 1. Decouple data fetching into an async Server Component
async function AlunosDataWrapper() {
  const [alunos, planos] = await Promise.all([getAlunos(), getPlanos()]);

  const serializedAlunos = structuredClone(alunos);
  const serializedPlanos = structuredClone(planos);

  return <AlunosClient initialAlunos={serializedAlunos} planos={serializedPlanos} />;
}

// 2. Wrap the data component in a Suspense boundary with the Premium Skeleton
export default function AlunosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-dvh">
      <Suspense fallback={<TableSkeleton />}>
        <AlunosDataWrapper />
      </Suspense>
    </div>
  );
}
