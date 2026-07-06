import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkoutSession } from './WorkoutSession';
import type { Treino } from '@/lib/definitions';
import type { ReactNode } from 'react';

function filterDomProps(props: Record<string, unknown>): Record<string, unknown> {
  const domProps: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    if (
      key === 'children' ||
      key === 'className' ||
      key.startsWith('data-') ||
      key.startsWith('aria-')
    ) {
      domProps[key] = val;
    }
  }
  return domProps;
}

vi.mock('react-timer-hook', () => ({
  useTimer: () => ({
    seconds: 0,
    minutes: 0,
    isRunning: false,
    restart: vi.fn(),
  }),
}));

vi.mock('@/ai/flows/workout-feedback-flow', () => ({
  generateWorkoutFeedback: vi.fn(),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    ...rest
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...filterDomProps(rest)}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children, className }: { children: ReactNode; className?: string }) => (
    <h2 className={className}>{children}</h2>
  ),
  CardDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardFooter: ({ children, className }: { children: ReactNode; className?: string }) => (
    <footer className={className}>{children}</footer>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: { children: ReactNode; className?: string }) => (
    <label className={className}>{children}</label>
  ),
}));

const mockTreino: Treino = {
  id: 'treino-1',
  alunoId: 'aluno-1',
  instrutorId: 'instrutor-1',
  objetivo: 'Peito e Tríceps',
  diaSemana: 1,
  dataCriacao: '2024-01-01',
  exercicios: [
    {
      id: 'ex-1',
      nomeExercicio: 'Supino Reto',
      series: 3,
      repeticoes: '10-12',
      observacoes: 'Controlar a descida',
      descricao: 'Exercício para peito',
    },
    {
      id: 'ex-2',
      nomeExercicio: 'Tríceps Pulley',
      series: 3,
      repeticoes: '12-15',
      observacoes: null,
      descricao: 'Exercício para tríceps',
    },
  ],
};

const mockOnFinish = vi.fn();
const mockOnCancel = vi.fn();

describe('WorkoutSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockOnFinish).mockResolvedValue(undefined);
  });

  it('renders without crashing', () => {
    const { container } = render(
      <WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />
    );
    expect(container).toBeTruthy();
  });

  it('renders the first exercise name', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    expect(screen.getByText('Supino Reto')).toBeTruthy();
  });

  it('shows exercise progress indicator', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    expect(screen.getByText('Exercício 1 de 2')).toBeTruthy();
  });

  it('renders the planned sets and reps', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    expect(screen.getByText(/Planejado: 3 séries x 10-12 reps/)).toBeTruthy();
  });

  it('renders observations when available', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    expect(screen.getByText('Obs: Controlar a descida')).toBeTruthy();
  });

  it('renders series inputs for the current exercise (3 sets)', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    const pesoInputs = screen.getAllByPlaceholderText('Peso (kg)');
    const repsInputs = screen.getAllByPlaceholderText('Reps');
    expect(pesoInputs).toHaveLength(3);
    expect(repsInputs).toHaveLength(3);
  });

  it('disables "Anterior" button on first exercise', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    const prevBtn = screen.getByText(/Anterior/);
    expect(prevBtn.hasAttribute('disabled')).toBe(true);
  });

  it('navigates to next exercise when "Próximo" is clicked', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Próximo/));
    expect(screen.getByText('Tríceps Pulley')).toBeTruthy();
    expect(screen.getByText('Exercício 2 de 2')).toBeTruthy();
  });

  it('shows "Finalizar Treino" on last exercise', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Próximo/));
    expect(screen.getByText('Finalizar Treino')).toBeTruthy();
  });

  it('navigates back with "Anterior"', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Próximo/));
    expect(screen.getByText('Tríceps Pulley')).toBeTruthy();

    fireEvent.click(screen.getByText(/Anterior/));
    expect(screen.getByText('Supino Reto')).toBeTruthy();
  });

  it('calls onFinish and shows completion screen', async () => {
    const { generateWorkoutFeedback } = await import('@/ai/flows/workout-feedback-flow');
    vi.mocked(generateWorkoutFeedback).mockResolvedValue({
      title: 'Treino Concluído!',
      message: 'Excelente trabalho!',
    });

    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Próximo/));
    fireEvent.click(screen.getByText(/Finalizar Treino/));

    await waitFor(() => {
      expect(mockOnFinish).toHaveBeenCalled();
      expect(screen.getByText('Treino Finalizado!')).toBeTruthy();
    });
  });

  it('clamps duracaoMinutos to at least 1 on a very short session', async () => {
    const { generateWorkoutFeedback } = await import('@/ai/flows/workout-feedback-flow');
    vi.mocked(generateWorkoutFeedback).mockResolvedValue({
      title: 'Treino Concluído!',
      message: 'Excelente trabalho!',
    });

    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    // Finish immediately — elapsed < 1 min, raw Math.round would yield 0
    fireEvent.click(screen.getByText(/Próximo/));
    fireEvent.click(screen.getByText(/Finalizar Treino/));

    await waitFor(() => {
      expect(mockOnFinish).toHaveBeenCalled();
    });
    const historico = mockOnFinish.mock.calls[0][0];
    expect(historico.duracaoMinutos).toBeGreaterThanOrEqual(1);
  });

  it('shows loading state while generating feedback', async () => {
    const { generateWorkoutFeedback } = await import('@/ai/flows/workout-feedback-flow');
    let resolveFeedback!: (v: { title: string; message: string }) => void;
    vi.mocked(generateWorkoutFeedback).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFeedback = resolve;
        })
    );

    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Próximo/));
    fireEvent.click(screen.getByText(/Finalizar Treino/));

    await waitFor(() => {
      expect(screen.getByText(/Gerando seu feedback personalizado/)).toBeTruthy();
    });

    resolveFeedback!({ title: 'Feito!', message: 'Bom treino!' });

    await waitFor(() => {
      expect(screen.getByText('Feito!')).toBeTruthy();
    });
  });

  it('calls onCancel when "Fechar Treino" is clicked', async () => {
    const { generateWorkoutFeedback } = await import('@/ai/flows/workout-feedback-flow');
    vi.mocked(generateWorkoutFeedback).mockResolvedValue({
      title: 'Concluído',
      message: 'Bom!',
    });

    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Próximo/));
    fireEvent.click(screen.getByText(/Finalizar Treino/));

    await waitFor(() => {
      expect(screen.getByText('Fechar Treino')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Fechar Treino'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders series-row containers with serie-check testids', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    expect(screen.getAllByTestId('series-row')).toHaveLength(3);
    expect(screen.getByTestId('serie-check-0')).toBeTruthy();
    expect(screen.getByTestId('serie-check-2')).toBeTruthy();
  });

  it('toggles series completion via serie-check testid', () => {
    render(<WorkoutSession treino={mockTreino} onFinish={mockOnFinish} onCancel={mockOnCancel} />);
    const firstCheck = screen.getByTestId('serie-check-0');
    expect(firstCheck.getAttribute('data-variant')).toBe('outline');
    fireEvent.click(firstCheck);
    expect(screen.getByTestId('serie-check-0').getAttribute('data-variant')).toBe('default');
  });
});
