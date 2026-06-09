import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlunoDashboardClient from './dashboard-client';
import type { Aluno, Treino } from '@/lib/definitions';
import type { ReactNode } from 'react';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
      <div {...filterDomProps(props)}>{children}</div>
    ),
  },
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

vi.mock('lucide-react', () => ({
  Trophy: () => <span>TrophyIcon</span>,
  TrendingUp: () => <span>TrendingUpIcon</span>,
  Zap: () => <span>ZapIcon</span>,
  Target: () => <span>TargetIcon</span>,
  Award: () => <span>AwardIcon</span>,
}));

vi.mock('@/lib/logger', () => ({
  Logger: { error: vi.fn(), info: vi.fn() },
}));

vi.mock('@/lib/actions/alunos', () => ({
  finalizarTreinoAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
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
        'dashboard.workoutsThisMonth': `${params?.count ?? 0} treinos no mês`,
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
  CardTreino: () => <div data-testid="card-treino" />,
}));

vi.mock('@/components/dashboard/aluno/card-feedback', () => ({
  CardFeedback: () => <div data-testid="card-feedback" />,
}));

function filterDomProps(props: Record<string, unknown>): Record<string, unknown> {
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
}

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
});
