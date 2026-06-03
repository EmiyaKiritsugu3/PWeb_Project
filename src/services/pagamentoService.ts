/**
 * Pagamento Service
 * Encapsulates the business logic for registering payments and re-activating student enrollments.
 */

interface PaymentResult {
  success: boolean;
  error?: string;
}

export async function processPayment(
  alunoId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any
): Promise<PaymentResult> {
  // 1. Buscar o aluno e sua matrícula ativa (ou a mais recente vencida) incluindo o plano
  const aluno = await tx.aluno.findUnique({
    where: { id: alunoId },
    select: {
      id: true,
      Matriculas: {
        where: {
          status: { in: ['ATIVA', 'VENCIDA'] },
        },
        orderBy: { dataVencimento: 'desc' },
        take: 1,
        select: {
          id: true,
          dataVencimento: true,
          planoId: true,
          Plano: {
            select: {
              preco: true,
              duracaoDias: true,
            },
          },
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

  if (!matriculaAtiva.Plano) {
    throw new Error(`Plano ${matriculaAtiva.planoId} não encontrado durante o processamento.`);
  }

  // 2. Idempotency Check: Prevent multiple payments for the same enrollment on the same day
  const hoje = new Date();
  const hojeStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(hoje);

  const pagamentoHoje = await tx.pagamento.findFirst({
    where: {
      alunoId,
      matriculaId: matriculaAtiva.id,
      dataPagamento: {
        gte: new Date(`${hojeStr}T00:00:00.000Z`),
        lte: new Date(`${hojeStr}T23:59:59.999Z`),
      },
    },
  });

  if (pagamentoHoje) {
    return { success: true }; // Already processed today
  }

  // 3. Atualizar Aluno
  await tx.aluno.update({
    where: { id: alunoId },
    data: { statusMatricula: 'ATIVA' },
  });

  // 4. Atualizar Matrícula (Reativa e estende pela duração do plano)
  const novaDataVencimento = new Date(
    Math.max(hoje.getTime(), new Date(matriculaAtiva.dataVencimento).getTime())
  );
  novaDataVencimento.setDate(novaDataVencimento.getDate() + matriculaAtiva.Plano.duracaoDias);

  await tx.matricula.update({
    where: { id: matriculaAtiva.id },
    data: {
      status: 'ATIVA',
      dataVencimento: novaDataVencimento,
    },
  });

  // 5. Criar Registro de Pagamento
  await tx.pagamento.create({
    data: {
      alunoId: alunoId,
      matriculaId: matriculaAtiva.id,
      valor: matriculaAtiva.Plano.preco,
      metodo: 'PIX',
    },
  });

  return { success: true };
}
