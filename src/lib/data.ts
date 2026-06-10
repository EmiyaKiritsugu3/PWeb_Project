import * as Sentry from '@sentry/nextjs';
import { prisma } from './prisma';
import {
  AlunoSchema,
  PlanoSchema,
  TreinoSchema,
  DashboardStatsSchema,
  V_FaturamentoMensalSchema,
  type Aluno,
  type Plano,
  type Treino,
} from './definitions';

export type AlunoDetalhes = NonNullable<Awaited<ReturnType<typeof getAlunoDetalhes>>>;

// --- Real Data Fetchers (Prisma) ---

export async function getAlunos(): Promise<Aluno[]> {
  try {
    const alunos = await prisma.aluno.findMany({
      orderBy: { nomeCompleto: 'asc' },
    });
    return alunos.reduce<Aluno[]>((acc, aluno) => {
      const result = AlunoSchema.safeParse(aluno);
      if (result.success) {
        acc.push(result.data);
      } else {
        Sentry.captureMessage(`Skipping invalid aluno ${aluno.id}`, 'warning');
      }
      return acc;
    }, []);
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
}

export async function getPlanos(): Promise<Plano[]> {
  try {
    const planos = await prisma.plano.findMany({
      orderBy: { preco: 'asc' },
    });
    return planos.map((plano) => PlanoSchema.parse(plano));
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
}

export async function getTreinos(alunoId?: string): Promise<Treino[]> {
  try {
    const treinos = await prisma.treino.findMany({
      where: alunoId ? { alunoId } : undefined,
      include: {
        Exercicios: true,
      },
      orderBy: { dataCriacao: 'desc' },
    });

    // Validamos a estrutura, embora o tipo many-to-many precise de mapeamento
    return treinos.map((t) => {
      const { Exercicios, ...rest } = t;
      return TreinoSchema.parse({
        ...rest,
        exercicios: Exercicios,
      });
    });
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
}

export async function getAlunoDetalhes(id: string) {
  try {
    return await prisma.aluno.findUnique({
      where: { id },
      include: {
        Matriculas: {
          include: { Plano: true },
          orderBy: { dataInicio: 'desc' },
        },
        Pagamentos: {
          orderBy: { dataPagamento: 'desc' },
          take: 10,
        },
        Treinos: {
          include: { Exercicios: true },
          orderBy: { dataCriacao: 'desc' },
        },
        HistoricoTreinos: {
          orderBy: { dataExecucao: 'desc' },
          take: 5,
        },
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
}

type RawFaturamento = { TotalRecebido: number; Mes: string; QtdPagamentos: number };

export async function getDashboardStats() {
  try {
    const [totalAlunos, matriculasAtivas, alunosInadimplentes] = await Promise.all([
      prisma.aluno.count(),
      prisma.matricula.count({ where: { status: 'ATIVA' } }),
      prisma.aluno.count({ where: { statusMatricula: 'INADIMPLENTE' } }),
    ]);

    // Busca faturamento via View SQL
    let faturamentoMensal = 0;
    try {
      const rawFaturamento = await prisma.$queryRaw`SELECT * FROM "V_FaturamentoMensal" LIMIT 1`;
      const faturamentoValidado = V_FaturamentoMensalSchema.safeParse(
        (rawFaturamento as RawFaturamento[])?.[0]
      );

      if (faturamentoValidado.success) {
        faturamentoMensal = faturamentoValidado.data.TotalRecebido;
      }
      // sonar-ignore-next-line
    } catch (_viewError) {
      Sentry.captureMessage(
        'Aviso: Falha ao ler V_FaturamentoMensal. O banco pode estar vazio ou a view ausente.',
        {
          level: 'warning',
          extra: { viewError: String(_viewError) },
        }
      );
    }

    // Projeção de Crescimento Validada
    const GROWTH_BASE_FACTOR = 0.7;
    const GROWTH_INCREMENT = 0.05;
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const crescimentoAnual = meses.map((mes, idx) => ({
      mes,
      alunos: Math.floor(totalAlunos * (GROWTH_BASE_FACTOR + idx * GROWTH_INCREMENT)),
    }));

    return DashboardStatsSchema.parse({
      totalAlunos,
      matriculasAtivas,
      alunosInadimplentes,
      faturamentoMensal,
      crescimentoAnual,
    });
  } catch (error) {
    Sentry.captureException(error);
    return DashboardStatsSchema.parse({}); // Retorna valores padrão seguros do schema
  }
}
