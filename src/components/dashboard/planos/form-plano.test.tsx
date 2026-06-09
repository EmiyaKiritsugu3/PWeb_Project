import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormPlano } from './form-plano';
import type { Plano } from '@/lib/definitions';
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
  }: {
    render: (props: { field: Record<string, unknown> }) => ReactNode;
  }) => {
    const field = { value: '', onChange: vi.fn() };
    return <div>{renderProp({ field })}</div>;
  };
  const FormItem = ({ children }: MockChildren) => <div>{children}</div>;
  const FormLabel = ({ children }: MockChildren) => <label>{children}</label>;
  const FormMessage = () => null;
  return { Form, FormControl, FormField, FormItem, FormLabel, FormMessage };
});

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

const mockPlano: Plano = {
  id: 'plano-1',
  nome: 'Mensal',
  preco: 100,
  duracaoDias: 30,
};

describe('FormPlano', () => {
  const mockOnSubmit = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <FormPlano isOpen={false} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />
    );
    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
  });

  it('renders when isOpen is true', () => {
    render(<FormPlano isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Novo Plano')).toBeTruthy();
  });

  it('shows "Criar Plano" submit button for new plano', () => {
    render(<FormPlano isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Criar Plano')).toBeTruthy();
  });

  it('shows "Editar Plano" title when editing', () => {
    render(
      <FormPlano
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        plano={mockPlano}
      />
    );
    expect(screen.getByText('Editar Plano')).toBeTruthy();
  });

  it('shows "Salvar Alterações" button when editing', () => {
    render(
      <FormPlano
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        plano={mockPlano}
      />
    );
    expect(screen.getByText('Salvar Alterações')).toBeTruthy();
  });

  it('calls onOpenChange(false) when cancel is clicked', () => {
    render(<FormPlano isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders all form fields', () => {
    render(<FormPlano isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Nome do Plano')).toBeTruthy();
    expect(screen.getByText('Preço (R$)')).toBeTruthy();
    expect(screen.getByText('Duração (dias)')).toBeTruthy();
  });

  it('shows create description for new plano', () => {
    render(<FormPlano isOpen={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Preencha os dados para criar um novo plano.')).toBeTruthy();
  });

  it('shows edit description when editing', () => {
    render(
      <FormPlano
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        plano={mockPlano}
      />
    );
    expect(screen.getByText('Edite os dados do plano.')).toBeTruthy();
  });
});
