import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FinanceiroPage from './page';
import type { ReactNode } from 'react';

vi.mock('@/lib/auth', () => ({
  requireRole: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/definitions', () => ({
  Role: { GERENTE: 'GERENTE' },
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

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/premium-skeleton', () => ({
  PremiumSkeleton: ({ className }: { className?: string }) => (
    <div className={className} data-testid="premium-skeleton" />
  ),
}));

vi.mock('./financeiro-client', () => ({
  FinanceiroClient: ({ initialInadimplentes }: { initialInadimplentes: unknown[] }) => (
    <div data-testid="financeiro-client">
      <span>{initialInadimplentes.length} inadimplentes</span>
    </div>
  ),
}));

describe('FinanceiroPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header', async () => {
    render(await FinanceiroPage());
    expect(screen.getByTestId('page-header')).toBeTruthy();
    expect(screen.getByText('Gestão Financeira')).toBeTruthy();
  });

  it('renders the card title', async () => {
    render(await FinanceiroPage());
    expect(screen.getByText('Alunos Inadimplentes')).toBeTruthy();
  });

  it('renders the card description', async () => {
    render(await FinanceiroPage());
    expect(screen.getByText(/Lista de alunos com pagamentos pendentes/)).toBeTruthy();
  });

  it('renders premium skeleton as Suspense fallback', async () => {
    render(await FinanceiroPage());
    expect(screen.getByTestId('premium-skeleton')).toBeTruthy();
  });

  it('uses tokens, not bg-black, and clears bottom nav', async () => {
    const { container } = render(await FinanceiroPage());
    const html = container.innerHTML;
    expect(html).not.toContain('bg-black');
    expect(html).toContain('pb-20');
  });
});
