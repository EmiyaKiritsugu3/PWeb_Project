import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock('@sentry/nextjs', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    captureException: vi.fn(),
  };
});
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    treino: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    aluno: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    historicoTreino: {
      create: vi.fn(),
    },
    $transaction: vi.fn((arg: unknown) => {
      // Array of promises pattern (batchUpsertTreinoAction)
      if (Array.isArray(arg))
        return Promise.all(arg.map((fn) => (typeof fn === 'function' ? fn(prismaMockTx) : fn)));
      // Callback pattern (upsertTreinoAction update, registrarHistoricoTreinoAction)
      return (arg as (tx: typeof prismaMockTx) => Promise<unknown>)(prismaMockTx);
    }),
  },
}));

// Fake transaction object matching the mocked methods
const prismaMockTx = {
  historicoTreino: { create: vi.fn() },
  aluno: { update: vi.fn() },
};

import {
  upsertTreinoAction,
  batchUpsertTreinoAction,
  updateTreinoDayAction,
  deleteTreinoAction,
  registrarHistoricoTreinoAction,
} from './treinos';
import { createClient, getUser } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

const mockCreateClient = vi.mocked(createClient);
const mockGetUser = vi.mocked(getUser);
const mockTreino = vi.mocked(prisma.treino);

const INSTRUTOR_UUID = '00000000-0000-0000-0000-000000000003';
const GERENTE_UUID = '00000000-0000-0000-0000-000000000001';
const RECEP_UUID = '00000000-0000-0000-0000-000000000002';
const ALUNO_UUID = '00000000-0000-0000-0000-000000000004';
const TREINO_UUID = '00000000-0000-0000-0000-000000000099';

const BASE_PAYLOAD = {
  alunoId: ALUNO_UUID,
  objetivo: 'Hipertrofia',
  diaSemana: 1 as number | null,
  exercicios: [{ nomeExercicio: 'Supino', series: 3, repeticoes: '10' }],
};

function buildSupabaseMock(userId: string | null, role: string | null, dbError = false) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi
            .fn()
            .mockResolvedValue(
              dbError
                ? { data: null, error: new Error('db error') }
                : { data: role ? { role } : null, error: null }
            ),
        }),
      }),
    }),
  };
}

// ─── upsertTreinoAction ────────────────────────────────────────────────────

describe('upsertTreinoAction — instrutorId derivation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockTreino.create.mockResolvedValue({ id: TREINO_UUID } as any);
  });

  it('INSTRUTOR: prisma.treino.create called with instrutorId = session user.id', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: INSTRUTOR_UUID, email: 'inst@test.com' } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });
    const supabase = buildSupabaseMock(INSTRUTOR_UUID, 'INSTRUTOR');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const result = await upsertTreinoAction(BASE_PAYLOAD);

    expect(result).toEqual({ success: true });
    expect(mockTreino.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ instrutorId: INSTRUTOR_UUID }),
      })
    );
  });

  it('GERENTE: prisma.treino.create called with instrutorId = null', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: GERENTE_UUID, email: 'gerente@test.com' } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });
    const supabase = buildSupabaseMock(GERENTE_UUID, 'GERENTE');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const result = await upsertTreinoAction(BASE_PAYLOAD);

    expect(result).toEqual({ success: true });
    expect(mockTreino.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ instrutorId: null }),
      })
    );
  });

  it('RECEPCIONISTA: returns Acesso não autorizado', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: RECEP_UUID, email: 'recep@test.com' } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });
    const supabase = buildSupabaseMock(RECEP_UUID, 'RECEPCIONISTA');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const result = await upsertTreinoAction(BASE_PAYLOAD);

    expect(result).toEqual({ success: false, error: 'Acesso não autorizado' });
    expect(mockTreino.create).not.toHaveBeenCalled();
  });

  it('unauthenticated: returns Usuário não autenticado', async () => {
    mockGetUser.mockResolvedValue({
      user: null,
      error: new Error('Unauthorized') as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });
    const supabase = buildSupabaseMock(null, null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const result = await upsertTreinoAction(BASE_PAYLOAD);

    expect(result).toEqual({ success: false, error: 'Usuário não autenticado' });
    expect(mockTreino.create).not.toHaveBeenCalled();
  });
});

// ─── batchUpsertTreinoAction — N+1 elimination ────────────────────────────

