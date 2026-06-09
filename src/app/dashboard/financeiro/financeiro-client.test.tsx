import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FinanceiroClient from './financeiro-client';
import type { ReactNode } from 'react';

const mockRouter = { refresh: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const mockNotify = { success: vi.fn(), error: vi.fn(), warn: vi.fn() };
vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => mockNotify,
}));

vi.mock('@/lib/actions/financeiro', () => ({
  registrarPagamentoAction: vi.fn(),
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
  TableHead: ({ children }: { children: ReactNode }) => <th>{children}</th>,
  TableCell: ({ children, className }: { children: ReactNode; className?: string }) => (
    <td className={className}>{children}</td>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: ReactNode; variant?: string }) => (
    <span data-variant={variant}>{children}</span>
  ),
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: ReactNode }) => <footer>{children}</footer>,
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, disabled }: { children: ReactNode; disabled?: boolean }) => (
    <button disabled={disabled}>{children}</button>
  ),
}));

interface AlunoFinanceiro {
  id: string;
  nomeCompleto: string;
  email: string;
  statusMatricula: string;
}

const mockInadimplentes: AlunoFinanceiro[] = [
  {
    id: 'aluno-1',
    nomeCompleto: 'João Silva',
    email: 'joao@test.com',
    statusMatricula: 'INADIMPLENTE',
  },
  {
    id: 'aluno-2',
    nomeCompleto: 'Maria Santos',
    email: 'maria@test.com',
    statusMatricula: 'INADIMPLENTE',
  },
];

describe('FinanceiroClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    expect(container).toBeTruthy();
  });

  it('renders table headers', () => {
    render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    expect(screen.getByText('Aluno')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('Ações')).toBeTruthy();
  });

  it('renders all inadimplente students', () => {
    render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    expect(screen.getByText('João Silva')).toBeTruthy();
    expect(screen.getByText('joao@test.com')).toBeTruthy();
    expect(screen.getByText('Maria Santos')).toBeTruthy();
    expect(screen.getByText('maria@test.com')).toBeTruthy();
  });

  it('renders "Inadimplente" badge for each student', () => {
    render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    const badges = screen.getAllByText('Inadimplente');
    expect(badges.length).toBe(2);
  });

  it('renders "Registrar Pagamento" buttons', () => {
    render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    const buttons = screen.getAllByText('Registrar Pagamento');
    expect(buttons.length).toBe(2);
  });

  it('shows empty state when no inadimplentes', () => {
    render(<FinanceiroClient initialInadimplentes={[]} />);
    expect(screen.getByText('Não há alunos inadimplentes no momento.')).toBeTruthy();
  });

  it('opens confirmation dialog when "Registrar Pagamento" is clicked', () => {
    render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    fireEvent.click(screen.getAllByText('Registrar Pagamento')[0]);
    expect(screen.getByTestId('alert-dialog')).toBeTruthy();
    expect(screen.getByText('Confirmar Pagamento')).toBeTruthy();
    expect(screen.getAllByText(/João Silva/).length).toBeGreaterThanOrEqual(1);
  });

  it('calls registrarPagamentoAction on confirm', async () => {
    const { registrarPagamentoAction } = await import('@/lib/actions/financeiro');
    vi.mocked(registrarPagamentoAction).mockResolvedValue({ success: true });

    render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    fireEvent.click(screen.getAllByText('Registrar Pagamento')[0]);

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(registrarPagamentoAction).toHaveBeenCalledWith('aluno-1');
      expect(mockNotify.success).toHaveBeenCalledWith(
        'Pagamento Registrado!',
        expect.stringContaining('João Silva')
      );
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('shows error notification on payment registration failure', async () => {
    const { registrarPagamentoAction } = await import('@/lib/actions/financeiro');
    vi.mocked(registrarPagamentoAction).mockResolvedValue({
      success: false,
      error: 'Erro de pagamento',
    });

    render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    fireEvent.click(screen.getAllByText('Registrar Pagamento')[0]);
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith(
        'Erro ao registrar pagamento',
        'Erro de pagamento'
      );
    });
  });

  it('shows "Processando..." while payment is being processed', async () => {
    const { registrarPagamentoAction } = await import('@/lib/actions/financeiro');
    let resolvePromise!: (v: { success: boolean; error?: string }) => void;
    vi.mocked(registrarPagamentoAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<FinanceiroClient initialInadimplentes={mockInadimplentes} />);
    fireEvent.click(screen.getAllByText('Registrar Pagamento')[0]);
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(screen.getByText('Processando...')).toBeTruthy();
    });

    resolvePromise!({ success: true });

    await waitFor(() => {
      expect(screen.queryByText('Processando...')).toBeNull();
    });
  });
});
