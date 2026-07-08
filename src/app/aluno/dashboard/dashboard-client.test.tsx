import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlunoDashboardClient from './dashboard-client';
import type { Aluno, Treino } from '@/lib/definitions';
import type { ReactNode } from 'react';

const filterDomProps = (props: Record<string, unknown>): Record<string, unknown> => {
  const domProps: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    if (
      key === 'children' ||
      key === 'className' ||
      key === 'data-testid' ||
      key.startsWith('data-')
    ) {
      domProps[key] = val;
    }
  }
  return domProps;
};

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
      <div {...filterDomProps(props)}>{children}</div>
    ),
  },
}));

const {
  mockNotify,
  mockFinalizarTreinoAction,
  mockGenerateWorkoutFeedback,
  mockLogger,
  mockRegistrarHistorico,
  mockRefresh,
} = vi.hoisted(() => ({
  mockNotify: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
  mockFinalizarTreinoAction: vi.fn().mockResolvedValue({ success: true }),
  mockGenerateWorkoutFeedback: vi
    .fn()
    .mockResolvedValue({ title: 'Mandou bem!', message: 'Ótimo treino!' }),
  mockLogger: { error: vi.fn(), info: vi.fn() },
  mockRegistrarHistorico: vi.fn().mockResolvedValue({ success: true }),
  mockRefresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <button {...filterDomProps(props)}>{children}</button>
  ),
}));

vi.mock('@/lib/logger', () => ({
  Logger: mockLogger,
}));

vi.mock('@/lib/actions/alunos', () => ({
  finalizarTreinoAction: (...args: unknown[]) => mockFinalizarTreinoAction(...args),
}));

// Mock treinos action before real import — Prisma eager init would hit
// DATABASE_URL at import time and fail the whole file in CI/local.
vi.mock('@/lib/actions/treinos', () => ({
  registrarHistoricoTreinoAction: (...args: unknown[]) => mockRegistrarHistorico(...args),
}));

vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => mockNotify,
}));

vi.mock('@/components/ui/circular-progress', () => ({
  CircularProgress: ({ value, label }: { value?: number; label?: string }) => (
    <div data-testid="circular-progress" data-value={value}>
      {label}
    </div>
  ),
}));

