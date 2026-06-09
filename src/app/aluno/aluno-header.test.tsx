import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlunoHeader, UserMenu, LanguageSelector } from './aluno-header';
import type { ReactNode } from 'react';
import type { NavLink } from './aluno-header';

vi.mock('@/components/providers/i18n-provider', () => ({
  useI18n: () => ({
    language: 'pt',
    setLanguage: vi.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        'common.welcome': 'Olá',
        'common.profile': 'Meu Perfil',
        'common.logout': 'Sair',
        'common.selectLanguage': 'Selecionar idioma',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  AvatarImage: () => null,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    variant,
    ...props
  }: {
    children: ReactNode;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
}));

const mockNavLinks: NavLink[] = [
  { href: '/aluno/dashboard', label: 'Dashboard', icon: <span>D</span> },
  { href: '/aluno/meus-treinos', label: 'Treinos', icon: <span>T</span> },
];

describe('AlunoHeader', () => {
  it('renders the brand name', () => {
    render(
      <AlunoHeader
        pathname="/aluno/dashboard"
        navLinks={mockNavLinks}
        displayName="João"
        photoURL=""
        email="joao@test.com"
        onLogout={vi.fn()}
      />
    );
    expect(screen.getByText('Five Star Academy')).toBeTruthy();
  });

  it('renders nav links', () => {
    render(
      <AlunoHeader
        pathname="/aluno/dashboard"
        navLinks={mockNavLinks}
        displayName="João"
        photoURL=""
        email="joao@test.com"
        onLogout={vi.fn()}
      />
    );
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Treinos').length).toBeGreaterThanOrEqual(1);
  });

  it('renders welcome message with display name', () => {
    render(
      <AlunoHeader
        pathname="/aluno/dashboard"
        navLinks={mockNavLinks}
        displayName="João"
        photoURL=""
        email="joao@test.com"
        onLogout={vi.fn()}
      />
    );
    expect(screen.getAllByText('João').length).toBeGreaterThanOrEqual(1);
  });

  it('renders language selector', () => {
    render(
      <AlunoHeader
        pathname="/aluno/dashboard"
        navLinks={mockNavLinks}
        displayName="João"
        photoURL=""
        email="joao@test.com"
        onLogout={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Selecionar idioma')).toBeTruthy();
  });
});

describe('UserMenu (aluno-header)', () => {
  it('renders user name and email', () => {
    render(
      <UserMenu
        displayName="Ana"
        photoURL=""
        email="ana@test.com"
        navLinks={[]}
        onLogout={vi.fn()}
      />
    );
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('ana@test.com')).toBeTruthy();
  });

  it('renders profile and logout options', () => {
    render(
      <UserMenu
        displayName="Ana"
        photoURL=""
        email="ana@test.com"
        navLinks={[]}
        onLogout={vi.fn()}
      />
    );
    expect(screen.getByText('Meu Perfil')).toBeTruthy();
    expect(screen.getByText('Sair')).toBeTruthy();
  });
});

describe('LanguageSelector', () => {
  it('renders language button', () => {
    render(<LanguageSelector />);
    expect(screen.getByLabelText('Selecionar idioma')).toBeTruthy();
  });

  it('shows language options', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('Português (BR)')).toBeTruthy();
    expect(screen.getByText('English (US)')).toBeTruthy();
  });
});
