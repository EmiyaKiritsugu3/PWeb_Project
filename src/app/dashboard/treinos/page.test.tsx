import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreinosPage from './page';

vi.mock('@/lib/auth', () => ({
  requireAnyRole: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findMany: vi.fn().mockResolvedValue([]),
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
    render(await TreinosPage());
    expect(screen.getByText('Gestão de Treinos')).toBeTruthy();
  });

  it('renders the TreinosManagementClient', async () => {
    render(await TreinosPage());
    expect(screen.getByTestId('treinos-client')).toBeTruthy();
  });

  it('passes empty alunos data by default', async () => {
    render(await TreinosPage());
    expect(screen.getByText('0 alunos')).toBeTruthy();
  });
});
