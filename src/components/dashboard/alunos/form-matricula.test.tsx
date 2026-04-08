import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormMatricula } from './form-matricula';
import type { Aluno, Plano } from '@/lib/definitions';

// Mocking Radix UI / ShadCN UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <footer>{children}</footer>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select
      data-testid="select-plano"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

describe('FormMatricula', () => {
  const mockAluno: Aluno = {
    id: '1',
    nomeCompleto: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com',
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

  const mockPlanos: Plano[] = [
    { id: 'plano-1', nome: 'Mensal', preco: 100, duracaoDias: 30 },
    { id: 'plano-2', nome: 'Anual', preco: 1000, duracaoDias: 365 },
  ];

  const mockOnOpenChange = vi.fn();
  const mockOnSubmit = vi.fn();

  it('should return null if aluno is not provided', () => {
    const { container } = render(
      <FormMatricula
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        aluno={null}
        planos={mockPlanos}
        onSubmit={mockOnSubmit}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render correctly when open and aluno is provided', () => {
    render(
      <FormMatricula
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        aluno={mockAluno}
        planos={mockPlanos}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Nova Matrícula')).toBeTruthy();
    expect(screen.getByText('João Silva')).toBeTruthy();
    expect(screen.getByText(/Mensal - R\$.*100,00/)).toBeTruthy();
    expect(screen.getByText(/Anual - R\$.*1.000,00/)).toBeTruthy();
  });

  it('should have confirm button disabled initially', () => {
    render(
      <FormMatricula
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        aluno={mockAluno}
        planos={mockPlanos}
        onSubmit={mockOnSubmit}
      />
    );

    const confirmButton = screen.getByText('Confirmar Matrícula');
    expect(confirmButton.hasAttribute('disabled')).toBe(true);
  });

  it('should call onSubmit with correct data when plan is selected and confirmed', () => {
    render(
      <FormMatricula
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        aluno={mockAluno}
        planos={mockPlanos}
        onSubmit={mockOnSubmit}
      />
    );

    const select = screen.getByTestId('select-plano');
    fireEvent.change(select, { target: { value: 'plano-1' } });

    const confirmButton = screen.getByText('Confirmar Matrícula');
    expect(confirmButton.hasAttribute('disabled')).toBe(false);

    fireEvent.click(confirmButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(mockAluno, mockPlanos[0]);
  });

  it('should call onOpenChange(false) when cancel is clicked', () => {
    render(
      <FormMatricula
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        aluno={mockAluno}
        planos={mockPlanos}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
