import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutEditor } from './workout-editor';
import type { Treino } from '@/lib/definitions';
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

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children?: ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    id,
    placeholder,
    value,
    onChange,
  }: {
    id?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input
      data-testid={id || placeholder}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
  }: {
    children?: ReactNode;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  PlusCircle: () => <span>+</span>,
  Save: () => <span>💾</span>,
  Dumbbell: () => <span>🏋️</span>,
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({ toast: mockToast })),
}));

const mockUseWorkoutExercises = vi.fn();
vi.mock('@/hooks/use-workout-exercises', () => ({
  useWorkoutExercises: (...args: unknown[]) => mockUseWorkoutExercises(...args),
}));

vi.mock('@/components/dashboard/aluno/workout-exercise-row', () => ({
  WorkoutExerciseRow: ({
    exercise,
    index,
  }: {
    exercise: Record<string, unknown>;
    index: number;
  }) => (
    <div data-testid="exercise-row">
      <span data-testid="exercise-index">{index}</span>
      <span data-testid="exercise-name">{String(exercise.nomeExercicio || '')}</span>
    </div>
  ),
}));

describe('WorkoutEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultHookReturn = {
    objetivo: '',
    setObjetivo: vi.fn(),
    exercicios: [],
    addObjective: vi.fn(),
    removeExercise: vi.fn(),
    updateExercise: vi.fn(),
    hasValidationErrors: vi.fn(() => false),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWorkoutExercises.mockReturnValue(defaultHookReturn);
  });

  it('renders without throwing', () => {
    const { container } = render(
      <WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />
    );
    expect(container).toBeTruthy();
  });

  it('shows "Criar Novo Treino Pessoal" title when no treino', () => {
    render(<WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />);
    expect(screen.getByText('Criar Novo Treino Pessoal')).toBeTruthy();
  });

  it('shows "Editar Treino Pessoal" title when editing', () => {
    const treinoToEdit = {
      id: 'treino-1',
      alunoId: 'aluno-1',
      instrutorId: null,
      objetivo: 'Treino A',
      exercicios: [],
      diaSemana: 1,
      dataCriacao: '2024-01-01',
    } as Treino;

    render(
      <WorkoutEditor onSave={mockOnSave} treinoToEdit={treinoToEdit} onCancel={mockOnCancel} />
    );
    expect(screen.getByText('Editar Treino Pessoal')).toBeTruthy();
  });

  it('renders objective input', () => {
    render(<WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />);
    expect(screen.getByText('Nome/Objetivo do Treino')).toBeTruthy();
  });

  it('renders add exercise button', () => {
    render(<WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />);
    expect(screen.getByText('Adicionar Exercício Manualmente')).toBeTruthy();
  });

  it('calls addObjective when add exercise is clicked', () => {
    const addObjective = vi.fn();
    mockUseWorkoutExercises.mockReturnValue({ ...defaultHookReturn, addObjective });

    render(<WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Adicionar Exercício Manualmente'));
    expect(addObjective).toHaveBeenCalled();
  });

  it('calls onCancel when cancel is clicked', () => {
    render(<WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows "Salvar Novo Treino" button when no treino', () => {
    render(<WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />);
    expect(screen.getByText('Salvar Novo Treino')).toBeTruthy();
  });

  it('shows "Salvar Alterações" button when editing', () => {
    const treinoToEdit = {
      id: 'treino-1',
      alunoId: 'aluno-1',
      instrutorId: null,
      objetivo: 'Treino A',
      exercicios: [],
      diaSemana: 1,
      dataCriacao: '2024-01-01',
    } as Treino;

    render(
      <WorkoutEditor onSave={mockOnSave} treinoToEdit={treinoToEdit} onCancel={mockOnCancel} />
    );
    expect(screen.getByText('Salvar Alterações')).toBeTruthy();
  });

  it('shows validation error toast when save with errors', () => {
    const hasValidationErrors = vi.fn(() => true);
    mockUseWorkoutExercises.mockReturnValue({ ...defaultHookReturn, hasValidationErrors });

    render(<WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Salvar Novo Treino'));
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao salvar',
        variant: 'destructive',
      })
    );
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('renders exercise rows when exercises exist', () => {
    const exercises = [
      { id: 'ex-1', nomeExercicio: 'Supino', series: 3, repeticoes: '10-12' },
      { id: 'ex-2', nomeExercicio: 'Agachamento', series: 4, repeticoes: '8-10' },
    ];
    mockUseWorkoutExercises.mockReturnValue({ ...defaultHookReturn, exercicios: exercises });

    render(<WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />);
    expect(screen.getAllByTestId('exercise-row')).toHaveLength(2);
  });
});
