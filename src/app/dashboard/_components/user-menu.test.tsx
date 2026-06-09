import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserMenu } from './user-menu';
import type { ReactNode } from 'react';

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  AvatarImage: () => null,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
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

vi.mock('@/app/actions/auth', () => ({
  logout: vi.fn(),
}));

describe('UserMenu', () => {
  it('renders user display name', () => {
    render(<UserMenu displayName="João" email="joao@test.com" photoURL="" />);
    expect(screen.getByText('João')).toBeTruthy();
  });

  it('renders user email', () => {
    render(<UserMenu displayName="João" email="joao@test.com" photoURL="" />);
    expect(screen.getByText('joao@test.com')).toBeTruthy();
  });

  it('renders menu items', () => {
    render(<UserMenu displayName="João" email="joao@test.com" photoURL="" />);
    expect(screen.getByText('Perfil')).toBeTruthy();
    expect(screen.getByText('Configurações')).toBeTruthy();
    expect(screen.getByText('Sair da conta')).toBeTruthy();
  });

  it('renders avatar fallback with first letter of email', () => {
    render(<UserMenu displayName="João" email="joao@test.com" photoURL="" />);
    expect(screen.getByText('J')).toBeTruthy();
  });
});
