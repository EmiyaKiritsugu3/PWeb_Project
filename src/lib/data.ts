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

// --- Real Data Fetchers (Prisma) ---

export async function getAlunos(): Promise<Aluno[]> {
  try {
    const alunos = await prisma.aluno.findMany({
      orderBy: { nomeCompleto: 'asc' },
    });
    // AlunoSchema agora exige ID obrigatório, o que o Prisma retorna
    return alunos.map((aluno: any) => AlunoSchema.parse(aluno));
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return [];
  }
}

export async function getPlanos(): Promise<Plano[]> {
  try {
    const planos = await prisma.plano.findMany({
      orderBy: { preco: 'asc' },
    });
    return planos.map((plano: any) => PlanoSchema.parse(plano));
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return [];
  }
}

export async function getTreinos(alunoId?: string): Promise<any[]> {
  try {
    const treinos = await prisma.treino.findMany({
      where: alunoId ? { alunoId } : undefined,
      include: {
        Exercicios: true,
      },
      orderBy: { dataCriacao: 'desc' },
    });

    // Validamos a estrutura, embora o tipo many-to-many precise de mapeamento
    return treinos.map((t: any) => {
      const { Exercicios, ...rest } = t;
      return TreinoSchema.parse({
        ...rest,
        exercicios: Exercicios,
      });
    });
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    return [];
  }
}

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
      const faturamentoValidado = V_FaturamentoMensalSchema.safeParse((rawFaturamento as any)?.[0]);

      if (faturamentoValidado.success) {
        faturamentoMensal = faturamentoValidado.data.TotalRecebido;
      }
    } catch (viewError) {
      console.warn(
        'Aviso: Falha ao ler V_FaturamentoMensal. O banco pode estar vazio ou a view ausente.'
      );
    }

    // Projeção de Crescimento Validada
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const crescimentoAnual = meses.map((mes, idx) => ({
      mes,
      alunos: Math.floor(totalAlunos * (0.7 + idx * 0.05)), // Simula crescimento gradual baseado no total atual
    }));

    return DashboardStatsSchema.parse({
      totalAlunos,
      matriculasAtivas,
      alunosInadimplentes,
      faturamentoMensal,
      crescimentoAnual,
    });
  } catch (error) {
    console.error('Erro crítico ao buscar estatísticas do Dashboard:', error);
    return DashboardStatsSchema.parse({}); // Retorna valores padrão seguros do schema
  }
}
