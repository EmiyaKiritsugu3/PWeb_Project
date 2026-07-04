import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardNav, DashboardNavBottom } from './dashboard-nav';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type MockChildren = { children?: ReactNode };

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: MockChildren & { href: string }) => (
    <a data-testid="nav-link" href={href}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children, className }: MockChildren & { className?: string }) => (
    <nav className={className} data-testid="sidebar-menu">
      {children}
    </nav>
  ),
  SidebarMenuItem: ({ children }: MockChildren) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    isActive,
    tooltip,
  }: MockChildren & { isActive?: boolean; tooltip?: string }) => (
    <button data-testid="sidebar-menu-button" data-is-active={isActive} data-tooltip={tooltip}>
      {children}
    </button>
  ),
}));

vi.mock('@/app/actions/auth', () => ({
  logout: vi.fn(),
}));

vi.mock('@/lib/constants', () => ({
  FINANCIAL_ROUTES: ['/dashboard/financeiro', '/dashboard/planos'],
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
    Settings: () => <MockIcon data-testid="icon-settings" />,
    LogOut: () => <MockIcon data-testid="icon-logout" />,
    FlaskConical: () => <MockIcon data-testid="icon-flask" />,
  };
});

describe('DashboardNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue('/dashboard');
  });

  it('renders without throwing', () => {
    const { container } = render(<DashboardNav role="INSTRUTOR" />);
    expect(container).toBeTruthy();
  });

  it('renders Dashboard link', () => {
    render(<DashboardNav role="INSTRUTOR" />);
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('renders Alunos link', () => {
    render(<DashboardNav role="INSTRUTOR" />);
    expect(screen.getByText('Alunos')).toBeTruthy();
  });

  it('renders Treinos link', () => {
    render(<DashboardNav role="INSTRUTOR" />);
    expect(screen.getByText('Treinos')).toBeTruthy();
  });

  it('renders Planos link for GERENTE role', () => {
    render(<DashboardNav role="GERENTE" />);
    expect(screen.getByText('Planos')).toBeTruthy();
  });

  it('does not render Financeiro for INSTRUTOR role', () => {
    render(<DashboardNav role="INSTRUTOR" />);
    expect(screen.queryByText('Financeiro')).toBeNull();
  });

  it('does not render Planos for INSTRUTOR role', () => {
    render(<DashboardNav role="INSTRUTOR" />);
    expect(screen.queryByText('Planos')).toBeNull();
  });

  it('renders Financeiro for GERENTE role', () => {
    render(<DashboardNav role="GERENTE" />);
    expect(screen.getByText('Financeiro')).toBeTruthy();
  });

  it('marks active link based on pathname', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/alunos');

    render(<DashboardNav role="GERENTE" />);
    const menuButtons = screen.getAllByTestId('sidebar-menu-button');
    const activeButton = menuButtons.find((btn) => btn.getAttribute('data-is-active') === 'true');
    expect(activeButton).toBeTruthy();
  });

  it('marks Dashboard as active only on exact path', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard');

    render(<DashboardNav role="INSTRUTOR" />);
    const menuButtons = screen.getAllByTestId('sidebar-menu-button');
    const activeButtons = menuButtons.filter(
      (btn) => btn.getAttribute('data-is-active') === 'true'
    );
    expect(activeButtons).toHaveLength(1);
  });

  it('links have correct href attributes', () => {
    render(<DashboardNav role="INSTRUTOR" />);
    const links = screen.getAllByTestId('nav-link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/dashboard/alunos');
    expect(hrefs).toContain('/dashboard/treinos');
  });
});

describe('DashboardNavBottom', () => {
  it('renders without throwing', () => {
    const { container } = render(<DashboardNavBottom />);
    expect(container).toBeTruthy();
  });

  it('renders Configurações', () => {
    render(<DashboardNavBottom />);
    expect(screen.getByText('Configurações')).toBeTruthy();
  });

  it('renders Sair', () => {
    render(<DashboardNavBottom />);
    expect(screen.getByText('Sair')).toBeTruthy();
  });
});
