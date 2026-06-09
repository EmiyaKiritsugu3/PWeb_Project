import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlunoLoginPage from './page';
import type { ReactNode } from 'react';

const mockSignInWithPassword = vi.fn().mockResolvedValue({ data: {}, error: null });
const mockSignUp = vi.fn().mockResolvedValue({ data: {}, error: null });

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
    push: vi.fn(),
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
  useAppNotification: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
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

vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: ReactNode }) => <form>{children}</form>,
  FormControl: ({ children }: { children: ReactNode }) => <>{children}</>,
  FormField: ({ render }: { render: (props: { field: Record<string, unknown> }) => ReactNode }) => {
    const field = { value: '', onChange: vi.fn(), onBlur: vi.fn(), name: 'field' };
    return <>{render({ field })}</>;
  },
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  FormMessage: () => null,
}));

describe('AlunoLoginPage', () => {
  it('renders the login card title', () => {
    render(<AlunoLoginPage />);
    expect(screen.getByText('Portal do Aluno (Supabase)')).toBeTruthy();
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
});
