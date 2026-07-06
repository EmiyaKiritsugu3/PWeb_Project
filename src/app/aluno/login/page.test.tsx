import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlunoLoginPage from './page';
import type { ReactNode } from 'react';
import React from 'react';

const mockPush = vi.fn();
const mockSignInWithPassword = vi.fn().mockResolvedValue({ data: {}, error: null });
const mockSignUp = vi.fn().mockResolvedValue({ data: {}, error: null });

const mockNotify = { success: vi.fn(), error: vi.fn(), warn: vi.fn() };

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => mockNotify,
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

// Real @/components/ui/form (shadcn = thin FormProvider + RHF Controller wrapper)
// is used unmocked so typed input reaches RHF's store and handleFormSubmit receives
// the actual credentials. Real zod schema in page.tsx validates the typed creds.

describe('AlunoLoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    mockSignUp.mockResolvedValue({ data: {}, error: null });
  });

  it('renders the login card title', () => {
    render(<AlunoLoginPage />);
    expect(screen.getByText('Five Star')).toBeTruthy();
    expect(screen.getByText('PORTAL DO ALUNO')).toBeTruthy();
  });

  it('renders email and password labels', () => {
    render(<AlunoLoginPage />);
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Senha')).toBeTruthy();
  });

  it('renders submit button', () => {
    render(<AlunoLoginPage />);
    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  it('renders link to management login', () => {
    render(<AlunoLoginPage />);
    expect(screen.getByText('Acesso para Gestão')).toBeTruthy();
  });

  it('renders the dumbbell icon', () => {
    const { container } = render(<AlunoLoginPage />);
    expect(container.querySelector('.lucide-dumbbell')).toBeTruthy();
  });

  // PRD-7: default creds removed from aluno/login — tests must type valid creds
  // before submit (zodResolver blocks empty fields, signIn never called).
  const typeValidCreds = () => {
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'ana.silva@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123456' },
    });
  };

  it('calls signInWithPassword on form submit and redirects on success', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });

    render(<AlunoLoginPage />);
    typeValidCreds();
    const form = screen.getByRole('button', { name: /entrar/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'ana.silva@example.com',
        password: '123456',
      });
      expect(mockPush).toHaveBeenCalledWith('/aluno/dashboard');
    });
  });

  it('auto-signs up when signIn returns "Invalid login credentials"', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });
    mockSignUp.mockResolvedValue({ data: {}, error: null });

    render(<AlunoLoginPage />);
    typeValidCreds();
    const form = screen.getByRole('button', { name: /entrar/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: { role: 'ALUNO' },
          }),
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/aluno/dashboard');
    });
  });

  it('throws error when signUp also fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });
    mockSignUp.mockResolvedValue({ data: {}, error: { message: 'Signup failed' } });

    render(<AlunoLoginPage />);
    typeValidCreds();
    const form = screen.getByRole('button', { name: /entrar/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
      expect(mockNotify.error).toHaveBeenCalledWith(
        'Erro de autenticação',
        expect.any(String),
        expect.any(Object)
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('handles signIn generic error (not "Invalid login credentials")', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Network error' },
    });

    render(<AlunoLoginPage />);
    typeValidCreds();
    const form = screen.getByRole('button', { name: /entrar/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });
});
