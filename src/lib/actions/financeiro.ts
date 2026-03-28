'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registrarPagamentoAction(alunoId: string) {
  try {
    // 1. Buscar o aluno e sua matrícula ativa (ou a mais recente vencida)
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      select: {
        id: true,
        Matriculas: {
          orderBy: { dataVencimento: 'desc' },
          take: 1,
          select: {
            id: true,
            dataVencimento: true,
            planoId: true
          }
        }
      }
    });

    if (!aluno) {
      throw new Error("Aluno não encontrado");
    }

    const matriculaAtiva = aluno.Matriculas[0];

    if (!matriculaAtiva) {
      throw new Error("Matrícula não encontrada para este aluno.");
    }

    // 2. Transação: Atualizar status do aluno, status da matrícula e criar registro de pagamento
    await prisma.$transaction(async (tx) => {
      // Atualizar Aluno
      await tx.aluno.update({
        where: { id: alunoId },
        data: { statusMatricula: 'ATIVA' }
      });

      // Atualizar Matrícula (Reativa e estende por 30 dias se já estiver vencida ou prestes a vencer)
      const novaDataVencimento = new Date(Math.max(new Date().getTime(), new Date(matriculaAtiva.dataVencimento).getTime()));
      novaDataVencimento.setDate(novaDataVencimento.getDate() + 30);

      await tx.matricula.update({
        where: { id: matriculaAtiva.id },
        data: { 
          status: 'ATIVA',
          dataVencimento: novaDataVencimento
        }
      });

      // Criar Registro de Pagamento
      await tx.pagamento.create({
        data: {
          alunoId: alunoId,
          matriculaId: matriculaAtiva.id,
          valor: (await tx.plano.findUnique({ where: { id: matriculaAtiva.planoId } }))?.preco || 0,
          metodo: 'PIX', // Default por agora, pode ser parametrizado depois
        }
      });
    });

    revalidatePath("/dashboard/financeiro");
    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error);
    return { success: false, error: (error as Error).message };
  }
}