describe('batchUpsertTreinoAction', () => {
  const MULTI_WORKOUT = [BASE_PAYLOAD, { ...BASE_PAYLOAD, objetivo: 'Força', diaSemana: 3 }];

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.create.mockResolvedValue({ id: TREINO_UUID } as any);
  });

  it('INSTRUTOR: creates all workouts in a single transaction', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: INSTRUTOR_UUID, email: 'inst@test.com' } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });
    const supabase = buildSupabaseMock(INSTRUTOR_UUID, 'INSTRUTOR');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const result = await batchUpsertTreinoAction(MULTI_WORKOUT);

    expect(result).toEqual({ success: true });
    // Called once with an array of promises — 2 workouts = 2 creates
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(mockTreino.create).toHaveBeenCalledTimes(2);
  });

  it('GERENTE: creates workouts with null instrutorId', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: GERENTE_UUID, email: 'gerente@test.com' } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });
    const supabase = buildSupabaseMock(GERENTE_UUID, 'GERENTE');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    await batchUpsertTreinoAction(MULTI_WORKOUT);

    expect(mockTreino.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ instrutorId: null }) })
    );
  });

  it('RECEPCIONISTA: returns Acesso não autorizado', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: RECEP_UUID, email: 'recep@test.com' } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });
    const supabase = buildSupabaseMock(RECEP_UUID, 'RECEPCIONISTA');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const result = await batchUpsertTreinoAction(MULTI_WORKOUT);

    expect(result).toEqual({ success: false, error: 'Acesso não autorizado' });
    expect(mockTreino.create).not.toHaveBeenCalled();
  });

  it('unauthenticated: returns auth error', async () => {
    mockGetUser.mockResolvedValue({
      user: null,
      error: new Error('Unauthorized') as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    const result = await batchUpsertTreinoAction(MULTI_WORKOUT);

    expect(result).toEqual({ success: false, error: 'Usuário não autenticado' });
    expect(mockTreino.create).not.toHaveBeenCalled();
  });

  it('rejects invalid workout data before hitting DB', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: INSTRUTOR_UUID } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });
    const supabase = buildSupabaseMock(INSTRUTOR_UUID, 'INSTRUTOR');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const invalid = [{ ...BASE_PAYLOAD, objetivo: '' }];

    const result = await batchUpsertTreinoAction(invalid);

    expect(result.success).toBe(false);
    expect(mockTreino.create).not.toHaveBeenCalled();
  });
});

// ─── deleteTreinoAction — ownership ───────────────────────────────────────

describe('deleteTreinoAction — ownership check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.delete.mockResolvedValue({ id: TREINO_UUID } as any);
  });

  it('INSTRUTOR who owns the treino: delete succeeds', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: INSTRUTOR_UUID } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });
    const supabase = buildSupabaseMock(INSTRUTOR_UUID, 'INSTRUTOR');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.findUnique.mockResolvedValue({ instrutorId: INSTRUTOR_UUID } as any);

    const result = await deleteTreinoAction(TREINO_UUID);

    expect(result).toEqual({ success: true });
    expect(mockTreino.delete).toHaveBeenCalled();
  });

  it('INSTRUTOR who does NOT own the treino: returns Acesso não autorizado', async () => {
    const OTHER_INSTRUTOR = '00000000-0000-0000-0000-000000000099';
    const supabase = buildSupabaseMock(INSTRUTOR_UUID, 'INSTRUTOR');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.findUnique.mockResolvedValue({ instrutorId: OTHER_INSTRUTOR } as any);

    const result = await deleteTreinoAction(TREINO_UUID);

    expect(result).toEqual({ success: false, error: 'Acesso não autorizado' });
    expect(mockTreino.delete).not.toHaveBeenCalled();
  });

  it('GERENTE: delete succeeds regardless of treino owner', async () => {
    const supabase = buildSupabaseMock(GERENTE_UUID, 'GERENTE');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);
    // treino owned by someone else — GERENTE overrides
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.findUnique.mockResolvedValue({ instrutorId: INSTRUTOR_UUID } as any);

    const result = await deleteTreinoAction(TREINO_UUID);

    expect(result).toEqual({ success: true });
    expect(mockTreino.delete).toHaveBeenCalled();
  });
});

// ─── updateTreinoDayAction — ownership ────────────────────────────────────

