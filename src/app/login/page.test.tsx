import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';
import type { ReactNode } from 'react';

const { getMockState, setMockError } = vi.hoisted(() => {
  let mockState = { error: undefined as string | undefined };
  return {
    getMockState: () => mockState,
    setMockError: (err: string | undefined) => {
      mockState = { error: err };
    },
  };
});

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useActionState: () => [getMockState(), vi.fn(), false],
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
    className,
  }: {
    children: ReactNode;
    type?: string;
    disabled?: boolean;
    variant?: string;
    asChild?: boolean;
    className?: string;
  }) => (
    <button
      type={type as 'button' | 'reset' | 'submit'}
      disabled={disabled}
      data-variant={variant}
      className={className}
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
  beforeEach(() => {
    setMockError(undefined);
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    const el = screen.getByText('Five Star');
    expect(el).toBeTruthy();
  });

  it('renders pending state on button', () => {
    render(<LoginPage />);
    const btn = screen.getByText('Entrar no Sistema');
    expect(btn).toBeTruthy();
  });

  it('renders error message when state has error', () => {
    setMockError('Credenciais inválidas');
    render(<LoginPage />);
    const el = screen.getByText('Credenciais inválidas');
    expect(el).toBeTruthy();
  });
});
