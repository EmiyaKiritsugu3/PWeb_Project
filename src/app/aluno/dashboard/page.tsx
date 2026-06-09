import { getUser } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import AlunoDashboardClient from './dashboard-client';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import type { Aluno, Treino } from '@/lib/definitions';

export default async function AlunoDashboardPage() {
  const { user, error } = await getUser();

  if (error || !user) {
    redirect('/aluno/login');
  }

  // 1. Iniciar buscas em paralelo para evitar Waterfall
  const alunoPromise = prisma.aluno.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      nomeCompleto: true,
      fotoUrl: true,
      nivel: true,
      exp: true,
      statusMatricula: true,
      streakDiasSeguidos: true,
      treinosNoMes: true,
      ultimoTreinoData: true,
      Matriculas: {
        where: { status: 'ATIVA' },
        orderBy: { dataVencimento: 'desc' },
        take: 1,
        select: { id: true, status: true, dataVencimento: true, planoId: true },
      },
    },
  });

  const aluno = await alunoPromise;

  if (!aluno) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Sinto muito!</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Seu perfil de aluno não foi encontrado no novo sistema.</p>
            <p>
              Por favor, procure o administrador da academia para vincular seu email ({user.email}).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date().getDay();
  const treinoPromise = prisma.treino.findFirst({
    where: { alunoId: aluno.id, diaSemana: today },
    select: {
      id: true,
      objetivo: true,
      diaSemana: true,
      Exercicios: {
        select: {
          id: true,
          nomeExercicio: true,
          series: true,
          repeticoes: true,
          observacoes: true,
          descricao: true,
        },
      },
    },
  });

  const treinoDoDia = await treinoPromise;

  // 2. Serializar objetos de forma eficiente
  const serializedAluno = structuredClone(aluno) as unknown as Aluno;
  const serializedTreino = treinoDoDia ? (structuredClone(treinoDoDia) as unknown as Treino) : null;

  return <AlunoDashboardClient aluno={serializedAluno} initialTreino={serializedTreino} />;
}