describe('updateTreinoDayAction — ownership check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.update.mockResolvedValue({ id: TREINO_UUID } as any);
  });

  it('INSTRUTOR who owns the treino: update succeeds', async () => {
    const supabase = buildSupabaseMock(INSTRUTOR_UUID, 'INSTRUTOR');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.findUnique.mockResolvedValue({ instrutorId: INSTRUTOR_UUID } as any);

    const result = await updateTreinoDayAction(TREINO_UUID, 2);

    expect(result).toEqual({ success: true });
    expect(mockTreino.update).toHaveBeenCalled();
  });

  it('INSTRUTOR who does NOT own the treino: returns Acesso não autorizado', async () => {
    const OTHER_INSTRUTOR = '00000000-0000-0000-0000-000000000099';
    const supabase = buildSupabaseMock(INSTRUTOR_UUID, 'INSTRUTOR');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.findUnique.mockResolvedValue({ instrutorId: OTHER_INSTRUTOR } as any);

    const result = await updateTreinoDayAction(TREINO_UUID, 2);

    expect(result).toEqual({ success: false, error: 'Acesso não autorizado' });
    expect(mockTreino.update).not.toHaveBeenCalled();
  });

  it('GERENTE: update succeeds regardless of treino owner', async () => {
    const supabase = buildSupabaseMock(GERENTE_UUID, 'GERENTE');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTreino.findUnique.mockResolvedValue({ instrutorId: INSTRUTOR_UUID } as any);

    const result = await updateTreinoDayAction(TREINO_UUID, 2);

    expect(result).toEqual({ success: true });
    expect(mockTreino.update).toHaveBeenCalled();
  });
});

// ─── registrarHistoricoTreinoAction ──────────────────────────────────────────

describe('registrarHistoricoTreinoAction', () => {
  const ALUNO_ID = '00000000-0000-0000-0000-000000000004';

  const BASE_HISTORICO = {
    treinoId: TREINO_UUID,
    duracaoMinutos: 60,
    dataExecucao: new Date().toISOString(),
    exercicios: [
      {
        exercicioId: '00000000-0000-0000-0000-000000000010',
        nomeExercicio: 'Supino',
        seriesExecutadas: [
          { serieNumero: 1, peso: 20, repeticoesFeitas: 10, concluido: true },
          { serieNumero: 2, peso: 20, repeticoesFeitas: 10, concluido: true },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockGetUser.mockResolvedValue({
      user: { id: ALUNO_ID, email: 'aluno@test.com' } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      error: null,
    });

    vi.mocked(prisma.aluno.findUnique).mockResolvedValue({
      id: ALUNO_ID,
      exp: 0,
      nivel: 1,
      streakDiasSeguidos: 0,
      treinosNoMes: 0,
      ultimoTreinoData: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prismaMockTx.historicoTreino.create).mockResolvedValue({ id: 'hist-1' } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prismaMockTx.aluno.update).mockResolvedValue({ id: ALUNO_ID } as any);
  });

  it('deve registrar histórico e aplicar gamificação no aluno via transação', async () => {
    const result = await registrarHistoricoTreinoAction(BASE_HISTORICO);

    expect(result.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prismaMockTx.historicoTreino.create).toHaveBeenCalled();
    expect(prismaMockTx.aluno.update).toHaveBeenCalledWith({
      where: { id: ALUNO_ID },
      data: expect.objectContaining({
        exp: 120, // 100 base + 2 * 10 (séries)
        nivel: 1,
        streakDiasSeguidos: 1,
        treinosNoMes: 1,
        ultimoTreinoData: expect.any(Date),
      }),
    });
  });

  it('deve retornar erro se validação Zod falhar (ex: array de exercicios vazio se exigido)', async () => {
    const payloadInvalido = { ...BASE_HISTORICO, duracaoMinutos: -5 }; // Minutos inválidos
    const result = await registrarHistoricoTreinoAction(payloadInvalido);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Dados do histórico inválidos');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deve retornar erro de não autenticado se usuário não estiver logado', async () => {
    mockGetUser.mockResolvedValue({
      user: null,
      error: new Error('Unauthorized') as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    const result = await registrarHistoricoTreinoAction(BASE_HISTORICO);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Usuário não autenticado');
  });

  it('deve retornar erro genérico se a transação falhar e o erro for capturado pelo Sentry', async () => {
    vi.mocked(prisma.$transaction).mockRejectedValueOnce(new Error('Transaction Failed'));

    const result = await registrarHistoricoTreinoAction(BASE_HISTORICO);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao registrar treino. Tente novamente.');
    const { captureException } = await import('@sentry/nextjs');
    expect(captureException).toHaveBeenCalled();
  });
});
