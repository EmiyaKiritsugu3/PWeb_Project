import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlunoDashboardPage from './page';
import type { ReactNode } from 'react';

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock('next/navigation', () => ({
  redirect: (...args: [string]) => mockRedirect(...args),
}));

vi.mock('@/utils/supabase/server', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findUnique: vi.fn(),
    },
    treino: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('./dashboard-client', () => ({
  __esModule: true,
  default: ({
    aluno,
    initialTreino,
  }: {
    aluno: { nomeCompleto: string };
    initialTreino: unknown;
  }) => (
    <div data-testid="dashboard-client">
      <span data-testid="aluno-name">{aluno.nomeCompleto}</span>
      <span data-testid="has-treino">{initialTreino ? 'yes' : 'no'}</span>
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import { getUser } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

const mockGetUser = vi.mocked(getUser);
const mockPrismaAluno = vi.mocked(prisma.aluno.findUnique);
const mockPrismaTreino = vi.mocked(prisma.treino.findFirst);

function makeAluno() {
  return {
    id: '1',
    nomeCompleto: 'João Silva',
    email: 'test@test.com',
    cpf: '12345678900',
    telefone: '11999999999',
    dataNascimento: new Date('1990-01-01'),
    dataCadastro: new Date('2024-01-01'),
    fotoUrl: null,
    biometriaHash: null,
    statusMatricula: 'ATIVA',
    nivel: 5,
    exp: 1200,
    streakDiasSeguidos: 7,
    treinosNoMes: 12,
    ultimoTreinoData: null,
    progressPerc: 50,
    dataVencimento: null,
    xpToNextLevel: 100,
    Matriculas: [],
    HistoricoTreinos: [],
    Treinos: [],
    Pagamentos: [],
  };
}

describe('AlunoDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: 'not authenticated' } as never);
    await expect(AlunoDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/aluno/login');
  });

  it('redirects to login when user is null', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: null });
    await expect(AlunoDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/aluno/login');
  });

  it('renders not found card when aluno is null in database', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
      error: null,
    } as never);
    mockPrismaAluno.mockResolvedValue(null);
    render(await AlunoDashboardPage());
    expect(screen.getByText('Sinto muito!')).toBeTruthy();
  });

  it('renders dashboard client when aluno is found', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
      error: null,
    } as never);
    mockPrismaAluno.mockResolvedValue(makeAluno() as never);
    mockPrismaTreino.mockResolvedValue(null);
    render(await AlunoDashboardPage());
    expect(screen.getByTestId('dashboard-client')).toBeTruthy();
    expect(screen.getByTestId('aluno-name').textContent).toBe('João Silva');
  });

  it('passes treino data when workout exists for today', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
      error: null,
    } as never);
    mockPrismaAluno.mockResolvedValue(makeAluno() as never);
    mockPrismaTreino.mockResolvedValue({
      id: 'treino-1',
      alunoId: '1',
      objetivo: 'Hipertrofia',
      diaSemana: 1,
      instrutorId: null,
      dataCriacao: new Date(),
    });
    render(await AlunoDashboardPage());
    expect(screen.getByTestId('has-treino').textContent).toBe('yes');
  });

  it('passes null treino when no workout for today', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
      error: null,
    } as never);
    mockPrismaAluno.mockResolvedValue(makeAluno() as never);
    mockPrismaTreino.mockResolvedValue(null);
    render(await AlunoDashboardPage());
    expect(screen.getByTestId('has-treino').textContent).toBe('no');
  });
});