vi.mock('@/components/providers/i18n-provider', () => ({
  useI18n: () => ({
    language: 'pt',
    setLanguage: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        'common.welcome': 'Olá',
        'dashboard.level': 'Nível',
        'dashboard.xp': 'XP',
        'dashboard.streak': `${params?.count ?? 0} dias seguidos`,
        'dashboard.workoutsThisMonth': '{count} treinos no mês',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('@/components/dashboard/aluno/exercicio-viewer', () => ({
  ExercicioViewer: () => <div data-testid="exercicio-viewer" />,
}));

vi.mock('@/components/dashboard/aluno/card-matricula', () => ({
  CardMatricula: () => <div data-testid="card-matricula" />,
}));

vi.mock('@/components/dashboard/aluno/card-treino', () => ({
  CardTreino: ({
    onFinishTraining,
    onStartWorkout,
  }: {
    treino: Treino | null;
    onFinishTraining: (exIds: string[]) => void;
    isFeedbackLoading: boolean;
    onViewExercicio: (ex: unknown) => void;
    onStartWorkout: () => void;
  }) => (
    <div data-testid="card-treino">
      <button data-testid="btn-finish-training" onClick={() => onFinishTraining(['ex-1'])}>
        Finish Training
      </button>
      <button data-testid="btn-start-workout" onClick={onStartWorkout}>
        Start Workout
      </button>
    </div>
  ),
}));

vi.mock('@/components/dashboard/aluno/card-feedback', () => ({
  CardFeedback: () => <div data-testid="card-feedback" />,
}));

// WorkoutSession gates the onFinish/onCancel contract handleFinishWorkout uses.
vi.mock('@/components/WorkoutSession', () => ({
  WorkoutSession: ({
    onFinish,
    onCancel,
  }: {
    treino: Treino;
    onFinish: (h: Omit<unknown, never>) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="workout-session">
      <button
        data-testid="btn-session-finish"
        onClick={() =>
          onFinish({
            treinoId: 'treino-1',
            data: '2026-07-08',
            duracaoMinutos: 30,
            exerciciosConcluidos: 1,
          })
        }
      >
        Finish Session
      </button>
      <button data-testid="btn-session-cancel" onClick={onCancel}>
        Cancel Session
      </button>
    </div>
  ),
}));

vi.mock('@/ai/flows/workout-feedback-flow', () => ({
  generateWorkoutFeedback: (...args: unknown[]) => mockGenerateWorkoutFeedback(...args),
}));

vi.mock('lucide-react', () => ({
  Trophy: () => <span>TrophyIcon</span>,
  TrendingUp: () => <span>TrendingUpIcon</span>,
  Zap: () => <span>ZapIcon</span>,
  Target: () => <span>TargetIcon</span>,
  Award: () => <span>AwardIcon</span>,
}));

const mockAluno: Aluno = {
  id: '1',
  nomeCompleto: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao@example.com',
  telefone: '(11) 99999-9999',
  dataNascimento: null,
  dataCadastro: '2024-01-01',
  fotoUrl: null,
  statusMatricula: 'ATIVA',
  nivel: 5,
  exp: 1200,
  xpToNextLevel: 2000,
  progressPerc: 60,
  streakDiasSeguidos: 7,
  treinosNoMes: 12,
  ultimoTreinoData: null,
};

const mockTreino: Treino = {
  id: 'treino-1',
  alunoId: '1',
  objetivo: 'Hipertrofia',
  diaSemana: 1,
  exercicios: [
    {
      id: 'ex-1',
      nomeExercicio: 'Supino Reto',
      series: 4,
      repeticoes: '12',
      observacoes: null,
      descricao: 'Deite-se em um banco reto',
    },
  ],
};

describe('AlunoDashboardClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome message with first name', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    expect(screen.getByTestId('dashboard-welcome').textContent).toContain('JOÃO');
  });

  it('renders streak display', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    expect(screen.getByTestId('dashboard-welcome')).toBeTruthy();
    expect(screen.getByText(/dias seguidos/)).toBeTruthy();
  });

  it('renders workouts this month', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('renders level progress', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    expect(screen.getByTestId('circular-progress')).toBeTruthy();
    expect(screen.getByText((content) => content.includes('NÍVEL'))).toBeTruthy();
  });

  it('renders XP display', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    expect(screen.getByTestId('xp-display').textContent).toContain('1200');
    expect(screen.getByTestId('xp-display').textContent).toContain('2000');
  });

  it('renders achievements section', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    expect(screen.getByText('CONQUISTAS')).toBeTruthy();
    expect(screen.getByText('Iniciante Elite')).toBeTruthy();
  });

  it('renders subcomponents', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    expect(screen.getByTestId('card-treino')).toBeTruthy();
    expect(screen.getByTestId('card-feedback')).toBeTruthy();
    expect(screen.getByTestId('card-matricula')).toBeTruthy();
    expect(screen.getByTestId('exercicio-viewer')).toBeTruthy();
  });

  it('renders without crashing when initialTreino is null', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={null} />);
    expect(screen.getByTestId('dashboard-welcome')).toBeTruthy();
  });

  it('calls finalizarTreinoAction on finish training success', async () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    fireEvent.click(screen.getByTestId('btn-finish-training'));

    await waitFor(() => {
      expect(mockFinalizarTreinoAction).toHaveBeenCalledWith('treino-1');
      expect(mockNotify.success).toHaveBeenCalledWith(
        'Treino Sincronizado!',
        '+500 XP adicinados ao seu perfil.'
      );
    });
  });

  it('shows error notification when finalizarTreinoAction fails', async () => {
    mockFinalizarTreinoAction.mockResolvedValue({ success: false });

    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    fireEvent.click(screen.getByTestId('btn-finish-training'));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith('Erro de conexão');
    });
  });

  it('handles finalizarTreinoAction throwing', async () => {
    mockFinalizarTreinoAction.mockRejectedValue(new Error('Network error'));

    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    fireEvent.click(screen.getByTestId('btn-finish-training'));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith('Erro ao salvar treino');
    });
  });

  // O9FaX: clicking "Start Workout" toggles treinoEmSessao state, swapping
  // the dashboard render for the WorkoutSession gate.
  it('toggles WorkoutSession on start workout click', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    expect(screen.getByTestId('card-treino')).toBeTruthy();
    expect(screen.queryByTestId('workout-session')).toBeNull();

    fireEvent.click(screen.getByTestId('btn-start-workout'));

    expect(screen.queryByTestId('card-treino')).toBeNull();
    expect(screen.getByTestId('workout-session')).toBeTruthy();
  });

  it('cancels WorkoutSession back to dashboard', () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    fireEvent.click(screen.getByTestId('btn-start-workout'));
    expect(screen.getByTestId('workout-session')).toBeTruthy();

    fireEvent.click(screen.getByTestId('btn-session-cancel'));
    expect(screen.queryByTestId('workout-session')).toBeNull();
    expect(screen.getByTestId('card-treino')).toBeTruthy();
  });

  // PMTVI: successful handleFinishWorkout must call router.refresh() so the
  // mounted client re-fetches RSC (XP/level/streak) — props stay stale otherwise.
  it('calls router.refresh after registrarHistoricoTreinoAction success', async () => {
    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    fireEvent.click(screen.getByTestId('btn-start-workout'));
    fireEvent.click(screen.getByTestId('btn-session-finish'));

    await waitFor(() => {
      expect(mockRegistrarHistorico).toHaveBeenCalledWith(
        expect.objectContaining({ treinoId: 'treino-1', duracaoMinutos: 30 })
      );
      expect(mockNotify.success).toHaveBeenCalledWith(
        'Treino Finalizado!',
        'Seu progresso e XP foram salvos!'
      );
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('shows error notification without router.refresh on registrarHistorico failure', async () => {
    mockRegistrarHistorico.mockResolvedValue({ success: false, error: 'DB down' });

    render(<AlunoDashboardClient aluno={mockAluno} initialTreino={mockTreino} />);
    fireEvent.click(screen.getByTestId('btn-start-workout'));
    fireEvent.click(screen.getByTestId('btn-session-finish'));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith(
        'Erro ao salvar histórico',
        undefined,
        expect.any(Error)
      );
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});
