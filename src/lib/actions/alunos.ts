'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AlunoSchema, AlunoBaseSchema } from '@/lib/definitions';
import type { Aluno, AlunoBase } from '@/lib/definitions';
import { createClient } from '@/utils/supabase/server';

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
    const hojeStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(
      hoje
    ); // yyyy-mm-dd

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

        // 3. Lógica de Gamificação
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

          // Lógica de Streak (Ofensiva)
          const ontem = new Date();
          ontem.setDate(ontem.getDate() - 1);
          const ontemStr = new Intl.DateTimeFormat('fr-CA', {
            timeZone: 'America/Sao_Paulo',
          }).format(ontem);

          if (dataUltimoTreino === ontemStr) {
            novoStreak += 1;
            novaExp += 50; // Bônus de 50 XP por manter a sequência
          } else {
            novoStreak = 1;
          }

          // Lógica de Level Up ajustada para 1500 XP (Gold Standard)
          const expNecessaria = novoNivel * 1500;
          if (novaExp >= expNecessaria) {
            novaExp -= expNecessaria;
            novoNivel += 1;
          }

          // 4. Atualizar Aluno atomizado
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
  } catch (error: any) {
    console.error('Erro ao finalizar treino:', error);
    return { success: false, error: error.message };
  }
}

export async function createAlunoAction(data: any) {
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
  } catch (error: any) {
    console.error('Prisma create error:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Dados inválidos', details: error.flatten().fieldErrors };
    }
    return { success: false, error: error.message };
  }
}

export async function updateAlunoAction(id: string, data: any) {
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
  } catch (error: any) {
    console.error('Prisma update error:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Dados inválidos', details: error.flatten().fieldErrors };
    }
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error('Prisma delete error:', error);
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error('Prisma matricula error:', error);
    return { success: false, error: error.message };
  }
}
