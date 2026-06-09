import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardTreino } from './card-treino';
import type { Treino } from '@/lib/definitions';
import type { ReactNode } from 'react';

type MockChildren = { children?: ReactNode };

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, glass }: MockChildren & { glass?: boolean }) => (
    <div data-testid="card" data-glass={glass}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: MockChildren) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: MockChildren) => <h2>{children}</h2>,
  CardDescription: ({ children }: MockChildren) => <p>{children}</p>,
  CardContent: ({ children }: MockChildren) => <div data-testid="card-content">{children}</div>,
  CardFooter: ({ children }: MockChildren) => <footer data-testid="card-footer">{children}</footer>,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id?: string;
    checked?: boolean;
    onCheckedChange?: () => void;
  }) => (
    <input
      type="checkbox"
      data-testid={`checkbox-${id}`}
      checked={checked}
      onChange={onCheckedChange}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: MockChildren & { onClick?: () => void; disabled?: boolean; variant?: string }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  CalendarOff: () => <span data-testid="calendar-off-icon" />,
  Sparkles: () => <span>✨</span>,
  BrainCircuit: () => <span data-testid="brain-icon" />,
  Info: () => <span>ℹ️</span>,
}));

vi.mock('@/components/ui/circular-progress', () => ({
  CircularProgress: ({ value }: { value: number }) => (
    <div data-testid="circular-progress" data-value={value} />
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

const mockUseWorkoutTracker = vi.fn();
vi.mock('@/hooks/use-workout-tracker', () => ({
  useWorkoutTracker: (...args: unknown[]) => mockUseWorkoutTracker(...args),
}));

const mockTreino: Treino = {
  id: 'treino-1',
  alunoId: 'aluno-1',
  instrutorId: null,
  objetivo: 'Treino A - Peito',
  exercicios: [
    {
      id: 'ex-1',
      nomeExercicio: 'Supino Reto',
      series: 4,
      repeticoes: '10-12',
      observacoes: null,
      descricao: null,
    },
    {
      id: 'ex-2',
      nomeExercicio: 'Crucifixo',
      series: 3,
      repeticoes: '12-15',
      observacoes: null,
      descricao: null,
    },
  ],
  diaSemana: 1,
  dataCriacao: '2024-01-01',
};

describe('CardTreino', () => {
  const mockOnFinishTraining = vi.fn();
  const mockOnViewExercicio = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWorkoutTracker.mockReturnValue({
      checkedExercises: {},
      handleCheckChange: vi.fn(),
    });
  });

  it('renders rest day message when treino is null', () => {
    render(
      <CardTreino
        treino={null}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByText('Dia de Descanso Ativo')).toBeTruthy();
  });

  it('renders rest day description when treino is null', () => {
    render(
      <CardTreino
        treino={null}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByText(/Aproveite para focar/)).toBeTruthy();
  });

  it('renders treino objetivo as title', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByText('Treino A - Peito')).toBeTruthy();
  });

  it('renders exercise names', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByText('Supino Reto')).toBeTruthy();
    expect(screen.getByText('Crucifixo')).toBeTruthy();
  });

  it('renders series x reps for exercises', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByText('4 x 10-12 • REPETIÇÕES')).toBeTruthy();
    expect(screen.getByText('3 x 12-15 • REPETIÇÕES')).toBeTruthy();
  });

  it('renders checkboxes for each exercise', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByTestId('checkbox-ex-1')).toBeTruthy();
    expect(screen.getByTestId('checkbox-ex-2')).toBeTruthy();
  });

  it('renders finish button', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByText('Finalizar e Avaliar Treino')).toBeTruthy();
  });

  it('finish button is disabled when no exercises checked', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    const button = screen.getByText('Finalizar e Avaliar Treino').closest('button');
    expect(button?.disabled).toBe(true);
  });

  it('shows loading state when feedback is loading', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={true}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByText('Processando análise...')).toBeTruthy();
  });

  it('disables finish button when feedback is loading', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={true}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    const button = screen.getByText('Processando análise...').closest('button');
    expect(button?.disabled).toBe(true);
  });

  it('renders circular progress component', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByTestId('circular-progress')).toBeTruthy();
  });

  it('renders progress percentage description', () => {
    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    expect(screen.getByText(/Desempenho atual:/)).toBeTruthy();
  });

  it('calls onFinishTraining when finish is clicked with checked exercises', () => {
    mockUseWorkoutTracker.mockReturnValue({
      checkedExercises: { 'ex-1': true, 'ex-2': false },
      handleCheckChange: vi.fn(),
    });

    render(
      <CardTreino
        treino={mockTreino}
        onFinishTraining={mockOnFinishTraining}
        isFeedbackLoading={false}
        onViewExercicio={mockOnViewExercicio}
      />
    );
    fireEvent.click(screen.getByText('Finalizar e Avaliar Treino'));
    expect(mockOnFinishTraining).toHaveBeenCalledWith(['ex-1']);
  });
});
