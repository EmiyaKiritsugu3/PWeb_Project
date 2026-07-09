import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { requireAnyRole } from '@/lib/auth';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import TreinosManagementClient from './treinos-client';
import type { Aluno } from '@/lib/definitions';

function TreinosSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

async function TreinosDataWrapper() {
  const alunosPrisma = await prisma.aluno.findMany({
    orderBy: { nomeCompleto: 'asc' },
  });

  const alunosData: Aluno[] = alunosPrisma.map((a) => ({
    id: a.id,
    nomeCompleto: a.nomeCompleto,
    cpf: a.cpf,
    email: a.email,
    telefone: a.telefone || '',
    dataNascimento: a.dataNascimento?.toISOString() || '',
    dataCadastro: a.dataCadastro.toISOString(),
    statusMatricula: a.statusMatricula,
    fotoUrl: a.fotoUrl || '',
    nivel: a.nivel,
    exp: a.exp,
    streakDiasSeguidos: a.streakDiasSeguidos,
    treinosNoMes: a.treinosNoMes,
    ultimoTreinoData: a.ultimoTreinoData?.toISOString() || null,
  }));

  return <TreinosManagementClient initialAlunos={alunosData} />;
}

export default async function TreinosPage() {
  await requireAnyRole(['INSTRUTOR', 'GERENTE']);

  return (
    <div className="pb-20">
      <PageHeader
        title="Gestão de Treinos"
        description="Monte treinos manualmente ou use a IA para gerar sugestões personalizadas para os alunos."
      />
      <Suspense fallback={<TreinosSkeleton />}>
        <TreinosDataWrapper />
      </Suspense>
    </div>
  );
}
