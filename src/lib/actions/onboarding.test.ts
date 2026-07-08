import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeOnboardingAction } from './onboarding';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/utils/supabase/server', () => ({
  getUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));

vi.mock('@sentry/nextjs', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, captureException: vi.fn() };
});

describe('completeOnboardingAction', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  // 111.444.777-35 — passes CPF format regex + check-digit verification.
  const validCpf = '111.444.777-35';
  const userInput = {
    email: 'inamar@gmail.com',
    user_metadata: { full_name: 'Inamar Junior', avatar_url: 'https://g/avatar.png' },
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUser).mockResolvedValue({
      user: userInput as never,
      error: null,
    });
  });

  it('creates aluno with real CPF + address from form, nome/foto/email from session', async () => {
    vi.mocked(prisma.aluno.create).mockResolvedValue({ id: validId } as never);

    const result = await completeOnboardingAction({
      cpf: validCpf,
      telefone: '84999999999',
      dataNascimento: '1990-01-01',
      cep: '59000-000',
      endereco: 'Rua Exemplo',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Natal',
      estado: 'RN',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(validId);
    expect(prisma.aluno.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'inamar@gmail.com',
          nomeCompleto: 'Inamar Junior',
          fotoUrl: 'https://g/avatar.png',
          cpf: validCpf,
          cep: '59000-000',
          endereco: 'Rua Exemplo',
          numero: '100',
          bairro: 'Centro',
          cidade: 'Natal',
          estado: 'RN',
        }),
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith('/aluno/dashboard');
  });

  it('returns error when not authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue({ user: null, error: 'no session' } as never);
    const result = await completeOnboardingAction({ cpf: validCpf, cep: '59000-000' });
    expect(result.success).toBe(false);
  });

  it('returns error on invalid CPF (fails check digit)', async () => {
    const result = await completeOnboardingAction({
      cpf: '111.444.777-99', // valid format, wrong check digits
      telefone: '84999999999',
      dataNascimento: '1990-01-01',
      cep: '59000-000',
      endereco: 'Rua Exemplo',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Natal',
      estado: 'RN',
    });
    expect(result.success).toBe(false);
    expect(prisma.aluno.create).not.toHaveBeenCalled();
  });

  it('treats P2002 unique-violation race as success via refetch', async () => {
    const raceError = new Prisma.PrismaClientKnownRequestError('unique constraint', {
      code: 'P2002',
      clientVersion: '7',
    });
    vi.mocked(prisma.aluno.create).mockRejectedValue(raceError);
    vi.mocked(prisma.aluno.findUnique).mockResolvedValue({ id: validId } as never);

    const result = await completeOnboardingAction({
      cpf: validCpf,
      telefone: '84999999999',
      dataNascimento: '1990-01-01',
      cep: '59000-000',
      endereco: 'Rua Exemplo',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Natal',
      estado: 'RN',
    });

    expect(result.success).toBe(true);
    expect(prisma.aluno.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'inamar@gmail.com' } })
    );
  });
});
