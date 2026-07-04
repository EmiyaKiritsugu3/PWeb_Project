import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TreinosManagementClient from './treinos-client';
import type { Aluno } from '@/lib/definitions';
import type { ReactNode } from 'react';

const { mockNotify, mockWorkoutExercises } = vi.hoisted(() => ({
  mockNotify: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
  mockWorkoutExercises: {
    objetivo: '',
    setObjetivo: vi.fn(),
    exercicios: [] as unknown[],
    addObjective: vi.fn(),
    removeExercise: vi.fn(),
    updateExercise: vi.fn(),
    hasValidationErrors: vi.fn(() => true),
    reset: vi.fn(),
  },
}));

vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => mockNotify,
}));

vi.mock('@/hooks/use-workout-exercises', () => ({
  useWorkoutExercises: () => mockWorkoutExercises,
}));

const { mockUpsertTreinoAction, mockBatchUpsertTreinoAction, mockStreamWorkoutPlan } = vi.hoisted(
  () => ({
    mockUpsertTreinoAction: vi.fn(),
    mockBatchUpsertTreinoAction: vi.fn(),
    mockStreamWorkoutPlan: vi.fn(),
  })
);

vi.mock('@/lib/actions/treinos', () => ({
  upsertTreinoAction: (...args: unknown[]) => mockUpsertTreinoAction(...args),
  batchUpsertTreinoAction: (...args: unknown[]) => mockBatchUpsertTreinoAction(...args),
}));

vi.mock('@/ai/flows/workout-generator-flow', () => ({
  streamWorkoutPlan: (...args: unknown[]) => mockStreamWorkoutPlan(...args),
}));

vi.mock('@/lib/logger', () => ({
  Logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/lib/exercise-options', () => ({
  flatExerciciosOptions: [{ value: 'Supino Reto', description: 'Supino' }],
}));

vi.mock('@/components/dashboard/aluno/workout-generator', () => ({
  WorkoutGenerator: ({
    onGenerate,
    isGenerating,
  }: {
    onGenerate: (d: unknown) => void;
    isGenerating: boolean;
  }) => (
    <div data-testid="workout-generator">
      <span>{isGenerating ? 'Gerando...' : 'Gerar'}</span>
      <button data-testid="btn-generate-ai" onClick={() => onGenerate({})}>
        Gerar IA
      </button>
    </div>
  ),
}));

vi.mock('@/components/dashboard/aluno/workout-exercise-row', () => ({
  WorkoutExerciseRow: () => <div data-testid="workout-exercise-row" />,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: ReactNode;
    onValueChange: (v: string) => void;
    value?: string;
  }) => (
    <select
      data-testid="aluno-select"
      value={value ?? ''}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardFooter: ({ children }: { children: ReactNode }) => <footer>{children}</footer>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: ReactNode }) => <label>{children}</label>,
}));

const mockAlunos: Aluno[] = [
  {
    id: 'aluno-1',
    nomeCompleto: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@test.com',
    telefone: '(11) 99999-9999',
    dataNascimento: '1990-01-01',
    dataCadastro: '2023-01-01',
    fotoUrl: '',
    statusMatricula: 'ATIVA',
    nivel: 1,
    exp: 0,
    streakDiasSeguidos: 0,
    treinosNoMes: 0,
    ultimoTreinoData: null,
  },
  {
    id: 'aluno-2',
    nomeCompleto: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria@test.com',
    telefone: '(11) 88888-8888',
    dataNascimento: '1995-05-15',
    dataCadastro: '2023-06-01',
    fotoUrl: '',
    statusMatricula: 'ATIVA',
    nivel: 3,
    exp: 150,
    streakDiasSeguidos: 5,
    treinosNoMes: 12,
    ultimoTreinoData: '2024-01-10',
  },
];

