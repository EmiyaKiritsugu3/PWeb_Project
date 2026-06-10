import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MeusTreinosPage from './page';
const mockCreateClient = vi.fn();

vi.mock('@/utils/supabase/server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('./meus-treinos-client', () => ({
  default: ({ initialTreinos, userId }: { initialTreinos: unknown[]; userId: string }) => (
    <div data-testid="meus-treinos-client">
      <span data-testid="treinos-count">{initialTreinos.length}</span>
      <span data-testid="user-id">{userId}</span>
    </div>
  ),
}));

import { prisma } from '@/lib/prisma';

const mockPrisma = vi.mocked(prisma);

describe('MeusTreinosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows unauthorized when no user', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    render(await MeusTreinosPage());
    expect(screen.getByText('Não autorizado')).toBeTruthy();
  });

  it('shows not found when aluno is null', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'test@test.com' } },
        }),
      },
    });
    vi.mocked(mockPrisma.aluno.findUnique).mockResolvedValue(null);

    render(await MeusTreinosPage());
    expect(screen.getByText('Aluno não encontrado')).toBeTruthy();
  });

  it('renders MeusTreinosClient with mapped treinos', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'joao@test.com' } },
        }),
      },
    });
    vi.mocked(mockPrisma.aluno.findUnique).mockResolvedValue({
      id: 'aluno-1',
      Treinos: [
        {
          id: 't1',
          alunoId: 'aluno-1',
          instrutorId: null,
          objetivo: 'Hipertrofia',
          dataCriacao: new Date('2024-06-01'),
          diaSemana: 1,
          Exercicios: [
            {
              id: 'e1',
              nomeExercicio: 'Supino',
              series: 4,
              repeticoes: '10-12',
              observacoes: null,
              descricao: null,
            },
          ],
        },
      ],
    } as never);

    render(await MeusTreinosPage());

    expect(screen.getByTestId('meus-treinos-client')).toBeTruthy();
    expect(screen.getByTestId('treinos-count')).toHaveTextContent('1');
    expect(screen.getByTestId('user-id')).toHaveTextContent('aluno-1');
  });

  it('maps treinos with empty observacoes and descricao', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'joao@test.com' } },
        }),
      },
    });
    vi.mocked(mockPrisma.aluno.findUnique).mockResolvedValue({
      id: 'aluno-1',
      Treinos: [
        {
          id: 't1',
          alunoId: 'aluno-1',
          instrutorId: 'instr-1',
          objetivo: 'Resistência',
          dataCriacao: new Date('2024-06-01'),
          diaSemana: null,
          Exercicios: [],
        },
      ],
    } as never);

    render(await MeusTreinosPage());
    expect(screen.getByTestId('treinos-count')).toHaveTextContent('1');
  });
});
