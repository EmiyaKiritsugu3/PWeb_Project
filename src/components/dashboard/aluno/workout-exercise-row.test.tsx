import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutExerciseRow } from './workout-exercise-row';
import type { Exercicio } from '@/lib/definitions';
import type { ReactNode } from 'react';

type MockChildren = { children?: ReactNode };

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: MockChildren & { className?: string }) => (
    <label className={className}>{children}</label>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    placeholder,
    type,
    className,
    value,
    onChange,
    ...props
  }: {
    placeholder?: string;
    type?: string;
    className?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${placeholder || type || 'text'}`}
      placeholder={placeholder}
      type={type}
      className={className}
      value={value}
      onChange={onChange}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    ...props
  }: MockChildren & { onClick?: () => void; variant?: string }) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Trash2: () => <span>🗑️</span>,
}));

vi.mock('@/components/ui/combobox', () => ({
  Combobox: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="combobox"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/lib/exercise-options', () => ({
  exerciciosOptions: [],
  flatExerciciosOptions: [],
}));

const mockExercise: Partial<Exercicio> = {
  id: 'ex-1',
  nomeExercicio: 'Supino Reto',
  series: 4,
  repeticoes: '10-12',
  observacoes: 'Controlar a descida',
};

describe('WorkoutExerciseRow', () => {
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without throwing', () => {
    const { container } = render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders combobox for exercise name by default', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.getByTestId('combobox')).toBeTruthy();
  });

  it('renders input for exercise name in input mode', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        mode="input"
      />
    );
    expect(screen.getByTestId('input-Nome do exercicio')).toBeTruthy();
  });

  it('renders series input', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.getByTestId('input-number')).toBeTruthy();
  });

  it('renders reps input with placeholder', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.getByPlaceholderText('10-12')).toBeTruthy();
  });

  it('renders obs input with placeholder', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.getByPlaceholderText('Opcional')).toBeTruthy();
  });

  it('shows labels only on first row (index 0)', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.getByText('Exercicio')).toBeTruthy();
    expect(screen.getByText('Series')).toBeTruthy();
    expect(screen.getByText('Reps')).toBeTruthy();
    expect(screen.getByText('Obs')).toBeTruthy();
  });

  it('does not show labels on non-first row (index > 0)', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={1}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.queryByText('Exercicio')).toBeNull();
    expect(screen.queryByText('Series')).toBeNull();
    expect(screen.queryByText('Reps')).toBeNull();
    expect(screen.queryByText('Obs')).toBeNull();
  });

  it('renders delete button when onRemove is provided', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.getByLabelText('Remover exercicio')).toBeTruthy();
  });

  it('does not render delete button when onRemove is not provided', () => {
    render(<WorkoutExerciseRow exercise={mockExercise} index={0} onUpdate={mockOnUpdate} />);
    expect(screen.queryByLabelText('Remover exercicio')).toBeNull();
  });

  it('calls onRemove when delete is clicked', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    fireEvent.click(screen.getByLabelText('Remover exercicio'));
    expect(mockOnRemove).toHaveBeenCalledWith('ex-1');
  });

  it('calls onUpdate when series input changes', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    fireEvent.change(screen.getByTestId('input-number'), { target: { value: '5' } });
    expect(mockOnUpdate).toHaveBeenCalledWith('ex-1', 'series', 5);
  });

  it('calls onUpdate when reps input changes', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('10-12'), { target: { value: '8-10' } });
    expect(mockOnUpdate).toHaveBeenCalledWith('ex-1', 'repeticoes', '8-10');
  });

  it('calls onUpdate when obs input changes', () => {
    render(
      <WorkoutExerciseRow
        exercise={mockExercise}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Opcional'), { target: { value: 'Nova obs' } });
    expect(mockOnUpdate).toHaveBeenCalledWith('ex-1', 'observacoes', 'Nova obs');
  });
});
