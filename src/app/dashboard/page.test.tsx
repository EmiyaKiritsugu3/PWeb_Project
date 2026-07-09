import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';
import type { ReactNode } from 'react';
import type { DashboardStats } from '@/lib/definitions';

vi.mock('@/lib/data', () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    totalAlunos: 150,
    matriculasAtivas: 120,
    alunosInadimplentes: 15,
    faturamentoMensal: 45000,
    crescimentoAnual: [
      { mes: 'Jan', alunos: 10 },
      { mes: 'Fev', alunos: 15 },
    ],
  } satisfies DashboardStats),
}));

vi.mock('@/components/dashboard/dashboard-charts', () => ({
  DashboardCharts: ({ data }: { data: unknown[] }) => (
    <div data-testid="dashboard-charts">{data.length} items</div>
  ),
}));

vi.mock('@/components/page-header', () => ({
  PageHeader: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: ReactNode; className?: string }) => (
    <h3 className={className}>{children}</h3>
  ),
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Users: () => <span>UsersIcon</span>,
  UserCheck: () => <span>UserCheckIcon</span>,
  UserX: () => <span>UserXIcon</span>,
  DollarSign: () => <span>DollarSignIcon</span>,
}));

describe('DashboardPage', () => {
  it('renders the page header', async () => {
    render(await DashboardPage());
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Bem-vindo ao centro de comando da Five Star Gym.')).toBeTruthy();
  });

  it('renders KPI cards', async () => {
    render(await DashboardPage());
    expect(screen.getByText('Total de Alunos')).toBeTruthy();
    expect(screen.getByText('Matrículas Ativas')).toBeTruthy();
    expect(screen.getByText('Inadimplentes')).toBeTruthy();
    expect(screen.getByText('Faturamento Mensal')).toBeTruthy();
  });

  it('renders formatted stat values', async () => {
    render(await DashboardPage());
    expect(screen.getByText('150')).toBeTruthy();
    expect(screen.getByText('120')).toBeTruthy();
    expect(screen.getByText('15')).toBeTruthy();
  });

  it('renders formatted currency value', async () => {
    render(await DashboardPage());
    expect(screen.getByText((content) => content.includes('45'))).toBeTruthy();
  });

  it('renders the charts component', async () => {
    render(await DashboardPage());
    expect(screen.getByTestId('dashboard-charts')).toBeTruthy();
  });
});
