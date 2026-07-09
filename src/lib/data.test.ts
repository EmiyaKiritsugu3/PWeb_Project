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
    pagamento: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    matricula: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

import * as Sentry from '@sentry/nextjs';
import { prisma } from './prisma';
import {
  getAlunos,
  getPlanos,
  getTreinos,
  getAlunoDetalhes,
  getDashboardStats,
  getMatriculasPorMes,
  getReceitaPorMes,
  getMatriculasPorPlano,
} from './data';

const mockPrisma = vi.mocked(prisma);
const mockCaptureException = vi.mocked(Sentry.captureException);

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

  it('returns empty series (not fake) when no rows', async () => {
    vi.mocked(mockPrisma.aluno.count)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    vi.mocked(mockPrisma.matricula.count).mockResolvedValue(0);
    vi.mocked(mockPrisma.aluno.findMany).mockResolvedValue([]);
    vi.mocked(mockPrisma.pagamento.findMany).mockResolvedValue([]);
    vi.mocked(mockPrisma.pagamento.aggregate).mockResolvedValue({ _sum: { valor: 0 } });
    vi.mocked(mockPrisma.matricula.findMany).mockResolvedValue([]);

    const stats = await getDashboardStats();
    expect(stats.matriculasPorMes).toEqual([]);
    expect(stats.receitaPorMes).toEqual([]);
    expect(stats.matriculasPorPlano).toEqual([]);
    expect((stats as Record<string, unknown>).crescimentoAnual).toBeUndefined();
  });

  it('re-throws on DB failure (no silent default)', async () => {
    const { prisma } = await import('./prisma');
    vi.spyOn(prisma.aluno, 'count').mockRejectedValueOnce(new Error('db down'));
    await expect(getDashboardStats()).rejects.toThrow('db down');
  });
});

describe('series helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockPrisma.aluno.findMany).mockResolvedValue([]);
    vi.mocked(mockPrisma.pagamento.findMany).mockResolvedValue([]);
    vi.mocked(mockPrisma.matricula.findMany).mockResolvedValue([]);
    vi.mocked(mockPrisma.pagamento.aggregate).mockResolvedValue({ _sum: { valor: 0 } });
  });

  it('getMatriculasPorMes returns [] when no alunos', async () => {
    expect(await getMatriculasPorMes()).toEqual([]);
  });
  it('getReceitaPorMes returns [] when no pagamentos', async () => {
    expect(await getReceitaPorMes()).toEqual([]);
  });
  it('getMatriculasPorPlano returns [] when no matriculas', async () => {
    expect(await getMatriculasPorPlano()).toEqual([]);
  });

  it('getReceitaPorMes aggregates by month', async () => {
    vi.mocked(mockPrisma.pagamento.findMany).mockResolvedValue([
      { dataPagamento: new Date('2024-01-15'), valor: 100 },
      { dataPagamento: new Date('2024-01-20'), valor: 50 },
      { dataPagamento: new Date('2024-02-10'), valor: 200 },
    ] as never);

    expect(await getReceitaPorMes()).toEqual([
      { mes: '2024-01', total: 150 },
      { mes: '2024-02', total: 200 },
    ]);
  });

  it('getMatriculasPorPlano counts by plan name', async () => {
    vi.mocked(mockPrisma.matricula.findMany).mockResolvedValue([
      { Plano: { nome: 'Basic' } },
      { Plano: { nome: 'Basic' } },
      { Plano: { nome: 'Premium' } },
      { Plano: { nome: null } },
    ] as never);

    expect(await getMatriculasPorPlano()).toEqual([
      { plano: 'Basic', total: 2 },
      { plano: 'Premium', total: 1 },
      { plano: 'Sem plano', total: 1 },
    ]);
  });

  it('getMatriculasPorMes groups by month', async () => {
    vi.mocked(mockPrisma.aluno.findMany).mockResolvedValue([
      { dataCadastro: new Date('2024-01-05') },
      { dataCadastro: new Date('2024-01-25') },
      { dataCadastro: new Date('2024-03-10') },
    ] as never);

    expect(await getMatriculasPorMes()).toEqual([
      { mes: '2024-01', total: 2 },
      { mes: '2024-03', total: 1 },
    ]);
  });
});
