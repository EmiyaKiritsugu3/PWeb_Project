import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock('./prisma', () => ({
  prisma: {
    aluno: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    plano: {
      findMany: vi.fn(),
    },
    treino: {
      findMany: vi.fn(),
    },
    matricula: {
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

import * as Sentry from '@sentry/nextjs';
import { prisma } from './prisma';
import { getAlunos, getPlanos, getTreinos, getAlunoDetalhes, getDashboardStats } from './data';

const mockPrisma = vi.mocked(prisma);
const mockCaptureException = vi.mocked(Sentry.captureException);
const mockCaptureMessage = vi.mocked(Sentry.captureMessage);

const UUID = 'a1b2c3d4-e5f6-1a7b-8c9d-0e1f2a3b4c5d';
const UUID2 = 'b2c3d4e5-f6a7-2b8c-9d0e-1f2a3b4c5d6e';
const UUID3 = 'c3d4e5f6-a7b8-3c9d-a01f-2a3b4c5d6e7f';

function buildAluno(overrides: Record<string, unknown> = {}) {
  return {
    id: UUID,
    nomeCompleto: 'João Silva',
    cpf: '12345678900',
    email: 'joao@test.com',
    telefone: '11999998888',
    dataNascimento: '1995-01-01',
    dataCadastro: '2024-01-01',
    fotoUrl: null,
    biometriaHash: null,
    statusMatricula: 'ATIVA',
    nivel: 1,
    exp: 0,
    streakDiasSeguidos: 0,
    treinosNoMes: 0,
    ultimoTreinoData: null,
    xpToNextLevel: 1500,
    progressPerc: 0,
    dataVencimento: null,
    ...overrides,
  };
}

describe('getAlunos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validated alunos from database', async () => {
    const alunos = [buildAluno(), buildAluno({ id: UUID2, nomeCompleto: 'Maria' })];
    vi.mocked(mockPrisma.aluno.findMany).mockResolvedValue(alunos as never);

    const result = await getAlunos();

    expect(result).toHaveLength(2);
    expect(result[0].nomeCompleto).toBe('João Silva');
    expect(result[1].nomeCompleto).toBe('Maria');
    expect(mockPrisma.aluno.findMany).toHaveBeenCalledWith({ orderBy: { nomeCompleto: 'asc' } });
  });

  it('skips invalid alunos gracefully', async () => {
    const valid = buildAluno();
    const invalid = { id: 'not-a-uuid', nomeCompleto: 'X' };
    vi.mocked(mockPrisma.aluno.findMany).mockResolvedValue([valid, invalid] as never);

    const result = await getAlunos();

    expect(result).toHaveLength(1);
    expect(result[0].nomeCompleto).toBe('João Silva');
  });

  it('returns empty array on database error', async () => {
    vi.mocked(mockPrisma.aluno.findMany).mockRejectedValue(new Error('DB down'));

    const result = await getAlunos();

    expect(result).toEqual([]);
    expect(mockCaptureException).toHaveBeenCalled();
  });
});

describe('getPlanos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validated planos', async () => {
    const planos = [
      { id: UUID, nome: 'Básico', preco: 99.9, duracaoDias: 30 },
      { id: UUID2, nome: 'Premium', preco: 199.9, duracaoDias: 30 },
    ];
    vi.mocked(mockPrisma.plano.findMany).mockResolvedValue(planos as never);

    const result = await getPlanos();

    expect(result).toHaveLength(2);
    expect(result[0].nome).toBe('Básico');
    expect(mockPrisma.plano.findMany).toHaveBeenCalledWith({ orderBy: { preco: 'asc' } });
  });

  it('returns empty array on database error', async () => {
    vi.mocked(mockPrisma.plano.findMany).mockRejectedValue(new Error('DB error'));

    const result = await getPlanos();

    expect(result).toEqual([]);
    expect(mockCaptureException).toHaveBeenCalled();
  });
});

describe('getTreinos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validated treinos with exercises', async () => {
    const treinos = [
      {
        id: UUID,
        alunoId: UUID2,
        instrutorId: null,
        objetivo: 'Ganho muscular',
        dataCriacao: '2024-01-01',
        diaSemana: 1,
        Exercicios: [
          {
            id: UUID3,
            nomeExercicio: 'Supino',
            series: 4,
            repeticoes: '10-12',
            observacoes: null,
            descricao: null,
          },
        ],
      },
    ];
    vi.mocked(mockPrisma.treino.findMany).mockResolvedValue(treinos as never);

    const result = await getTreinos();

    expect(result).toHaveLength(1);
    expect(result[0].exercicios).toHaveLength(1);
    expect(result[0].exercicios[0].nomeExercicio).toBe('Supino');
  });

  it('filters by alunoId when provided', async () => {
    vi.mocked(mockPrisma.treino.findMany).mockResolvedValue([] as never);

    await getTreinos(UUID2);

    expect(mockPrisma.treino.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { alunoId: UUID2 } })
    );
  });

  it('returns empty array on database error', async () => {
    vi.mocked(mockPrisma.treino.findMany).mockRejectedValue(new Error('DB error'));

    const result = await getTreinos();

    expect(result).toEqual([]);
    expect(mockCaptureException).toHaveBeenCalled();
  });
});

