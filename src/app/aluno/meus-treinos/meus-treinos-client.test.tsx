import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MeusTreinosClient from './meus-treinos-client';
import type { Treino } from '@/lib/definitions';
import type { ReactNode } from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-workout-crud', () => ({
  useWorkoutCRUD: () => ({
    meusTreinos: [
      {
        id: 'treino-1',
        alunoId: 'user-1',
        objetivo: 'Hipertrofia',
        diaSemana: 1,
        instrutorId: 'instrutor-1',
        exercicios: [{ id: 'ex-1', nomeExercicio: 'Supino', series: 4, repeticoes: '12' }],
      },
      {
        id: 'treino-2',
        alunoId: 'user-1',
        objetivo: 'Resistência',
        diaSemana: null,
        exercicios: [{ id: 'ex-2', nomeExercicio: 'Corrida', series: 1, repeticoes: '30min' }],
      },
    ],
    isFormVisible: false,
    setIsFormVisible: vi.fn(),
    editingTreino: null,
    setEditingTreino: vi.fn(),
    isAlertOpen: false,
    setIsAlertOpen: vi.fn(),
    deletingTreino: null,
    handleSave: vi.fn(),
    handleEdit: vi.fn(),
    handleDayChange: vi.fn(),
    openDeleteAlert: vi.fn(),
    handleDelete: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-workout-generation', () => ({
  useWorkoutGeneration: () => ({
    isGenerating: false,
    handleGenerate: vi.fn(),
  }),
}));

vi.mock('@/lib/actions/treinos', () => ({
  registrarHistoricoTreinoAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/components/page-header', () => ({
  PageHeader: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...filterDomProps(props)}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: ReactNode; open?: boolean }) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  AlertDialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: ReactNode }) => <footer>{children}</footer>,
  AlertDialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/WorkoutSession', () => ({
  WorkoutSession: () => <div data-testid="workout-session" />,
}));

vi.mock('@/components/dashboard/aluno/workout-generator', () => ({
  WorkoutGenerator: () => <div data-testid="workout-generator" />,
}));

vi.mock('@/components/dashboard/aluno/workout-editor', () => ({
  WorkoutEditor: () => <div data-testid="workout-editor" />,
}));

function filterDomProps(props: Record<string, unknown>): Record<string, unknown> {
  const domProps: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    if (key === 'children' || key === 'className' || key.startsWith('data-')) {
      domProps[key] = val;
    }
  }
  return domProps;
}

const mockTreinos: Treino[] = [
  {
    id: 'treino-1',
    alunoId: 'user-1',
    objetivo: 'Hipertrofia',
    diaSemana: 1,
    instrutorId: 'instrutor-1',
    exercicios: [{ id: 'ex-1', nomeExercicio: 'Supino', series: 4, repeticoes: '12' }],
  },
  {
    id: 'treino-2',
    alunoId: 'user-1',
    objetivo: 'Resistência',
    diaSemana: null,
    exercicios: [{ id: 'ex-2', nomeExercicio: 'Corrida', series: 1, repeticoes: '30min' }],
  },
];

describe('MeusTreinosClient', () => {
  it('renders the page header', () => {
    render(<MeusTreinosClient initialTreinos={mockTreinos} userId="user-1" />);
    expect(screen.getByText('Meus Treinos')).toBeTruthy();
  });

  it('renders personal workout section', () => {
    render(<MeusTreinosClient initialTreinos={mockTreinos} userId="user-1" />);
    expect(screen.getByText('Planos do Personal')).toBeTruthy();
  });

  it('renders personal workout list description', () => {
    render(<MeusTreinosClient initialTreinos={mockTreinos} userId="user-1" />);
    expect(screen.getByText('Treinos criados e enviados pelo seu instrutor.')).toBeTruthy();
  });

  it('renders personal workouts section and personal workouts info', () => {
    render(<MeusTreinosClient initialTreinos={[]} userId="user-1" />);
    expect(screen.getByText('Meus Treinos Pessoais')).toBeTruthy();
  });

  it('renders workout generator', () => {
    render(<MeusTreinosClient initialTreinos={[]} userId="user-1" />);
    expect(screen.getByTestId('workout-generator')).toBeTruthy();
  });

  it('renders create button when form is not visible', () => {
    render(<MeusTreinosClient initialTreinos={[]} userId="user-1" />);
    expect(screen.getByText('Criar Novo Treino Manualmente')).toBeTruthy();
  });
});
