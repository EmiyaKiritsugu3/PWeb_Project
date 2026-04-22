import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
      findFirst: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('successfully processes payment and extends enrollment', async () => {
    const alunoId = 'aluno-123';
    const matriculaId = 'mat-456';
    const mockDate = new Date('2026-04-22T12:00:00');
    vi.setSystemTime(mockDate);

    mockTx.aluno.findUnique.mockResolvedValue({
      id: alunoId,
      Matriculas: [
        {
          id: matriculaId,
          dataVencimento: new Date('2026-04-20T12:00:00'),
          planoId: 'p1',
          Plano: { preco: 150, duracaoDias: 30 },
        },
      ],
    });

    mockTx.pagamento.findFirst.mockResolvedValue(null);

    const result = await processPayment(alunoId, mockTx);

    expect(result.success).toBe(true);
    expect(mockTx.aluno.update).toHaveBeenCalled();
    expect(mockTx.matricula.update).toHaveBeenCalled();
    expect(mockTx.pagamento.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ valor: 150, metodo: 'PIX' }),
    });
  });

  it('skips processing if payment was already made today (idempotency)', async () => {
    const alunoId = 'aluno-123';
    mockTx.aluno.findUnique.mockResolvedValue({
      id: alunoId,
      Matriculas: [
        {
          id: 'm1',
          dataVencimento: new Date(),
          planoId: 'p1',
          Plano: { preco: 100, duracaoDias: 30 },
        },
      ],
    });
    mockTx.pagamento.findFirst.mockResolvedValue({ id: 'existing-payment' });

    const result = await processPayment(alunoId, mockTx);

    expect(result.success).toBe(true);
    expect(mockTx.aluno.update).not.toHaveBeenCalled();
    expect(mockTx.pagamento.create).not.toHaveBeenCalled();
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

  it('throws error if plano is missing in relation', async () => {
    mockTx.aluno.findUnique.mockResolvedValue({
      id: 'aluno-1',
      Matriculas: [{ id: 'm1', dataVencimento: new Date(), planoId: 'p1', Plano: null }],
    });

    await expect(processPayment('aluno-1', mockTx)).rejects.toThrow(
      'Plano p1 não encontrado durante o processamento.'
    );
  });
});
