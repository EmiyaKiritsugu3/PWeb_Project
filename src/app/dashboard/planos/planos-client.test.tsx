import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanosClient } from './planos-client';
import type { Plano } from '@/lib/definitions';
import type { ReactNode } from 'react';

const mockRouter = { refresh: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const mockNotify = { success: vi.fn(), error: vi.fn(), warn: vi.fn() };
vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => mockNotify,
}));

vi.mock('@/lib/actions/planos', () => ({
  createPlanoAction: vi.fn(),
  updatePlanoAction: vi.fn(),
  deletePlanoAction: vi.fn(),
}));

vi.mock('@/components/dashboard/planos/form-plano', () => ({
  FormPlano: ({
    isOpen,
    onOpenChange,
    onSubmit,
    plano,
  }: {
    isOpen: boolean;
    onOpenChange: (v: boolean) => void;
    onSubmit: (d: { nome: string; preco: number; duracaoDias: number }) => void;
    plano?: Plano;
  }) =>
    isOpen ? (
      <div data-testid="form-plano">
        <span>{plano ? 'Editando' : 'Criando'}</span>
        <button
          data-testid="submit-plano"
          onClick={() => onSubmit({ nome: 'Novo Plano', preco: 150, duracaoDias: 30 })}
        >
          Salvar
        </button>
        <button onClick={() => onOpenChange(false)}>Fechar</button>
      </div>
    ) : null,
}));

