'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AlunoSchema, AlunoBaseSchema } from '@/lib/definitions';
import type { AlunoBase } from '@/lib/definitions';
import { createClient } from '@/utils/supabase/server';
import * as Sentry from '@sentry/nextjs';
import { calculateTreinoRewards } from '@/services/gamificationService';

export async function finalizarTreinoAction(treinoId: string, durationMinutes: number = 60) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const hoje = new Date();

    // Executa a operação gamificada numa Transação Serializável e Atômica
    const historico = await prisma.$transaction(
      async (tx) => {
        // 1. Lock a linha do aluno pela verificação!
        const aluno = await tx.aluno.findUnique({
          where: { email: user.email },
        });

        if (!aluno) {
          throw new Error('Perfil de aluno não encontrado');
        }

        // 2. Criar Histórico de Treino
        const novoHistorico = await tx.historicoTreino.create({
          data: {
            alunoId: aluno.id,
            treinoId: treinoId,
            duracaoMinutos: durationMinutes,
            dataExecucao: hoje,
          },
        });

        // 3. Lógica de Gamificação (Delegated to Service)
        const rewards = calculateTreinoRewards(aluno, 0, hoje);

        // Update Aluno with rewards (idempotency handled by Service)
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

        return novoHistorico;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000, // retry behavior safe configurations
        timeout: 10000,
      }
    );

    revalidatePath('/aluno/dashboard');
    return { success: true, data: historico };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function createAlunoAction(
  data: Partial<AlunoBase> &
    Pick<AlunoBase, 'nomeCompleto' | 'cpf' | 'email' | 'telefone' | 'statusMatricula'>
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    // Validação Zod usando o BaseSchema (formulário não tem ID)
    const validatedData = AlunoBaseSchema.parse(data);

    const aluno = await prisma.aluno.create({
      data: {
        nomeCompleto: validatedData.nomeCompleto,
        cpf: validatedData.cpf,
        email: validatedData.email,
        telefone: validatedData.telefone,
        dataNascimento: validatedData.dataNascimento
          ? new Date(validatedData.dataNascimento)
          : null,
        statusMatricula: validatedData.statusMatricula,
        fotoUrl: `https://picsum.photos/seed/${Math.random().toString()}/100/100`,
      },
    });

    revalidatePath('/dashboard/alunos');
    // O retorno do Prisma inclui o ID, validado pelo AlunoSchema (Entity)
    return { success: true, data: AlunoSchema.parse(aluno) };
  } catch (error) {
    Sentry.captureException(error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Dados inválidos' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateAlunoAction(id: string, data: Partial<AlunoBase>) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    // Validação Zod parcial baseada no BaseSchema
    const validatedData = AlunoBaseSchema.partial().parse(data);

    const updated = await prisma.aluno.update({
      where: { id },
      data: {
        nomeCompleto: validatedData.nomeCompleto,
        cpf: validatedData.cpf,
        email: validatedData.email,
        telefone: validatedData.telefone,
        dataNascimento: validatedData.dataNascimento
          ? new Date(validatedData.dataNascimento)
          : null,
        statusMatricula: validatedData.statusMatricula,
      },
    });

    revalidatePath('/dashboard/alunos');
    return { success: true, data: AlunoSchema.parse(updated) };
  } catch (error) {
    Sentry.captureException(error);
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Dados inválidos' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteAlunoAction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    await prisma.aluno.delete({
      where: { id },
    });

    revalidatePath('/dashboard/alunos');
    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function createMatriculaAction(alunoId: string, planoId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const plano = await prisma.plano.findUnique({
      where: { id: planoId },
    });

    if (!plano) throw new Error('Plano não encontrado');

    // Lógica para criar Matrícula e Pagamento inicial
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataInicio.getDate() + plano.duracaoDias);

    const matricula = await prisma.matricula.create({
      data: {
        alunoId,
        planoId,
        dataInicio,
        dataVencimento: dataFim,
        status: 'ATIVA',
      },
    });

    // Criar Pagamento
    await prisma.pagamento.create({
      data: {
        alunoId,
        matriculaId: matricula.id,
        valor: plano.preco,
        dataPagamento: dataInicio,
        metodo: 'CARTAO', // Match MetodoPagamento ENUM
      },
    });

    revalidatePath('/dashboard/alunos');
    return { success: true, data: matricula };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
