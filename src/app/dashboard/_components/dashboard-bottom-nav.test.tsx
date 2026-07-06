import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import type { ReactNode } from 'react';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children?: ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    const ariaCurrent = (rest['aria-current'] ?? rest.ariaCurrent) as
      'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' | undefined;
    return (
      <a data-testid="nav-link" href={href} aria-current={ariaCurrent}>
        {children}
      </a>
    );
  },
}));

vi.mock('lucide-react', () => {
  const MockIcon = ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
    <span data-testid={testId || 'icon'} />
  );
  return {
    LayoutDashboard: () => <MockIcon data-testid="icon-dashboard" />,
    Users: () => <MockIcon data-testid="icon-users" />,
    Dumbbell: () => <MockIcon data-testid="icon-dumbbell" />,
    DollarSign: () => <MockIcon data-testid="icon-dollar" />,
    FileText: () => <MockIcon data-testid="icon-file" />,
    FolderKanban: () => <MockIcon data-testid="icon-folder" />,
    FlaskConical: () => <MockIcon data-testid="icon-flask" />,
  };
});

describe('DashboardBottomNav', () => {
  it('renders all primary destinations for GERENTE (excludes dev)', () => {
    render(<DashboardBottomNav role="GERENTE" />);
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Alunos')).toBeTruthy();
    expect(screen.getByText('Treinos')).toBeTruthy();
    expect(screen.getByText('Financeiro')).toBeTruthy();
    expect(screen.getByText('Planos')).toBeTruthy();
  });

  it('excludes Financeiro + Planos for INSTRUTOR (FINANCIAL_ROUTES filter)', () => {
    render(<DashboardBottomNav role="INSTRUTOR" />);
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Alunos')).toBeTruthy();
    expect(screen.getByText('Treinos')).toBeTruthy();
    expect(screen.queryByText('Financeiro')).toBeNull();
    expect(screen.queryByText('Planos')).toBeNull();
  });

  it('excludes dev route (DEV_HREF) — dev stays sidebar-only', () => {
    render(<DashboardBottomNav role="GERENTE" />);
    expect(screen.queryByText('Dev')).toBeNull();
    const links = screen.getAllByTestId('nav-link');
    expect(links.find((l) => l.getAttribute('href') === '/dashboard/dev')).toBeUndefined();
  });

  it('limits to bottom-nav-limit ≤5 items', () => {
    render(<DashboardBottomNav role="GERENTE" />);
    const links = screen.getAllByTestId('nav-link');
    expect(links.length).toBeLessThanOrEqual(5);
  });
});
