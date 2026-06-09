import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormAluno } from './form-aluno';
import type { Aluno } from '@/lib/definitions';
import type { ReactNode } from 'react';

type MockChildren = { children?: ReactNode };
type MockDialog = MockChildren & { open?: boolean };

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: MockDialog) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: MockChildren) => <div>{children}</div>,
  DialogHeader: ({ children }: MockChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: MockChildren) => <h2>{children}</h2>,
  DialogDescription: ({ children }: MockChildren) => <p>{children}</p>,
  DialogFooter: ({ children }: MockChildren) => <footer>{children}</footer>,
}));

vi.mock('@/components/ui/form', () => {
  const Form = ({ children }: MockChildren) => <form>{children}</form>;
  const FormControl = ({ children }: MockChildren) => <div>{children}</div>;
  const FormField = ({
    render: renderProp,
    ...rest
  }: {
    render: (props: { field: Record<string, unknown> }) => ReactNode;
    [key: string]: unknown;
  }) => {
    const restObj = rest as { field?: Record<string, unknown> };
    const field = { value: '', onChange: vi.fn(), ...(restObj.field ?? {}) };
    return <div>{renderProp({ field })}</div>;
  };
  const FormItem = ({ children }: MockChildren) => <div>{children}</div>;
  const FormLabel = ({ children }: MockChildren) => <label>{children}</label>;
  const FormMessage = () => null;
  return { Form, FormControl, FormField, FormItem, FormLabel, FormMessage };
});

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
    defaultValue,
  }: {
    children?: ReactNode;
    onValueChange?: (v: string) => void;
    defaultValue?: string;
  }) => (
    <select
      data-testid="select"
      value={defaultValue}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: MockChildren) => <>{children}</>,
  SelectItem: ({ children, value }: { children?: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    placeholder,
    type,
    ...props
  }: {
    placeholder?: string;
    type?: string;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${placeholder || type || 'text'}`}
      placeholder={placeholder}
      type={type}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    type,
    variant,
  }: {
    children?: ReactNode;
    onClick?: () => void;
    type?: string;
    variant?: string;
  }) => (
    <button onClick={onClick} type={type as 'button' | 'submit' | 'reset'} data-variant={variant}>
      {children}
    </button>
  ),
}));

const mockAluno: Aluno = {
  id: '1',
  nomeCompleto: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao@test.com',
  telefone: '(11) 99999-9999',
  dataNascimento: '1990-01-01',
  dataCadastro: '2023-01-01',
  fotoUrl: '',
  statusMatricula: 'INATIVA',
  nivel: 1,
  exp: 0,
  streakDiasSeguidos: 0,
  treinosNoMes: 0,
  ultimoTreinoData: null,
};

describe('FormAluno', () => {
  const mockOnSubmit = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <FormAluno isOpen={false} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />
    );
    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
  });

  it('renders when isOpen is true', () => {
    render(<FormAluno isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Cadastrar Novo Aluno')).toBeTruthy();
  });

  it('shows "Cadastrar" submit button for new aluno', () => {
    render(<FormAluno isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Cadastrar')).toBeTruthy();
  });

  it('shows "Editar Aluno" title when editing', () => {
    render(
      <FormAluno
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        aluno={mockAluno}
      />
    );
    expect(screen.getByText('Editar Aluno')).toBeTruthy();
  });

  it('shows "Salvar Alterações" button when editing', () => {
    render(
      <FormAluno
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        aluno={mockAluno}
      />
    );
    expect(screen.getByText('Salvar Alterações')).toBeTruthy();
  });

  it('calls onOpenChange(false) when cancel is clicked', () => {
    render(<FormAluno isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders all form fields', () => {
    render(<FormAluno isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Nome Completo')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('CPF')).toBeTruthy();
    expect(screen.getByText('Telefone')).toBeTruthy();
    expect(screen.getByText('Data de Nascimento')).toBeTruthy();
  });

  it('shows status select when editing', () => {
    render(
      <FormAluno
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        aluno={mockAluno}
      />
    );
    expect(screen.getByText('Status da Matrícula')).toBeTruthy();
  });

  it('does not show status select for new aluno', () => {
    render(<FormAluno isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.queryByText('Status da Matrícula')).toBeNull();
  });
});