describe('getAlunoDetalhes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns full aluno details with relations', async () => {
    const details = {
      id: UUID,
      nomeCompleto: 'Test',
      Matriculas: [],
      Pagamentos: [],
      Treinos: [],
      HistoricoTreinos: [],
    };
    vi.mocked(mockPrisma.aluno.findUnique).mockResolvedValue(details as never);

    const result = await getAlunoDetalhes(UUID);

    expect(result).toEqual(details);
    expect(mockPrisma.aluno.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: UUID } })
    );
  });

  it('returns null on database error', async () => {
    vi.mocked(mockPrisma.aluno.findUnique).mockRejectedValue(new Error('Not found'));

    const result = await getAlunoDetalhes('00000000-0000-0000-0000-000000000000');

    expect(result).toBeNull();
    expect(mockCaptureException).toHaveBeenCalled();
  });
});

describe('getDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns aggregated dashboard stats', async () => {
    vi.mocked(mockPrisma.aluno.count).mockResolvedValueOnce(50).mockResolvedValueOnce(0);
    vi.mocked(mockPrisma.matricula.count).mockResolvedValue(40);
    vi.mocked(mockPrisma.$queryRaw).mockResolvedValue([
      { TotalRecebido: 4500.5, Mes: '2024-06', QtdPagamentos: 35 },
    ] as never);

    const result = await getDashboardStats();

    expect(result.totalAlunos).toBe(50);
    expect(result.matriculasAtivas).toBe(40);
    expect(result.alunosInadimplentes).toBe(0);
    expect(result.faturamentoMensal).toBe(4500.5);
    expect(result.crescimentoAnual).toHaveLength(6);
  });

  it('sets faturamentoMensal to 0 when view query fails', async () => {
    vi.mocked(mockPrisma.aluno.count).mockResolvedValueOnce(10).mockResolvedValueOnce(10);
    vi.mocked(mockPrisma.matricula.count).mockResolvedValue(8);
    vi.mocked(mockPrisma.$queryRaw).mockRejectedValue(new Error('View missing'));

    const result = await getDashboardStats();

    expect(result.faturamentoMensal).toBe(0);
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      'Aviso: Falha ao ler V_FaturamentoMensal. O banco pode estar vazio ou a view ausente.',
      { extra: { viewError: 'Error: View missing' } }
    );
  });

  it('returns default safe stats on total failure', async () => {
    vi.mocked(mockPrisma.aluno.count).mockRejectedValue(new Error('Total failure'));

    const result = await getDashboardStats();

    expect(result.totalAlunos).toBe(0);
    expect(result.matriculasAtivas).toBe(0);
    expect(result.alunosInadimplentes).toBe(0);
    expect(result.faturamentoMensal).toBe(0);
    expect(result.crescimentoAnual).toEqual([]);
    expect(mockCaptureException).toHaveBeenCalled();
  });

  it('computes growth projection correctly', async () => {
    vi.mocked(mockPrisma.aluno.count).mockResolvedValueOnce(100).mockResolvedValueOnce(100);
    vi.mocked(mockPrisma.matricula.count).mockResolvedValue(100);
    vi.mocked(mockPrisma.$queryRaw).mockResolvedValue([] as never);

    const result = await getDashboardStats();

    // GROWTH_BASE_FACTOR = 0.7, GROWTH_INCREMENT = 0.05
    // Month 0: floor(100 * 0.7) = 70
    // Month 1: floor(100 * 0.75) = 75
    // Month 5: floor(100 * 0.95) = 95
    expect(result.crescimentoAnual[0].alunos).toBe(70);
    expect(result.crescimentoAnual[1].alunos).toBe(75);
    expect(result.crescimentoAnual[5].alunos).toBe(95);
  });
});
