import { getUser } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import AlunoDashboardClient from './dashboard-client';
import { redirect } from 'next/navigation';
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

  // No alunos row → first-time OAuth user. Send to onboarding to collect
  // required CPF + address. The onboarding action is the sole writer of new
  // OAuth-origin rows (replaces the old placeholder-CPF auto-provision).
  if (!aluno) {
    redirect('/aluno/onboarding');
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

  // Remap Prisma relation name (Exercicios) → Zod/Treino type (exercicios)
  const mappedTreino = treinoDoDia
    ? {
        id: treinoDoDia.id,
        objetivo: treinoDoDia.objetivo,
        diaSemana: treinoDoDia.diaSemana,
        exercicios: treinoDoDia.Exercicios,
      }
    : null;

  // 2. Serializar objetos de forma eficiente
  const serializedAluno = structuredClone(aluno) as unknown as Aluno;
  const serializedTreino = mappedTreino
    ? (structuredClone(mappedTreino) as unknown as Treino)
    : null;

  return <AlunoDashboardClient aluno={serializedAluno} initialTreino={serializedTreino} />;
}
