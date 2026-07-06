import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav, type NavItem } from './bottom-nav';
import type { ReactNode } from 'react';

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
  };
});

const ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', iconName: 'layout-dashboard' },
  { href: '/dashboard/alunos', label: 'Alunos', iconName: 'users' },
];

describe('BottomNav', () => {
  it('renders all items with correct labels and hrefs', () => {
    render(<BottomNav items={ITEMS} activeHref="/dashboard" />);
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Alunos')).toBeTruthy();
    const links = screen.getAllByTestId('nav-link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/dashboard/alunos');
  });

  it('marks the active item with aria-current=page', () => {
    render(<BottomNav items={ITEMS} activeHref="/dashboard/alunos" />);
    const links = screen.getAllByTestId('nav-link');
    const active = links.find((l) => l.getAttribute('aria-current') === 'page');
    expect(active).toBeTruthy();
    expect(active?.getAttribute('href')).toBe('/dashboard/alunos');
  });

  it('does not mark inactive items as current page', () => {
    render(<BottomNav items={ITEMS} activeHref="/dashboard/alunos" />);
    const links = screen.getAllByTestId('nav-link');
    const currents = links.filter((l) => l.getAttribute('aria-current') === 'page');
    expect(currents).toHaveLength(1);
  });

  it('root dashboard active only on exact match', () => {
    const { rerender } = render(<BottomNav items={ITEMS} activeHref="/dashboard/alunos/123" />);
    let links = screen.getAllByTestId('nav-link');
    let dashboardLink = links.find((l) => l.getAttribute('href') === '/dashboard');
    expect(dashboardLink?.getAttribute('aria-current')).toBeNull();
    const alunosLink = links.find((l) => l.getAttribute('href') === '/dashboard/alunos');
    expect(alunosLink?.getAttribute('aria-current')).toBe('page');

    rerender(<BottomNav items={ITEMS} activeHref="/dashboard" />);
    links = screen.getAllByTestId('nav-link');
    dashboardLink = links.find((l) => l.getAttribute('href') === '/dashboard');
    expect(dashboardLink?.getAttribute('aria-current')).toBe('page');
  });

  it('renders container with md:hidden class', () => {
    const { container } = render(<BottomNav items={ITEMS} activeHref="/dashboard" />);
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.className).toContain('md:hidden');
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(<BottomNav items={[]} activeHref="/" />);
    const links = container.querySelectorAll('[data-testid="nav-link"]');
    expect(links).toHaveLength(0);
  });
});
