import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processPayment } from './pagamentoService';

describe('PagamentoService', () => {
  const mockTx = {
    aluno: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    matricula: {
      update: vi.fn(),
    },
    plano: {
      findUnique: vi.fn(),
    },
    pagamento: {
      create: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully processes payment and extends enrollment', async () => {
    const alunoId = 'aluno-123';
    const matriculaId = 'mat-456';
    const planoId = 'plano-789';
    const mockDate = new Date('2026-04-22T12:00:00');
    vi.setSystemTime(mockDate);

    mockTx.aluno.findUnique.mockResolvedValue({
      id: alunoId,
      Matriculas: [
        {
          id: matriculaId,
          dataVencimento: new Date('2026-04-20T12:00:00'), // Expired 2 days ago
          planoId: planoId,
        },
      ],
    });

    mockTx.plano.findUnique.mockResolvedValue({ preco: 150 });

    const result = await processPayment(alunoId, mockTx);

    expect(result.success).toBe(true);

    // Should update student status
    expect(mockTx.aluno.update).toHaveBeenCalledWith({
      where: { id: alunoId },
      data: { statusMatricula: 'ATIVA' },
    });

    // Should update and extend matricula by 30 days from today (since it was expired)
    const expectedNewVencimento = new Date(mockDate);
    expectedNewVencimento.setDate(expectedNewVencimento.getDate() + 30);

    expect(mockTx.matricula.update).toHaveBeenCalledWith({
      where: { id: matriculaId },
      data: {
        status: 'ATIVA',
        dataVencimento: expectedNewVencimento,
      },
    });

    // Should create payment record
    expect(mockTx.pagamento.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        alunoId,
        matriculaId,
        valor: 150,
      }),
    });
  });

  it('returns error if aluno is not found', async () => {
    mockTx.aluno.findUnique.mockResolvedValue(null);
    const result = await processPayment('invalid-id', mockTx);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Aluno não encontrado');
  });

  it('returns error if no matricula is found', async () => {
    mockTx.aluno.findUnique.mockResolvedValue({ id: 'aluno-1', Matriculas: [] });
    const result = await processPayment('aluno-1', mockTx);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Matrícula não encontrada para este aluno.');
  });

  it('throws error if plano is not found', async () => {
    mockTx.aluno.findUnique.mockResolvedValue({
      id: 'aluno-1',
      Matriculas: [{ id: 'm1', dataVencimento: new Date(), planoId: 'p1' }],
    });
    mockTx.plano.findUnique.mockResolvedValue(null);

    await expect(processPayment('aluno-1', mockTx)).rejects.toThrow(
      'Plano p1 não encontrado durante o processamento.'
    );
  });
});