vi.mock('@/components/page-header', () => ({
  PageHeader: ({
    title,
    description,
    actions,
  }: {
    title: string;
    description?: string;
    actions?: ReactNode;
  }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {actions}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
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
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardFooter: ({ children }: { children: ReactNode }) => <footer>{children}</footer>,
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
  AlertDialogAction: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}));

vi.mock('lucide-react', () => ({
  PlusCircle: () => <span>+</span>,
  Pencil: () => <span>P</span>,
  Trash2: () => <span>X</span>,
}));

const mockPlanos: Plano[] = [
  { id: 'plano-1', nome: 'Mensal', preco: 100, duracaoDias: 30 },
  { id: 'plano-2', nome: 'Trimestral', preco: 250, duracaoDias: 90 },
  { id: 'plano-3', nome: 'Anual', preco: 960, duracaoDias: 360 },
];

describe('PlanosClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<PlanosClient initialPlanos={mockPlanos} />);
    expect(container).toBeTruthy();
  });

  it('renders the PageHeader with title and description', () => {
    render(<PlanosClient initialPlanos={mockPlanos} />);
    expect(screen.getByText('Planos da Academia')).toBeTruthy();
    expect(screen.getByText(/Gerencie os planos de mensalidade/)).toBeTruthy();
  });

  it('renders all plan cards', () => {
    render(<PlanosClient initialPlanos={mockPlanos} />);
    expect(screen.getAllByTestId('card')).toHaveLength(3);
    expect(screen.getByText('Mensal')).toBeTruthy();
    expect(screen.getByText('Trimestral')).toBeTruthy();
    expect(screen.getByText('Anual')).toBeTruthy();
  });

  it('displays formatted prices in BRL', () => {
    render(<PlanosClient initialPlanos={mockPlanos} />);
    expect(screen.getByText(/R\$\s*100,00/)).toBeTruthy();
    expect(screen.getByText(/R\$\s*250,00/)).toBeTruthy();
    expect(screen.getByText(/R\$\s*960,00/)).toBeTruthy();
  });

  it('displays formatted duration badges', () => {
    render(<PlanosClient initialPlanos={mockPlanos} />);
    expect(screen.getByText('mês')).toBeTruthy();
    expect(screen.getByText('3 meses')).toBeTruthy();
    expect(screen.getByText('12 meses')).toBeTruthy();
  });

  it('opens FormPlano in create mode when "Adicionar Plano" is clicked', () => {
    render(<PlanosClient initialPlanos={mockPlanos} />);
    fireEvent.click(screen.getByText('Adicionar Plano'));
    expect(screen.getByTestId('form-plano')).toBeTruthy();
    expect(screen.getByText('Criando')).toBeTruthy();
  });

  it('calls createPlanoAction on new plano submit', async () => {
    const { createPlanoAction } = await import('@/lib/actions/planos');
    vi.mocked(createPlanoAction).mockResolvedValue({
      success: true,
      data: { id: 'new', nome: 'Novo Plano', preco: 150, duracaoDias: 30 },
    });

    render(<PlanosClient initialPlanos={mockPlanos} />);
    fireEvent.click(screen.getByText('Adicionar Plano'));
    fireEvent.click(screen.getByTestId('submit-plano'));

    await waitFor(() => {
      expect(createPlanoAction).toHaveBeenCalledWith({
        nome: 'Novo Plano',
        preco: 150,
        duracaoDias: 30,
      });
      expect(mockNotify.success).toHaveBeenCalled();
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('shows error on createPlanoAction failure', async () => {
    const { createPlanoAction } = await import('@/lib/actions/planos');
    vi.mocked(createPlanoAction).mockResolvedValue({ success: false, error: 'Erro ao criar' });

    render(<PlanosClient initialPlanos={mockPlanos} />);
    fireEvent.click(screen.getByText('Adicionar Plano'));
    fireEvent.click(screen.getByTestId('submit-plano'));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith('Erro ao salvar', 'Erro ao criar');
    });
  });

  it('renders with empty planos', () => {
    render(<PlanosClient initialPlanos={[]} />);
    expect(screen.getByText('Planos da Academia')).toBeTruthy();
    expect(screen.queryAllByTestId('card')).toHaveLength(0);
  });

  it('opens form in edit mode when "Editar" is clicked', () => {
    render(<PlanosClient initialPlanos={mockPlanos} />);
    const editButtons = screen.getAllByText('P');
    fireEvent.click(editButtons[0]);
    expect(screen.getByTestId('form-plano')).toBeTruthy();
    expect(screen.getByText('Editando')).toBeTruthy();
  });

  it('calls updatePlanoAction on edit submit', async () => {
    const { updatePlanoAction } = await import('@/lib/actions/planos');
    vi.mocked(updatePlanoAction).mockResolvedValue({
      success: true,
      data: { id: 'plano-1', nome: 'Mensal', preco: 100, duracaoDias: 30 },
    });

    render(<PlanosClient initialPlanos={mockPlanos} />);
    fireEvent.click(screen.getAllByText('P')[0]);
    fireEvent.click(screen.getByTestId('submit-plano'));

    await waitFor(() => {
      expect(updatePlanoAction).toHaveBeenCalled();
      expect(mockNotify.success).toHaveBeenCalledWith('Plano atualizado!', expect.any(String));
    });
  });

  it('shows error on delete failure', async () => {
    const { deletePlanoAction } = await import('@/lib/actions/planos');
    vi.mocked(deletePlanoAction).mockResolvedValue({ success: false, error: 'Erro ao excluir' });

    render(<PlanosClient initialPlanos={mockPlanos} />);
    fireEvent.click(screen.getAllByText('Excluir')[0]);
    fireEvent.click(screen.getAllByText('Excluir')[screen.getAllByText('Excluir').length - 1]);

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith('Erro ao excluir', 'Erro ao excluir');
    });
  });

  it('displays "mês" badge when duration is exactly 30 days', () => {
    const customPlanos: Plano[] = [{ id: 'p2', nome: 'Mensal', preco: 100, duracaoDias: 30 }];
    render(<PlanosClient initialPlanos={customPlanos} />);
    expect(screen.getByText('mês')).toBeTruthy();
  });

  it('displays "2 meses" badge for 60-day duration', () => {
    const customPlanos: Plano[] = [{ id: 'p3', nome: 'Bimestral', preco: 180, duracaoDias: 60 }];
    render(<PlanosClient initialPlanos={customPlanos} />);
    expect(screen.getByText('2 meses')).toBeTruthy();
  });

  it('displays "dias" badge when duration is not a multiple of 30', () => {
    const customPlanos: Plano[] = [{ id: 'p1', nome: 'Personal', preco: 200, duracaoDias: 15 }];
    render(<PlanosClient initialPlanos={customPlanos} />);
    expect(screen.getByText('15 dias')).toBeTruthy();
  });

  it('calls deletePlanoAction when delete is confirmed', async () => {
    const { deletePlanoAction } = await import('@/lib/actions/planos');
    vi.mocked(deletePlanoAction).mockResolvedValue({ success: true });

    render(<PlanosClient initialPlanos={mockPlanos} />);

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByTestId('alert-dialog')).toBeTruthy();
    const confirmDeleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(confirmDeleteButtons[confirmDeleteButtons.length - 1]);

    await waitFor(() => {
      expect(deletePlanoAction).toHaveBeenCalledWith('plano-1');
      expect(mockNotify.success).toHaveBeenCalled();
    });
  });
});
