import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import TreinosPage from './page';

const mockRequireAnyRole = vi.fn().mockResolvedValue(undefined);
const mockFindMany = vi.fn();

vi.mock('@/lib/auth', () => ({
  requireAnyRole: (...args: unknown[]) => mockRequireAnyRole(...args),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

vi.mock('@/components/page-header', () => ({
  PageHeader: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  ),
}));

vi.mock('./treinos-client', () => ({
  default: ({ initialAlunos }: { initialAlunos: unknown[] }) => (
    <div data-testid="treinos-client">
      <span>{initialAlunos.length} alunos</span>
    </div>
  ),
}));

describe('TreinosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header', async () => {
    mockFindMany.mockResolvedValue([]);
    await act(async () => {
      render(await TreinosPage());
    });
    expect(screen.getByText('Gestão de Treinos')).toBeTruthy();
  });

  it('renders the TreinosManagementClient', async () => {
    mockFindMany.mockResolvedValue([]);
    await act(async () => {
      render(await TreinosPage());
    });
    expect(screen.getByTestId('treinos-client')).toBeTruthy();
  });

  it('passes empty alunos data by default', async () => {
    mockFindMany.mockResolvedValue([]);
    await act(async () => {
      render(await TreinosPage());
    });
    expect(screen.getByText('0 alunos')).toBeTruthy();
  });

  it('handles aluno data with null fields without crashing', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: '1',
        nomeCompleto: 'João',
        cpf: '123',
        email: 'joao@test.com',
        telefone: null,
        dataNascimento: null,
        dataCadastro: new Date('2024-01-01'),
        statusMatricula: 'ATIVA',
        fotoUrl: null,
        nivel: 1,
        exp: 0,
        streakDiasSeguidos: 0,
        treinosNoMes: 0,
        ultimoTreinoData: null,
      },
    ]);
    await act(async () => {
      render(await TreinosPage());
    });
    expect(screen.getByText('1 alunos')).toBeTruthy();
  });
});
