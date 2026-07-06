import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlunoDetalhesPage from './page';
import type { ReactNode } from 'react';

const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockGetAlunoDetalhes = vi.fn();
vi.mock('@/lib/data', () => ({
  getAlunoDetalhes: (...args: unknown[]) => mockGetAlunoDetalhes(...args),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className} data-testid="avatar">
      {children}
    </div>
  ),
  AvatarImage: () => null,
  AvatarFallback: ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    variant,
    size,
    asChild,
    ...props
  }: {
    children: ReactNode;
    variant?: string;
    size?: string;
    asChild?: boolean;
    [key: string]: unknown;
  }) => (
    <button data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: ReactNode; className?: string }) => (
    <h3 className={className}>{children}</h3>
  ),
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children, className }: { children: ReactNode; className?: string }) => (
    <td className={className}>{children}</td>
  ),
  TableHead: ({ children }: { children: ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
}));

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span>ArrowLeft</span>,
  Dumbbell: () => <span>Dumbbell</span>,
  Star: () => <span>Star</span>,
  Flame: () => <span>Flame</span>,
  CalendarDays: () => <span>CalendarDays</span>,
  CreditCard: () => <span>CreditCard</span>,
}));

vi.mock('date-fns', () => ({
  format: (date: Date, _fmt: string) => `formatted:${date.toISOString().split('T')[0]}`,
}));

vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

const fullAluno = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
  nomeCompleto: 'João Silva Santos',
  cpf: '123.456.789-00',
  email: 'joao@test.com',
  telefone: '(11) 99999-8888',
  dataNascimento: '1995-03-15T00:00:00.000Z',
  dataCadastro: '2024-01-10T00:00:00.000Z',
  fotoUrl: 'https://example.com/photo.jpg',
  statusMatricula: 'ATIVA',
  nivel: 3,
  exp: 2500,
  streakDiasSeguidos: 15,
  treinosNoMes: 12,
  Matriculas: [
    {
      id: 'm1',
      status: 'ATIVA',
      dataInicio: '2024-01-01T00:00:00.000Z',
      dataVencimento: '2024-07-01T00:00:00.000Z',
      Plano: { nome: 'Premium' },
    },
    {
      id: 'm2',
      status: 'INADIMPLENTE',
      dataInicio: '2023-06-01T00:00:00.000Z',
      dataVencimento: '2023-12-01T00:00:00.000Z',
      Plano: { nome: 'Básico' },
    },
  ],
  Pagamentos: [
    {
      id: 'p1',
      dataPagamento: '2024-06-01T00:00:00.000Z',
      valor: 199.9,
      metodo: 'PIX',
    },
    {
      id: 'p2',
      dataPagamento: '2024-05-01T00:00:00.000Z',
      valor: 199.9,
      metodo: 'CARTAO',
    },
    {
      id: 'p3',
      dataPagamento: '2024-04-01T00:00:00.000Z',
      valor: 99.9,
      metodo: 'DINHEIRO',
    },
  ],
  Treinos: [
    {
      id: 't1',
      objetivo: 'Hipertrofia',
      diaSemana: 1,
      dataCriacao: '2024-06-01T00:00:00.000Z',
      Exercicios: [
        { id: 'e1', nome: 'Supino' },
        { id: 'e2', nome: 'Agachamento' },
      ],
    },
    {
      id: 't2',
      objetivo: 'Resistência',
      diaSemana: null,
      dataCriacao: '2024-05-15T00:00:00.000Z',
      Exercicios: [{ id: 'e3', nome: 'Corrida' }],
    },
  ],
};

function makeParams(id: string) {
  return Promise.resolve({ id });
}

