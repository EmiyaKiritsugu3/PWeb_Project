import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { columns } from './columns';
import type { Aluno } from '@/lib/definitions';

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarFallback: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  AvatarImage: () => null,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children?: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock('lucide-react', () => ({
  MoreHorizontal: () => <span>...</span>,
  Eye: () => <span>eye</span>,
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('date-fns', () => ({
  format: (date: Date, fmt: string) => {
    if (fmt === 'dd/MM/yyyy') return '01/01/2024';
    return String(date);
  },
}));

const mockAluno: Aluno = {
  id: 'test-id-123',
  nomeCompleto: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao@test.com',
  telefone: '(11) 99999-9999',
  dataNascimento: '1990-01-01',
  dataCadastro: '2024-01-01',
  fotoUrl: '',
  statusMatricula: 'ATIVA',
  nivel: 1,
  exp: 0,
  streakDiasSeguidos: 0,
  treinosNoMes: 0,
  ultimoTreinoData: null,
};

const mockAlunoEmptyName: Aluno = {
  ...mockAluno,
  nomeCompleto: '',
};

const mockAlunoSingleName: Aluno = {
  ...mockAluno,
  nomeCompleto: 'João',
};

const mockAlunoNullDate: Aluno = {
  ...mockAluno,
  dataCadastro: '',
};

describe('columns', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onNewMatricula = vi.fn();

  const columnDefs = columns({ onEdit, onDelete, onNewMatricula }) as Array<{
    accessorKey?: string;
    header?: string;
    id?: string;
    cell?: unknown;
  }>;

  it('returns an array of column definitions', () => {
    expect(Array.isArray(columnDefs)).toBe(true);
    expect(columnDefs.length).toBe(6);
  });

  it('has photo column with accessorKey fotoUrl', () => {
    expect(columnDefs[0].accessorKey).toBe('fotoUrl');
  });

  it('has name column with accessorKey nomeCompleto', () => {
    expect(columnDefs[1].accessorKey).toBe('nomeCompleto');
    expect(columnDefs[1].header).toBe('Nome');
  });

  it('has email column with accessorKey email', () => {
    expect(columnDefs[2].accessorKey).toBe('email');
    expect(columnDefs[2].header).toBe('Email');
  });

  it('has date column with accessorKey dataCadastro', () => {
    expect(columnDefs[3].accessorKey).toBe('dataCadastro');
    expect(columnDefs[3].header).toBe('Data de Cadastro');
  });

  it('has status column with accessorKey statusMatricula', () => {
    expect(columnDefs[4].accessorKey).toBe('statusMatricula');
    expect(columnDefs[4].header).toBe('Status');
  });

  it('has actions column with id actions', () => {
    expect(columnDefs[5].id).toBe('actions');
  });

  it('renders avatar for photo column', () => {
    const cell = columnDefs[0].cell;
    if (typeof cell === 'function') {
      const { container } = render(cell({ row: { original: mockAluno } } as never));
      expect(container.querySelector('[data-testid="avatar"]')).toBeTruthy();
    }
  });

  it('renders name and email in name column', () => {
    const cell = columnDefs[1].cell;
    if (typeof cell === 'function') {
      render(
        cell({
          row: {
            getValue: (key: string) => mockAluno[key as keyof Aluno],
            original: mockAluno,
          },
        } as never)
      );
      expect(screen.getByText('João Silva')).toBeTruthy();
    }
  });

  it('renders email in email column', () => {
    const cell = columnDefs[2].cell;
    if (typeof cell === 'function') {
      render(
        cell({
          row: {
            original: mockAluno,
          },
        } as never)
      );
      expect(screen.getByText('joao@test.com')).toBeTruthy();
    }
  });

  it('renders formatted date in date column', () => {
    const cell = columnDefs[3].cell;
    if (typeof cell === 'function') {
      render(
        cell({
          row: {
            getValue: () => '2024-01-01',
            original: mockAluno,
          },
        } as never)
      );
      expect(screen.getByText('01/01/2024')).toBeTruthy();
    }
  });

  it('renders nothing when date is empty', () => {
    const cell = columnDefs[3].cell;
    if (typeof cell === 'function') {
      const { container } = render(
        cell({
          row: {
            getValue: () => '',
            original: mockAlunoNullDate,
          },
        } as never)
      );
      expect(container.firstChild).toBeNull();
    }
  });

  it('renders status badge for ATIVA status', () => {
    const cell = columnDefs[4].cell;
    if (typeof cell === 'function') {
      render(
        cell({
          row: {
            getValue: () => 'ATIVA',
            original: mockAluno,
          },
        } as never)
      );
      expect(screen.getByText('ATIVA')).toBeTruthy();
    }
  });

  it('renders status badge for INADIMPLENTE status', () => {
    const cell = columnDefs[4].cell;
    if (typeof cell === 'function') {
      render(
        cell({
          row: {
            getValue: () => 'INADIMPLENTE',
            original: mockAluno,
          },
        } as never)
      );
      expect(screen.getByText('INADIMPLENTE')).toBeTruthy();
    }
  });

  it('renders status badge for INATIVA status', () => {
    const cell = columnDefs[4].cell;
    if (typeof cell === 'function') {
      render(
        cell({
          row: {
            getValue: () => 'INATIVA',
            original: mockAluno,
          },
        } as never)
      );
      expect(screen.getByText('INATIVA')).toBeTruthy();
    }
  });

  it('renders actions menu button', () => {
    const cell = columnDefs[5].cell;
    if (typeof cell === 'function') {
      render(
        cell({
          row: {
            original: mockAluno,
            getVisibleCells: () => [],
          },
        } as never)
      );
      expect(screen.getByLabelText('Mais opções')).toBeTruthy();
    }
  });

  it('renders "Editar Aluno" button and triggers onEdit', () => {
    const cell = columnDefs[5].cell;
    if (typeof cell === 'function') {
      render(
        cell({
          row: {
            original: mockAluno,
          },
        } as never)
      );
      screen.getByText('Editar Aluno').click();
      expect(onEdit).toHaveBeenCalledWith(mockAluno);
    }
  });

  it('renders avatar fallback with initials for full name', () => {
    const cell = columnDefs[0].cell;
    if (typeof cell === 'function') {
      render(cell({ row: { original: mockAluno } } as never));
      expect(screen.getByText('JS')).toBeTruthy();
    }
  });

  it('renders avatar fallback with empty name', () => {
    const cell = columnDefs[0].cell;
    if (typeof cell === 'function') {
      render(cell({ row: { original: mockAlunoEmptyName } } as never));
    }
  });

  it('renders avatar fallback with single name', () => {
    const cell = columnDefs[0].cell;
    if (typeof cell === 'function') {
      render(cell({ row: { original: mockAlunoSingleName } } as never));
    }
  });
});
