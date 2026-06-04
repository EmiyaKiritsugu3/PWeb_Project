'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AlunoSchema, AlunoBaseSchema, MatriculaSchema } from '@/lib/definitions';
import type { Aluno, AlunoBase, Matricula } from '@/lib/definitions';
import { getUser } from '@/utils/supabase/server';
import * as Sentry from '@sentry/nextjs';
import { calculateTreinoRewards } from '@/services/gamificationService';
import { handleActionError, type ActionResult } from '@/lib/error';

export async function finalizarTreinoAction(
  treinoId: string,
  durationMinutes: number = 60
): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getUser();

    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const hoje = new Date();

    // Executa a operação gamificada numa Transação Serializável e Atômica
    await prisma.$transaction(
      async (tx) => {
        // 1. Lock a linha do aluno pela verificação!
        const aluno = await tx.aluno.findUnique({
          where: { email: user.email },
        });

        if (!aluno) {
          throw new Error('Perfil de aluno não encontrado');
        }

        // 2. Criar Histórico de Treino
        await tx.historicoTreino.create({
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
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000, // retry behavior safe configurations
        timeout: 10000,
      }
    );

    revalidatePath('/aluno/dashboard');
    return { success: true } satisfies ActionResult;
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}

export async function createAlunoAction(
  data: Partial<AlunoBase> &
    Pick<AlunoBase, 'nomeCompleto' | 'cpf' | 'email' | 'telefone' | 'statusMatricula'>
): Promise<ActionResult<Aluno>> {
  try {
    const { user, error: authError } = await getUser();
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
    return { success: true, data: AlunoSchema.parse(aluno) } satisfies ActionResult<Aluno>;
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}

export async function updateAlunoAction(
  id: string,
  data: Partial<AlunoBase>
): Promise<ActionResult<Aluno>> {
  try {
    const { user, error: authError } = await getUser();
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
    return { success: true, data: AlunoSchema.parse(updated) } satisfies ActionResult<Aluno>;
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}

export async function deleteAlunoAction(id: string): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    await prisma.aluno.delete({
      where: { id },
    });

    revalidatePath('/dashboard/alunos');
    return { success: true } satisfies ActionResult;
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}

export async function createMatriculaAction(
  alunoId: string,
  planoId: string
): Promise<ActionResult<Matricula>> {
  try {
    const { user, error: authError } = await getUser();
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
    return {
      success: true,
      data: MatriculaSchema.parse(matricula),
    } satisfies ActionResult<Matricula>;
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}
