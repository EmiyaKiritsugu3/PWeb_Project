import * as Sentry from '@sentry/nextjs';
import { prisma } from './prisma';
import {
  AlunoSchema,
  PlanoSchema,
  TreinoSchema,
  DashboardStatsSchema,
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

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function groupByMonth(rows: { date: Date }[]) {
  const map = new Map<string, number>();
  for (const { date } of rows) {
    const k = monthKey(date);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));
}

export async function getMatriculasPorMes() {
  const thirteenMonthsAgo = new Date();
  thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13, 1);
  thirteenMonthsAgo.setHours(0, 0, 0, 0);

  // ponytail: Prisma groupBy can't group by date-trunc directly; we window to 13 months
  // and group in JS. Upgrade to prisma.$queryRaw with DATE_TRUNC if row count grows.
  const rows = await prisma.aluno.findMany({
    where: { dataCadastro: { gte: thirteenMonthsAgo } },
    select: { dataCadastro: true },
  });
  return groupByMonth(rows.map((r) => ({ date: r.dataCadastro })));
}

export async function getReceitaPorMes() {
  const thirteenMonthsAgo = new Date();
  thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13, 1);
  thirteenMonthsAgo.setHours(0, 0, 0, 0);

  const rows = await prisma.pagamento.findMany({
    where: { dataPagamento: { gte: thirteenMonthsAgo } },
    select: { dataPagamento: true, valor: true },
  });
  const map = new Map<string, number>();
  for (const { dataPagamento, valor } of rows) {
    const k = monthKey(dataPagamento);
    map.set(k, (map.get(k) ?? 0) + valor);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));
}

export async function getMatriculasPorPlano() {
  // ponytail: findMany + JS group per brief's spirit (groupBy); swap to prisma.matricula.groupBy
  // by planoId if row count grows past gym scale.
  const rows = await prisma.matricula.findMany({
    where: { status: 'ATIVA' },
    select: { Plano: { select: { nome: true } } },
  });
  const map = new Map<string, number>();
  for (const r of rows) {
    const nome = r.Plano?.nome ?? 'Sem plano';
    map.set(nome, (map.get(nome) ?? 0) + 1);
  }
  return [...map.entries()].map(([plano, total]) => ({ plano, total }));
}

function pctDelta(curr: number, prev: number) {
  if (prev === 0) return curr === 0 ? 0 : 1;
  return (curr - prev) / prev;
}

export async function getDashboardStats() {
  const [
    totalAlunos,
    matriculasAtivas,
    alunosInadimplentes,
    matriculasPorMes,
    receitaPorMes,
    matriculasPorPlano,
  ] = await Promise.all([
    prisma.aluno.count(),
    prisma.matricula.count({ where: { status: 'ATIVA' } }),
    prisma.aluno.count({ where: { statusMatricula: 'INADIMPLENTE' } }),
    getMatriculasPorMes(),
    getReceitaPorMes(),
    getMatriculasPorPlano(),
  ]);

  const last = (s: { total: number }[]) => s[s.length - 1]?.total ?? 0;
  const prev = (s: { total: number }[]) => s[s.length - 2]?.total ?? 0;

  // Faturamento = receita do último bucket mensal (honest: mês mais recente), não soma total.
  const faturamentoMensal = last(receitaPorMes);

  const deltas = {
    // alunos + inadimplentes sem delta honesto (sem snapshot histórico) — ver schema.
    receita: pctDelta(last(receitaPorMes), prev(receitaPorMes)),
    novos: pctDelta(last(matriculasPorMes), prev(matriculasPorMes)),
  };

  return DashboardStatsSchema.parse({
    totalAlunos,
    matriculasAtivas,
    alunosInadimplentes,
    faturamentoMensal,
    matriculasPorMes,
    receitaPorMes,
    matriculasPorPlano,
    deltas,
  });
}
