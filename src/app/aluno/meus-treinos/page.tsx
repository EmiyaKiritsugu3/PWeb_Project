import type { Treino } from '@/lib/definitions';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import MeusTreinosClient from './meus-treinos-client';

export default async function MeusTreinosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Não autorizado</div>;
  }

  // Buscar o aluno correspondente ao usuário logado
  const aluno = await prisma.aluno.findUnique({
    where: { email: user.email! },
    select: {
      id: true,
      Treinos: {
        select: {
          id: true,
          alunoId: true,
          instrutorId: true,
          objetivo: true,
          dataCriacao: true,
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
      },
    },
  });

  if (!aluno) {
    return <div>Aluno não encontrado</div>;
  }

  // Transformar treinos do Prisma para o formato da definição
  const treinosData: Treino[] = aluno.Treinos.map((t) => ({
    id: t.id,
    alunoId: t.alunoId,
    instrutorId: t.instrutorId || '',
    objetivo: t.objetivo,
    dataCriacao: t.dataCriacao.toISOString(),
    diaSemana: t.diaSemana,
    exercicios: t.Exercicios.map((ex) => ({
      id: ex.id,
      nomeExercicio: ex.nomeExercicio,
      series: ex.series,
      repeticoes: ex.repeticoes,
      observacoes: ex.observacoes || '',
      descricao: ex.descricao || '',
    })),
  }));

  return <MeusTreinosClient initialTreinos={treinosData} userId={aluno.id} />;
}