describe('AlunoDetalhesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls notFound when aluno is null', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(null);

    await expect(AlunoDetalhesPage({ params: makeParams('not-found-id') })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );

    expect(mockNotFound).toHaveBeenCalled();
  });

  it('renders the aluno name', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('João Silva Santos')).toBeTruthy();
  });

  it('renders the email', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('joao@test.com')).toBeTruthy();
  });

  it('renders the status badge with correct variant', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    const badges = screen.getAllByText('ATIVA');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders gamification stats (level, streak, treinos)', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('Lv3')).toBeTruthy();
    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('renders the XP progress bar', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('2500 XP')).toBeTruthy();
    expect(screen.getByText('4500 XP')).toBeTruthy();
  });

  it('renders CPF and phone info', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('123.456.789-00')).toBeTruthy();
    expect(screen.getByText('(11) 99999-8888')).toBeTruthy();
  });

  it('renders the active plan info', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    const premiums = screen.getAllByText('Premium');
    expect(premiums.length).toBeGreaterThanOrEqual(1);
  });

  it('renders matriculas table with status variants', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('Histórico de Matrículas')).toBeTruthy();
    expect(screen.getAllByText('Premium').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Básico').length).toBeGreaterThanOrEqual(1);
  });

  it('renders pagamentos table with formatted values', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('Últimos Pagamentos')).toBeTruthy();
  });

  it('renders treinos list', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText(/Treinos Cadastrados/)).toBeTruthy();
    expect(screen.getByText('Hipertrofia')).toBeTruthy();
    expect(screen.getByText('Resistência')).toBeTruthy();
  });

  it('renders empty matriculas message when no matriculas', async () => {
    mockGetAlunoDetalhes.mockResolvedValue({ ...fullAluno, Matriculas: [] });

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('Nenhuma matrícula registrada.')).toBeTruthy();
  });

  it('renders empty pagamentos message when no pagamentos', async () => {
    mockGetAlunoDetalhes.mockResolvedValue({ ...fullAluno, Pagamentos: [] });

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('Nenhum pagamento registrado.')).toBeTruthy();
  });

  it('renders empty treinos message when no treinos', async () => {
    mockGetAlunoDetalhes.mockResolvedValue({ ...fullAluno, Treinos: [] });

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('Nenhum treino cadastrado para este aluno.')).toBeTruthy();
  });

  it('renders the back link', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    const backLink = screen.getByText('Voltar');
    expect(backLink).toBeTruthy();
  });

  it('handles aluno with null optional fields', async () => {
    const minimalAluno = {
      ...fullAluno,
      telefone: null,
      dataNascimento: null,
      fotoUrl: null,
      Matriculas: [],
      Pagamentos: [],
      Treinos: [],
    };
    mockGetAlunoDetalhes.mockResolvedValue(minimalAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('João Silva Santos')).toBeTruthy();
  });

  it('renders INADIMPLENTE status variant', async () => {
    mockGetAlunoDetalhes.mockResolvedValue({ ...fullAluno, statusMatricula: 'INADIMPLENTE' });

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    const badges = screen.getAllByText('INADIMPLENTE');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders unknown status as secondary', async () => {
    mockGetAlunoDetalhes.mockResolvedValue({ ...fullAluno, statusMatricula: 'CUSTOM_STATUS' });

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('CUSTOM_STATUS')).toBeTruthy();
  });

  it('renders treino with no diaSemana', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText(/Sem dia fixo/)).toBeTruthy();
  });

  it('formats metodo CARTAO as Cartão', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getAllByText('Cartão').length).toBeGreaterThanOrEqual(1);
  });

  it('formats unknown metodo as-is', async () => {
    mockGetAlunoDetalhes.mockResolvedValue({
      ...fullAluno,
      Pagamentos: [{ ...fullAluno.Pagamentos[0], metodo: 'BOLETO' }],
    });

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getAllByText('BOLETO').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Nível, Streak, Treinos labels', async () => {
    mockGetAlunoDetalhes.mockResolvedValue(fullAluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getByText('Nível')).toBeTruthy();
    expect(screen.getByText('Streak')).toBeTruthy();
    expect(screen.getByText('Treinos/mês')).toBeTruthy();
  });

  it('renders INATIVA and VENCIDA badges', async () => {
    const aluno = {
      ...fullAluno,
      Matriculas: [
        { ...fullAluno.Matriculas[0], status: 'INATIVA' },
        { ...fullAluno.Matriculas[1], status: 'VENCIDA' },
      ],
    };
    mockGetAlunoDetalhes.mockResolvedValue(aluno);

    render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(screen.getAllByText('INATIVA').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('VENCIDA').length).toBeGreaterThanOrEqual(1);
  });

  // PRD-8: mobile card variant renders one <dl> per matricula + one per pagamento
  // (both md:hidden cards and hidden md:block table live in DOM — CSS show/hide).
  it('renders mobile card stack dl count matching matriculas + pagamentos', async () => {
    const aluno = {
      ...fullAluno,
      Matriculas: [
        {
          id: 'm1',
          Plano: { nome: 'Premium' },
          dataInicio: '2026-01-01',
          dataVencimento: '2026-02-01',
          status: 'ATIVA',
        },
        {
          id: 'm2',
          Plano: { nome: 'Básico' },
          dataInicio: '2026-01-01',
          dataVencimento: '2026-02-01',
          status: 'ATIVA',
        },
      ],
      Pagamentos: [
        { id: 'p1', dataPagamento: '2026-01-10', valor: 199.9, metodo: 'PIX' },
        { id: 'p2', dataPagamento: '2026-02-10', valor: 99.9, metodo: 'DINHEIRO' },
      ],
    };
    mockGetAlunoDetalhes.mockResolvedValue(aluno);

    const { container } = render(await AlunoDetalhesPage({ params: makeParams(fullAluno.id) }));

    expect(container.querySelectorAll('dl').length).toBe(
      aluno.Matriculas.length + aluno.Pagamentos.length
    );
  });
});