describe('TreinosManagementClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkoutExercises.objetivo = '';
    mockWorkoutExercises.exercicios = [];
    mockWorkoutExercises.hasValidationErrors.mockReturnValue(true);
  });

  it('renders without crashing', () => {
    const { container } = render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    expect(container).toBeTruthy();
  });

  it('renders the page title with Passo 1', () => {
    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    expect(screen.getByText(/Passo 1: Selecionar Aluno/)).toBeTruthy();
  });

  it('renders the student select with all students', () => {
    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    expect(screen.getByText('João Silva')).toBeTruthy();
    expect(screen.getByText('Maria Santos')).toBeTruthy();
  });

  it('does not show Step 2 when no student is selected', () => {
    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    expect(screen.queryByText(/Passo 2/)).toBeNull();
  });

  it('shows Step 2 when a student is selected', () => {
    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    const select = screen.getByTestId('aluno-select');
    fireEvent.change(select, { target: { value: 'aluno-1' } });
    expect(screen.getByText(/Passo 2: Criar Treino Manual para João Silva/)).toBeTruthy();
  });

  it('shows WorkoutGenerator when a student is selected', () => {
    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    expect(screen.getByTestId('workout-generator')).toBeTruthy();
  });

  it('calls upsertTreinoAction on save when validation passes', async () => {
    mockUpsertTreinoAction.mockResolvedValue({ success: true });
    mockWorkoutExercises.hasValidationErrors.mockReturnValue(false);
    mockWorkoutExercises.exercicios = [
      {
        id: 'ex-1',
        nomeExercicio: 'Supino',
        series: 3,
        repeticoes: '10-12',
        observacoes: null,
        descricao: null,
      },
    ];
    mockWorkoutExercises.objetivo = 'Peito e Tríceps';

    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    fireEvent.click(screen.getByText(/Salvar Treino/));

    await waitFor(() => {
      expect(mockUpsertTreinoAction).toHaveBeenCalled();
      expect(mockNotify.success).toHaveBeenCalledWith('Treino Salvo!');
    });
  });

  it('shows error notification when upsertTreinoAction fails', async () => {
    mockUpsertTreinoAction.mockResolvedValue({ success: false, error: 'Erro de banco' });
    mockWorkoutExercises.hasValidationErrors.mockReturnValue(false);
    mockWorkoutExercises.exercicios = [
      {
        id: 'ex-1',
        nomeExercicio: 'Supino',
        series: 3,
        repeticoes: '10-12',
        observacoes: null,
        descricao: null,
      },
    ];
    mockWorkoutExercises.objetivo = 'Peito';

    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    fireEvent.click(screen.getByText(/Salvar Treino/));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalled();
    });
  });

  it('handles upsertTreinoAction throwing an error', async () => {
    mockUpsertTreinoAction.mockRejectedValue(new Error('Erro inesperado'));
    mockWorkoutExercises.hasValidationErrors.mockReturnValue(false);
    mockWorkoutExercises.exercicios = [
      {
        id: 'ex-1',
        nomeExercicio: 'Supino',
        series: 3,
        repeticoes: '10-12',
        observacoes: null,
        descricao: null,
      },
    ];
    mockWorkoutExercises.objetivo = 'Peito';

    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    fireEvent.click(screen.getByText(/Salvar Treino/));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalled();
    });
  });

  it('calls addObjective when "Adicionar Exercício" is clicked', () => {
    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    fireEvent.click(screen.getByText(/Adicionar Exercício/));
    expect(mockWorkoutExercises.addObjective).toHaveBeenCalled();
  });

  it('disables save button when exercicios is empty', () => {
    mockWorkoutExercises.exercicios = [];
    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });

    const saveBtn = screen.getByText(/Salvar Treino/);
    expect(saveBtn.hasAttribute('disabled')).toBe(true);
  });

  const mockAiPlan = {
    planName: 'Plano IA',
    workouts: [
      {
        nome: 'Treino A',
        objetivo: 'Hipertrofia',
        diaSugerido: 1,
        exercicios: [
          {
            nomeExercicio: 'Supino Reto',
            grupoMuscular: 'Peito',
            series: 4,
            repeticoes: '10-12',
            observacoes: '',
          },
        ],
      },
    ],
  };

  it('shows error when trying to save without validation and no selectedAlunoId', () => {
    mockWorkoutExercises.hasValidationErrors.mockReturnValue(true);
    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    const saveBtn = screen.queryByText(/Salvar Treino/);
    expect(saveBtn).toBeNull();
  });

  it('generates AI workout plan and shows PlanoGeradoParaEdicao', async () => {
    mockStreamWorkoutPlan.mockResolvedValue(mockAiPlan);

    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    fireEvent.click(screen.getByTestId('btn-generate-ai'));

    await waitFor(() => {
      expect(mockStreamWorkoutPlan).toHaveBeenCalled();
      expect(mockNotify.success).toHaveBeenCalledWith('Plano Gerado!');
      expect(screen.getByText('Revisar Plano para João Silva')).toBeTruthy();
    });

    expect(screen.getByDisplayValue('Plano IA')).toBeTruthy();
    expect(screen.getByDisplayValue('Treino A')).toBeTruthy();
  });

  it('saves generated plan via batchUpsertTreinoAction', async () => {
    mockStreamWorkoutPlan.mockResolvedValue(mockAiPlan);
    mockBatchUpsertTreinoAction.mockResolvedValue({ success: true });

    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    fireEvent.click(screen.getByTestId('btn-generate-ai'));

    await waitFor(() => {
      expect(screen.getByText('Revisar Plano para João Silva')).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Salvar e Atribuir/));

    await waitFor(() => {
      expect(mockBatchUpsertTreinoAction).toHaveBeenCalled();
      expect(mockNotify.success).toHaveBeenCalledWith('Plano Atribuído!');
    });
  });

  it('handles AI generation returning null', async () => {
    mockStreamWorkoutPlan.mockResolvedValue(null);

    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    fireEvent.click(screen.getByTestId('btn-generate-ai'));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalled();
    });
  });

  it('handles AI generation throwing error', async () => {
    mockStreamWorkoutPlan.mockRejectedValue(new Error('API Error'));

    render(<TreinosManagementClient initialAlunos={mockAlunos} />);
    fireEvent.change(screen.getByTestId('aluno-select'), { target: { value: 'aluno-1' } });
    fireEvent.click(screen.getByTestId('btn-generate-ai'));

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith(
        'Erro da IA',
        'Não foi possível gerar o treino. Tente novamente em instantes.',
        expect.any(Error)
      );
    });
  });
});
