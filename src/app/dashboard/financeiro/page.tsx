import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import FinanceiroClient from './financeiro-client';
import { PremiumSkeleton } from '@/components/ui/premium-skeleton';
import { requireRole } from '@/lib/auth';
import { Role } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

async function FinanceiroDataWrapper() {
  const inadimplentes = await prisma.aluno.findMany({
    where: {
      statusMatricula: 'INADIMPLENTE',
    },
    select: {
      id: true,
      nomeCompleto: true,
      email: true,
      statusMatricula: true,
    },
    orderBy: {
      nomeCompleto: 'asc',
    },
  });

  return (
    <FinanceiroClient
      initialInadimplentes={inadimplentes.map((a) => ({
        ...a,
        statusMatricula: String(a.statusMatricula),
      }))}
    />
  );
}

export default async function FinanceiroPage() {
  await requireRole(Role.GERENTE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 bg-background min-h-dvh">
      <PageHeader
        title="Gestão Financeira"
        description="Acompanhe pagamentos e matrículas inadimplentes."
      />
      <Card glass className="border-white/10 rounded-xl glow-cyan transition-shadow">
        <CardHeader>
          <CardTitle className="text-foreground font-extrabold tracking-tight">
            Alunos Inadimplentes
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Lista de alunos com pagamentos pendentes. Registre um pagamento para reativar a
            matrícula e estender o vencimento em 30 dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PremiumSkeleton className="h-[400px] w-full rounded-xl" />}>
            <FinanceiroDataWrapper />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
