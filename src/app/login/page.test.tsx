import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';
import type { ReactNode } from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: () => [{ error: undefined }, vi.fn(), false],
  };
});

vi.mock('@/app/actions/auth', () => ({
  login: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardFooter: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    type,
    disabled,
    variant,
    ...props
  }: {
    children: ReactNode;
    type?: string;
    disabled?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button
      type={type as 'button' | 'reset' | 'submit'}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: { className?: string }) => <hr className={className} />,
}));

describe('LoginPage', () => {
  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Five Star')).toBeTruthy();
    expect(screen.getByText('SISTEMA DE GESTÃO')).toBeTruthy();
  });

  it('renders email and password inputs', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email corporativo')).toBeTruthy();
    expect(screen.getByLabelText('Senha de acesso')).toBeTruthy();
  });

  it('renders submit button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Entrar no Sistema')).toBeTruthy();
  });

  it('renders link to aluno portal', () => {
    render(<LoginPage />);
    expect(screen.getByText('Acessar Portal do Aluno')).toBeTruthy();
  });

  it('renders copyright notice', () => {
    render(<LoginPage />);
    expect(screen.getByText((content) => content.includes('Five Star Fitness'))).toBeTruthy();
  });
});
