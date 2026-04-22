/**
 * Pagamento Service
 * Encapsulates the business logic for registering payments and re-activating student enrollments.
 */

export interface PaymentResult {
  success: boolean;
  error?: string;
}

export async function processPayment(
  alunoId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accommodate both PrismaClient and Prisma.TransactionClient
  tx: any
): Promise<PaymentResult> {
  // 1. Buscar o aluno e sua matrícula ativa (ou a mais recente vencida)
  const aluno = await tx.aluno.findUnique({
    where: { id: alunoId },
    select: {
      id: true,
      Matriculas: {
        orderBy: { dataVencimento: 'desc' },
        take: 1,
        select: {
          id: true,
          dataVencimento: true,
          planoId: true,
        },
      },
    },
  });

  if (!aluno) {
    return { success: false, error: 'Aluno não encontrado' };
  }

  const matriculaAtiva = aluno.Matriculas[0];

  if (!matriculaAtiva) {
    return { success: false, error: 'Matrícula não encontrada para este aluno.' };
  }

  // 2. Atualizar Aluno
  await tx.aluno.update({
    where: { id: alunoId },
    data: { statusMatricula: 'ATIVA' },
  });

  // 3. Atualizar Matrícula (Reativa e estende por 30 dias)
  const novaDataVencimento = new Date(
    Math.max(new Date().getTime(), new Date(matriculaAtiva.dataVencimento).getTime())
  );
  novaDataVencimento.setDate(novaDataVencimento.getDate() + 30);

  await tx.matricula.update({
    where: { id: matriculaAtiva.id },
    data: {
      status: 'ATIVA',
      dataVencimento: novaDataVencimento,
    },
  });

  // 4. Criar Registro de Pagamento
  const plano = await tx.plano.findUnique({ where: { id: matriculaAtiva.planoId } });

  await tx.pagamento.create({
    data: {
      alunoId: alunoId,
      matriculaId: matriculaAtiva.id,
      valor: plano?.preco || 0,
      metodo: 'PIX',
    },
  });

  return { success: true };
}
