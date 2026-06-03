'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  TreinoSchema,
  TreinoBaseSchema,
  HistoricoTreinoBaseSchema,
  type TreinoBase,
  type HistoricoTreinoBase,
} from '@/lib/definitions';
import { getUser, createClient } from '@/utils/supabase/server';
import * as Sentry from '@sentry/nextjs';
import { calculateTreinoRewards } from '@/services/gamificationService';
import { handleActionError } from '@/lib/error';

/**
 * Shared auth+role extraction. Returns the caller's role and derived instrutorId
 * or an error response that the caller should return immediately.
 */
async function getAuthRole() {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { error: 'Usuário não autenticado' as const };

  const supabase = await createClient();
  const { data: funcData, error: roleError } = await supabase
    .from('funcionarios')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (roleError) return { error: 'Erro ao verificar permissões' as const };
  if (funcData?.role === 'RECEPCIONISTA') return { error: 'Acesso não autorizado' as const };

  return {
    user,
    role: funcData?.role ?? null,
    derivedInstrutorId: funcData?.role === 'INSTRUTOR' ? user.id : null,
  };
}

async function performTreinoUpsert(
  validatedData: TreinoBase & { id?: string },
  user: { id: string },
  role: string | null,
  derivedInstrutorId: string | null
) {
  const { objetivo, exercicios, diaSemana } = validatedData;
  const alunoId = role === null ? user.id : validatedData.alunoId;
  const id = 'id' in validatedData ? (validatedData as TreinoBase & { id: string }).id : undefined;

  if (id) {
    // 1. Authorization check before update
    const existingTreino = await prisma.treino.findUnique({
      where: { id },
      select: { instrutorId: true, alunoId: true },
    });

    if (!existingTreino) return { success: false, error: 'Treino não encontrado' } as const;

    const isOwner =
      role === 'GERENTE' ||
      existingTreino.instrutorId === user.id ||
      existingTreino.alunoId === user.id;

    if (!isOwner) return { success: false, error: 'Acesso não autorizado para edição' } as const;

    // 2. Atomic Update Flow
    await prisma.$transaction(async (tx) => {
      // Preserve ownership fields unless caller is authorized to reassign them.
      // Only GERENTE can reassign a treino to a different aluno.
      const nextAlunoId = role === 'GERENTE' ? alunoId : existingTreino.alunoId;

      // If caller is an INSTRUTOR, they become the new instructor for this treino.
      // Otherwise (GERENTE/ALUNO), we preserve the existing instrutorId.
      const nextInstrutorId = role === 'INSTRUTOR' ? user.id : existingTreino.instrutorId;

      // Validation: If alunoId changed, ensure the target student exists
      if (nextAlunoId !== existingTreino.alunoId) {
        const studentExists = await tx.aluno.findUnique({ where: { id: nextAlunoId } });
        if (!studentExists) throw new Error('Aluno de destino não encontrado.');
      }

      await tx.treino.update({
        where: { id },
        data: {
          objetivo,
          diaSemana,
          alunoId: nextAlunoId,
          instrutorId: nextInstrutorId,
        },
      });

      await tx.exercicio.deleteMany({ where: { treinoId: id } });
      await tx.exercicio.createMany({
        data: exercicios.map((ex) => ({
          treinoId: id,
          nomeExercicio: ex.nomeExercicio,
          series: ex.series,
          repeticoes: ex.repeticoes,
          observacoes: ex.observacoes || '',
          descricao: ex.descricao || '',
        })),
      });
    });
  } else {
    // CREATE flow
    await prisma.treino.create({
      data: {
        objetivo,
        diaSemana,
        alunoId,
        instrutorId: derivedInstrutorId,
        Exercicios: {
          create: exercicios.map((ex) => ({
            nomeExercicio: ex.nomeExercicio,
            series: ex.series,
            repeticoes: ex.repeticoes,
            observacoes: ex.observacoes || '',
            descricao: ex.descricao || '',
          })),
        },
      },
    });
  }

  revalidatePath('/aluno/meus-treinos');
  revalidatePath('/dashboard/treinos');
  return { success: true } as const;
}

