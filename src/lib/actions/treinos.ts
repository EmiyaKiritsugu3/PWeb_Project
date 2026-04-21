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
import { createClient } from '@/utils/supabase/server';
import * as Sentry from '@sentry/nextjs';

export async function upsertTreinoAction(treinoData: TreinoBase | (TreinoBase & { id: string })) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Usuário não autenticado' };

    const { data: funcData, error: roleError } = await supabase
      .from('funcionarios')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (roleError) return { success: false, error: 'Erro ao verificar permissões' };

    // RECEPCIONISTA is explicitly blocked; ALUNO (not in funcionarios) gets null
    if (funcData?.role === 'RECEPCIONISTA') {
      return { success: false, error: 'Acesso não autorizado' };
    }
    const derivedInstrutorId = funcData?.role === 'INSTRUTOR' ? user.id : null;

    // Validação flexível: se tiver ID, valida como Entity; se não, como Base.
    let validatedData;
    if ('id' in treinoData && treinoData.id) {
      validatedData = TreinoSchema.parse(treinoData);
    } else {
      validatedData = TreinoBaseSchema.parse(treinoData);
    }

    // Extraímos os dados validados. 'id' será undefined se for Base.
    const { alunoId, objetivo, exercicios, diaSemana } = validatedData;
    const id =
      'id' in validatedData ? (validatedData as TreinoBase & { id: string }).id : undefined;

    if (id) {
      // Update
      await prisma.treino.update({
        where: { id },
        data: {
          objetivo,
          diaSemana,
          Exercicios: {
            deleteMany: {},
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
    } else {
      // Create
      await prisma.treino.create({
        data: {
          alunoId,
          instrutorId: derivedInstrutorId,
          objetivo,
          diaSemana,
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
    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Dados do treino inválidos' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateTreinoDayAction(treinoId: string, diaSemana: number | null) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Usuário não autenticado' };

    const { data: funcData } = await supabase
      .from('funcionarios')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const treino = await prisma.treino.findUnique({
      where: { id: treinoId },
      select: { instrutorId: true },
    });

    if (funcData?.role !== 'GERENTE' && treino?.instrutorId !== user.id) {
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
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTreinoAction(treinoId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Usuário não autenticado' };

    const { data: funcData } = await supabase
      .from('funcionarios')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const treino = await prisma.treino.findUnique({
      where: { id: treinoId },
      select: { instrutorId: true },
    });

    if (funcData?.role !== 'GERENTE' && treino?.instrutorId !== user.id) {
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
    return { success: false, error: (error as Error).message };
  }
}

export async function registrarHistoricoTreinoAction(
  historicoData: Omit<HistoricoTreinoBase, 'alunoId'>
) {
  try {
    const { createClient: createSupabaseClient } = await import('@/utils/supabase/server');
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Validação Zod: Para registro de histórico vindo do app, usamos o BaseSchema (o ID será gerado no DB)
    const validatedData = HistoricoTreinoBaseSchema.parse(historicoData);

    // Buscar aluno pelo email
    const aluno = await prisma.aluno.findUnique({
      where: { email: user.email! },
    });

    if (!aluno) {
      throw new Error('Perfil de aluno não encontrado');
    }

    const hoje = new Date();
    const hojeStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(
      hoje
    ); // yyyy-mm-dd

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

        // 2. Lógica de Gamificação
        let novoStreak = aluno.streakDiasSeguidos;
        let novoNivel = aluno.nivel;
        let novaExp = aluno.exp;
        let treinosNoMes = aluno.treinosNoMes;

        const dataUltimoTreino = aluno.ultimoTreinoData
          ? new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(
              new Date(aluno.ultimoTreinoData)
            )
          : null;

        if (dataUltimoTreino !== hojeStr) {
          // É um novo dia de treino!
          const mesAtualStr = hojeStr.split('-')[1];
          const mesUltimoTreinoStr = dataUltimoTreino ? dataUltimoTreino.split('-')[1] : null;

          if (mesAtualStr !== mesUltimoTreinoStr) {
            treinosNoMes = 1; // It's a new month, reset
          } else {
            treinosNoMes += 1;
          }

          novaExp += 100; // 100 XP base por treino completo

          // Bônus por volume de séries concluídas
          const totalSeriesConcluidas = validatedData.exercicios.reduce(
            (acc, ex) => acc + ex.seriesExecutadas.filter((s) => s.concluido).length,
            0
          );
          novaExp += totalSeriesConcluidas * 10; // 10 XP por série

          // Lógica de Streak (Ofensiva)
          const ontem = new Date();
          ontem.setDate(ontem.getDate() - 1);
          const ontemStr = new Intl.DateTimeFormat('fr-CA', {
            timeZone: 'America/Sao_Paulo',
          }).format(ontem);

          if (dataUltimoTreino === ontemStr) {
            novoStreak += 1;
            novaExp += 50; // Bônus de 50 XP por manter a sequência
          } else if (dataUltimoTreino !== hojeStr) {
            novoStreak = 1;
          }

          // Lógica de Level Up (Nível * 1500 XP - ajustado para o novo sistema)
          const expNecessaria = novoNivel * 1500;
          if (novaExp >= expNecessaria) {
            novaExp -= expNecessaria;
            novoNivel += 1;
          }

          // 3. Atualizar Aluno
          await tx.aluno.update({
            where: { id: aluno.id },
            data: {
              exp: novaExp,
              nivel: novoNivel,
              streakDiasSeguidos: novoStreak,
              treinosNoMes: treinosNoMes,
              ultimoTreinoData: hoje,
            },
          });
        }

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
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
