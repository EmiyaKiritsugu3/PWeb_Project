import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkoutGenerator } from './workout-generator';
import type { ReactNode } from 'react';

type MockChildren = { children?: ReactNode };

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: MockChildren) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: MockChildren) => <div>{children}</div>,
  CardTitle: ({ children }: MockChildren) => <h2>{children}</h2>,
  CardDescription: ({ children }: MockChildren) => <p>{children}</p>,
  CardContent: ({ children }: MockChildren) => <div>{children}</div>,
  CardFooter: ({ children }: MockChildren) => <footer>{children}</footer>,
}));

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
    disabled,
    form,
  }: {
    children?: ReactNode;
    onClick?: () => void;
    type?: string;
    disabled?: boolean;
    form?: string;
  }) => (
    <button
      onClick={onClick}
      type={type as 'button' | 'submit' | 'reset'}
      disabled={disabled}
      data-form={form}
    >
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Wand2: () => <span>🪄</span>,
  BrainCircuit: () => <span>🧠</span>,
}));

vi.mock('@/components/ui/form', () => {
  const Form = ({ children, id }: MockChildren & { id?: string }) => (
    <form id={id}>{children}</form>
  );
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
  return { Form, FormControl, FormField, FormItem, FormLabel };
});

describe('WorkoutGenerator', () => {
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without throwing', () => {
    const { container } = render(
      <WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={false} />
    );
    expect(container).toBeTruthy();
  });

  it('renders the title', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={false} />);
    expect(screen.getByText('Gerador de Plano Semanal com IA')).toBeTruthy();
  });

  it('renders the description', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={false} />);
    expect(screen.getByText(/Preencha seus dados/)).toBeTruthy();
  });

  it('renders form fields labels', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={false} />);
    expect(screen.getByText('Objetivo')).toBeTruthy();
    expect(screen.getByText('Meu Nível')).toBeTruthy();
    expect(screen.getByText('Dias/Semana')).toBeTruthy();
    expect(screen.getByText('Observações (Opcional)')).toBeTruthy();
  });

  it('shows "Gerar Plano Pessoal com IA" when not generating', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={false} />);
    expect(screen.getByText('Gerar Plano Pessoal com IA')).toBeTruthy();
  });

  it('shows "Gerando Plano..." when generating', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={true} />);
    expect(screen.getByText('Gerando Plano...')).toBeTruthy();
  });

  it('disables button when generating', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={true} />);
    const button = screen.getByText('Gerando Plano...').closest('button');
    expect(button?.disabled).toBe(true);
  });

  it('does not disable button when not generating', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={false} />);
    const button = screen.getByText('Gerar Plano Pessoal com IA').closest('button');
    expect(button?.disabled).toBe(false);
  });

  it('form has correct id for external submit', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={false} />);
    const form = document.getElementById('ai-generator-form');
    expect(form).toBeTruthy();
  });

  it('submit button references the form via form attribute', () => {
    render(<WorkoutGenerator onGenerate={mockOnGenerate} isGenerating={false} />);
    const button = screen.getByText('Gerar Plano Pessoal com IA').closest('button');
    expect(button?.getAttribute('data-form')).toBe('ai-generator-form');
  });
});