export async function upsertTreinoAction(treinoData: TreinoBase | (TreinoBase & { id: string })) {
  try {
    const auth = await getAuthRole();
    if ('error' in auth) return { success: false, error: auth.error };
    const { user, role, derivedInstrutorId } = auth;

    // Validação flexível: se tiver ID, valida como Entity; se não, como Base.
    let validatedData;
    if ('id' in treinoData && treinoData.id) {
      validatedData = TreinoSchema.parse(treinoData);
    } else {
      validatedData = TreinoBaseSchema.parse(treinoData);
    }

    return await performTreinoUpsert(validatedData, user, role, derivedInstrutorId);
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}

export async function batchUpsertTreinoAction(
  treinos: TreinoBase[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthRole();
    if ('error' in auth) return { success: false, error: auth.error };
    const { user, role, derivedInstrutorId } = auth;

    const validated = treinos.map((t) => TreinoBaseSchema.parse({ ...t, alunoId: t.alunoId }));

    await prisma.$transaction(
      validated.map((data) =>
        prisma.treino.create({
          data: {
            objetivo: data.objetivo,
            diaSemana: data.diaSemana,
            alunoId: role === null ? user.id : data.alunoId,
            instrutorId: derivedInstrutorId,
            Exercicios: {
              create: data.exercicios.map((ex) => ({
                nomeExercicio: ex.nomeExercicio,
                series: ex.series,
                repeticoes: ex.repeticoes,
                observacoes: ex.observacoes || '',
                descricao: ex.descricao || '',
              })),
            },
          },
        })
      )
    );

    revalidatePath('/aluno/meus-treinos');
    revalidatePath('/dashboard/treinos');
    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}

export async function updateTreinoDayAction(treinoId: string, diaSemana: number | null) {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: 'Usuário não autenticado' };

    const supabase = await createClient();
    const { data: funcData } = await supabase
      .from('funcionarios')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const treino = await prisma.treino.findUnique({
      where: { id: treinoId },
      select: { instrutorId: true, alunoId: true },
    });

    if (
      funcData?.role !== 'GERENTE' &&
      treino?.instrutorId !== user.id &&
      treino?.alunoId !== user.id
    ) {
      return { success: false, error: 'Acesso não autorizado' };
    }

    await prisma.treino.update({
      where: { id: treinoId },
      data: { diaSemana },
    });
    revalidatePath('/aluno/meus-treinos');
    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}
export async function deleteTreinoAction(treinoId: string) {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: 'Usuário não autenticado' };

    const supabase = await createClient();
    const { data: funcData } = await supabase

      .from('funcionarios')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const treino = await prisma.treino.findUnique({
      where: { id: treinoId },
      select: { instrutorId: true, alunoId: true },
    });

    if (
      funcData?.role !== 'GERENTE' &&
      treino?.instrutorId !== user.id &&
      treino?.alunoId !== user.id
    ) {
      return { success: false, error: 'Acesso não autorizado' };
    }

    await prisma.treino.delete({
      where: { id: treinoId },
    });
    revalidatePath('/aluno/meus-treinos');
    revalidatePath('/dashboard/treinos');
    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}

export async function registrarHistoricoTreinoAction(
  historicoData: Omit<HistoricoTreinoBase, 'alunoId'>
) {
  try {
    const { user, error: authError } = await getUser();

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Validação Zod: Para registro de histórico vindo do app, o alunoId vem da session
    const validatedData = HistoricoTreinoBaseSchema.omit({ alunoId: true }).parse(historicoData);

    // Buscar aluno pelo email
    const aluno = await prisma.aluno.findUnique({
      where: { email: user.email! },
    });

    if (!aluno) {
      throw new Error('Perfil de aluno não encontrado');
    }

    const hoje = new Date();

    // 1. Criar Histórico de Treino e Séries em uma transação
    const result = await prisma.$transaction(
      async (tx) => {
        const historico = await tx.historicoTreino.create({
          data: {
            alunoId: aluno.id,
            treinoId: validatedData.treinoId,
            duracaoMinutos: validatedData.duracaoMinutos,
            dataExecucao: new Date(validatedData.dataExecucao),
            SeriesExecutadas: {
              create: validatedData.exercicios.flatMap((ex) =>
                ex.seriesExecutadas.map((serie) => ({
                  exercicioId: ex.exercicioId,
                  nomeExercicio: ex.nomeExercicio,
                  serieNumero: serie.serieNumero,
                  peso: serie.peso,
                  repeticoesFeitas: serie.repeticoesFeitas,
                  concluido: serie.concluido,
                }))
              ),
            },
          },
        });

        // 2. Lógica de Gamificação (Delegated to Service)
        const totalSeriesConcluidas = validatedData.exercicios.reduce(
          (acc, ex) => acc + ex.seriesExecutadas.filter((s) => s.concluido).length,
          0
        );

        const rewards = calculateTreinoRewards(aluno, totalSeriesConcluidas, hoje);

        // 3. Atualizar Aluno (Always persist calculated rewards)
        await tx.aluno.update({
          where: { id: aluno.id },
          data: {
            exp: rewards.novaExp,
            nivel: rewards.novoNivel,
            streakDiasSeguidos: rewards.novoStreak,
            treinosNoMes: rewards.novosTreinosNoMes,
            ultimoTreinoData: hoje,
          },
        });

        return historico;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      }
    );

    revalidatePath('/aluno/dashboard');
    revalidatePath('/aluno/meus-treinos');
    return { success: true, data: result };
  } catch (error) {
    Sentry.captureException(error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Dados do histórico inválidos' };
    }
    return { success: false, error: 'Erro ao registrar treino. Tente novamente.' };
  }
}
