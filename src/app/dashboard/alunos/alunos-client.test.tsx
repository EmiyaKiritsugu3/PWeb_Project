import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AlunosClient } from './alunos-client';
import type { Aluno, Plano } from '@/lib/definitions';
import type { ReactNode } from 'react';

const mockRouter = { refresh: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const mockNotify = { success: vi.fn(), error: vi.fn(), warn: vi.fn() };
vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => mockNotify,
}));

vi.mock('@/lib/actions/alunos', () => ({
  createAlunoAction: vi.fn(),
  updateAlunoAction: vi.fn(),
  deleteAlunoAction: vi.fn(),
  createMatriculaAction: vi.fn(),
}));

vi.mock('@/components/dashboard/alunos/data-table', () => ({
  DataTable: ({ data }: { data: Aluno[]; columns: unknown[] }) => (
    <div data-testid="data-table">
      {data.map((a) => (
        <div key={a.id} data-testid={`aluno-row-${a.id}`}>
          {a.nomeCompleto}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/dashboard/alunos/form-aluno', () => ({
  FormAluno: ({
    isOpen,
    onOpenChange,
    onSubmit,
    aluno,
  }: {
    isOpen: boolean;
    onOpenChange: (v: boolean) => void;
    onSubmit: (d: unknown) => void;
    aluno?: Aluno;
  }) =>
    isOpen ? (
      <div data-testid="form-aluno">
        <span>{aluno ? 'Editando' : 'Cadastrando'}</span>
        <button
          data-testid="submit-aluno-form"
          onClick={() =>
            onSubmit({
              nomeCompleto: 'Novo Aluno',
              cpf: '123',
              email: 'n@test.com',
              telefone: '11999999999',
              dataNascimento: '1990-01-01',
              statusMatricula: 'ATIVA',
            })
          }
        >
          Salvar
        </button>
        <button data-testid="close-form-aluno" onClick={() => onOpenChange(false)}>
          Fechar
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/dashboard/alunos/form-matricula', () => ({
  FormMatricula: ({
    isOpen,
    onSubmit,
    aluno,
  }: {
    isOpen: boolean;
    onOpenChange: (v: boolean) => void;
    onSubmit: (a: Aluno, p: Plano) => void;
    aluno: Aluno | null;
  }) =>
    isOpen && aluno ? (
      <div data-testid="form-matricula">
        <span>Matrícula para {aluno.nomeCompleto}</span>
        <button
          data-testid="submit-matricula"
          onClick={() =>
            onSubmit(aluno, { id: 'plano-1', nome: 'Mensal', preco: 100, duracaoDias: 30 })
          }
        >
          Confirmar Matrícula
        </button>
      </div>
    ) : null,
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

const mockAlunos: Aluno[] = [
  {
    id: 'aluno-1',
    nomeCompleto: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@test.com',
    telefone: '(11) 99999-9999',
    dataNascimento: '1990-01-01',
    dataCadastro: '2023-01-01',
    fotoUrl: '',
    statusMatricula: 'ATIVA',
    nivel: 1,
    exp: 0,
    streakDiasSeguidos: 0,
    treinosNoMes: 0,
    ultimoTreinoData: null,
  },
];

const mockPlanos: Plano[] = [{ id: 'plano-1', nome: 'Mensal', preco: 100, duracaoDias: 30 }];

describe('AlunosClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AlunosClient initialAlunos={mockAlunos} planos={mockPlanos} />);
    expect(container).toBeTruthy();
  });

  it('renders the page title and description', () => {
    render(<AlunosClient initialAlunos={mockAlunos} planos={mockPlanos} />);
    expect(screen.getByText('Gestão de Alunos')).toBeTruthy();
    expect(screen.getByText(/Cadastre, visualize e gerencie/)).toBeTruthy();
  });

  it('renders the "Cadastrar Aluno" button', () => {
    render(<AlunosClient initialAlunos={mockAlunos} planos={mockPlanos} />);
    expect(screen.getByText('Cadastrar Aluno')).toBeTruthy();
  });

  it('renders the DataTable with alumnos', () => {
    render(<AlunosClient initialAlunos={mockAlunos} planos={mockPlanos} />);
    expect(screen.getByTestId('data-table')).toBeTruthy();
    expect(screen.getByTestId('aluno-row-aluno-1')).toBeTruthy();
  });

  it('opens FormAluno when "Cadastrar Aluno" is clicked', () => {
    render(<AlunosClient initialAlunos={mockAlunos} planos={mockPlanos} />);
    fireEvent.click(screen.getByText('Cadastrar Aluno'));
    expect(screen.getByTestId('form-aluno')).toBeTruthy();
    expect(screen.getByText('Cadastrando')).toBeTruthy();
  });

  it('calls createAlunoAction on form submit', async () => {
    const { createAlunoAction } = await import('@/lib/actions/alunos');
    vi.mocked(createAlunoAction).mockResolvedValue({ success: true, data: mockAlunos[0] });

    render(<AlunosClient initialAlunos={mockAlunos} planos={mockPlanos} />);
    fireEvent.click(screen.getByText('Cadastrar Aluno'));
    fireEvent.click(screen.getByTestId('submit-aluno-form'));

    await waitFor(() => {
      expect(createAlunoAction).toHaveBeenCalled();
      expect(mockNotify.success).toHaveBeenCalled();
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('shows error notification on createAlunoAction failure', async () => {
    const { createAlunoAction } = await import('@/lib/actions/alunos');
    vi.mocked(createAlunoAction).mockResolvedValue({ success: false, error: 'Erro ao criar' });

    render(<AlunosClient initialAlunos={mockAlunos} planos={mockPlanos} />);
    fireEvent.click(screen.getByText('Cadastrar Aluno'));
    fireEvent.click(screen.getByTestId('submit-aluno-form'));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith('Erro ao salvar', 'Erro ao criar');
    });
  });

  it('calls deleteAlunoAction on confirm', async () => {
    const { deleteAlunoAction } = await import('@/lib/actions/alunos');
    vi.mocked(deleteAlunoAction).mockResolvedValue({ success: true });

    render(<AlunosClient initialAlunos={mockAlunos} planos={mockPlanos} />);

    expect(screen.queryByTestId('alert-dialog')).toBeNull();
  });
});
