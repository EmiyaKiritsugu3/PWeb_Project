import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/utils/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    treino: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { upsertTreinoAction, updateTreinoDayAction, deleteTreinoAction } from './treinos';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

const mockCreateClient = vi.mocked(createClient);
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
    const supabase = buildSupabaseMock(RECEP_UUID, 'RECEPCIONISTA');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const result = await upsertTreinoAction(BASE_PAYLOAD);

    expect(result).toEqual({ success: false, error: 'Acesso não autorizado' });
    expect(mockTreino.create).not.toHaveBeenCalled();
  });

  it('unauthenticated: returns Usuário não autenticado', async () => {
    const supabase = buildSupabaseMock(null, null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    const result = await upsertTreinoAction(BASE_PAYLOAD);

    expect(result).toEqual({ success: false, error: 'Usuário não autenticado' });
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
