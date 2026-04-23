import { z } from 'zod';
import { Role } from '@prisma/client';

export { Role };

// --- Schemas & Tipos: Aluno ---

export const AlunoStatusEnum = z.enum(['ATIVA', 'INADIMPLENTE', 'INATIVA']);

/** Esquema Base para Aluno (Campos de entrada e comum) */
export const AlunoBaseSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter pelo menos 11 dígitos'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  dataNascimento: z.string().or(z.date()).optional().nullable(),
  dataCadastro: z.string().or(z.date()).optional(),
  fotoUrl: z.string().url().optional().nullable(),
  biometriaHash: z.string().optional().nullable(),
  statusMatricula: AlunoStatusEnum.default('ATIVA'),
  // Campos de Gamificação
  nivel: z.number().int().min(1).default(1),
  exp: z.number().int().min(0).default(0),
  streakDiasSeguidos: z.number().int().min(0).default(0),
  treinosNoMes: z.number().int().min(0).default(0),
  ultimoTreinoData: z.string().or(z.date()).optional().nullable(),
  xpToNextLevel: z.number().optional(),
  progressPerc: z.number().optional(),
  dataVencimento: z.string().or(z.date()).optional().nullable(),
});

/** Esquema de Entidade Aluno (Garantido pelo Banco de Dados com ID) */
export const AlunoSchema = AlunoBaseSchema.extend({
  id: z.string().uuid('ID inválido'), // IDs no Supabase/Prisma são UUIDs
});

export type AlunoBase = z.infer<typeof AlunoBaseSchema>;
export type Aluno = z.infer<typeof AlunoSchema>;

// --- Schemas & Tipos: Treino & Exercício ---

export const ExercicioBaseSchema = z.object({
  nomeExercicio: z.string().min(2, 'Nome do exercício é obrigatório'),
  series: z.coerce.number().int().min(1, 'Mínimo de 1 série'),
  repeticoes: z.string().min(1, 'Repetições obrigatórias'),
  observacoes: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
});

export const ExercicioSchema = ExercicioBaseSchema.extend({
  id: z.string().uuid('ID inválido'),
});

export type ExercicioBase = z.infer<typeof ExercicioBaseSchema>;
export type Exercicio = z.infer<typeof ExercicioSchema>;

export const TreinoBaseSchema = z.object({
  alunoId: z.string().uuid('ID do aluno inválido'),
  // instrutorId is server-derived from session — not accepted from client
  objetivo: z.string().min(3, 'Objetivo é obrigatório'),
  dataCriacao: z.string().or(z.date()).optional(),
  /** Dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado). Null se não estiver ativo. */
  diaSemana: z.coerce.number().int().min(0).max(6).nullable(),
  exercicios: z.array(ExercicioBaseSchema).min(1, 'Adicione pelo menos um exercício'),
});

export const TreinoSchema = TreinoBaseSchema.extend({
  id: z.string().uuid('ID inválido'),
  instrutorId: z.string().uuid().optional().nullable(),
  // Note: Here we update exercicios to be the Entity version if we are fetching from DB
  exercicios: z.array(ExercicioSchema).min(1),
});

export type TreinoBase = z.infer<typeof TreinoBaseSchema>;
export type Treino = z.infer<typeof TreinoSchema>;

// --- Schemas & Tipos: Histórico & Gamificação ---

export const SerieExecutadaBaseSchema = z.object({
  serieNumero: z.number().int().min(1),
  peso: z.coerce.number().nullable(),
  repeticoesFeitas: z.coerce.number().int().nullable(),
  concluido: z.boolean().default(false),
});

export const SerieExecutadaSchema = SerieExecutadaBaseSchema.extend({
  id: z.string().uuid('ID inválido'),
});

export type SerieExecutadaBase = z.infer<typeof SerieExecutadaBaseSchema>;
export type SerieExecutada = z.infer<typeof SerieExecutadaSchema>;

export const HistoricoTreinoBaseSchema = z.object({
  alunoId: z.string().uuid('ID do aluno inválido'),
  treinoId: z.string().uuid('ID do treino inválido'),
  dataExecucao: z.string().or(z.date()),
  duracaoMinutos: z.coerce.number().int().min(1),
  exercicios: z.array(
    z.object({
      exercicioId: z.string().uuid('ID do exercício inválido'),
      nomeExercicio: z.string(),
      seriesExecutadas: z.array(SerieExecutadaBaseSchema),
    })
  ),
});

export const HistoricoTreinoSchema = HistoricoTreinoBaseSchema.extend({
  id: z.string().uuid('ID inválido'),
  exercicios: z.array(
    z.object({
      exercicioId: z.string().uuid(),
      nomeExercicio: z.string(),
      seriesExecutadas: z.array(SerieExecutadaSchema),
    })
  ),
});

export type HistoricoTreinoBase = z.infer<typeof HistoricoTreinoBaseSchema>;
export type HistoricoTreino = z.infer<typeof HistoricoTreinoSchema>;

// --- Schemas & Tipos: Financeiro ---

export const PlanoBaseSchema = z.object({
  nome: z.string().min(2, 'Nome do plano é obrigatório'),
  preco: z.coerce.number().min(0, 'Preço inválido'),
  duracaoDias: z.coerce.number().int().positive('Duração deve ser positiva'),
});

export const PlanoSchema = PlanoBaseSchema.extend({
  id: z.string().uuid('ID inválido'),
});

export type PlanoBase = z.infer<typeof PlanoBaseSchema>;
export type Plano = z.infer<typeof PlanoSchema>;

export const MatriculaBaseSchema = z.object({
  alunoId: z.string().uuid('ID do aluno inválido'),
  planoId: z.string().uuid('ID do plano inválido'),
  dataInicio: z.string().or(z.date()),
  dataVencimento: z.string().or(z.date()),
  status: z.enum(['ATIVA', 'VENCIDA']).default('ATIVA'),
});

export const MatriculaSchema = MatriculaBaseSchema.extend({
  id: z.string().uuid('ID inválido'),
});

export type MatriculaBase = z.infer<typeof MatriculaBaseSchema>;
export type Matricula = z.infer<typeof MatriculaSchema>;

export const PagamentoBaseSchema = z.object({
  matriculaId: z.string().uuid('ID da matrícula inválido'),
  alunoId: z.string().uuid('ID do aluno inválido'),
  valor: z.coerce.number().min(0),
  dataPagamento: z.string().or(z.date()),
  metodo: z.enum(['PIX', 'Dinheiro', 'Cartão']),
});

export const PagamentoSchema = PagamentoBaseSchema.extend({
  id: z.string().uuid('ID inválido'),
});

export type PagamentoBase = z.infer<typeof PagamentoBaseSchema>;
export type Pagamento = z.infer<typeof PagamentoSchema>;

// --- Schemas & Tipos: Dashboard & Views ---

export const GrowthDataSchema = z.object({
  mes: z.string(),
  alunos: z.number().int(),
});

export type GrowthData = z.infer<typeof GrowthDataSchema>;

export const DashboardStatsSchema = z.object({
  totalAlunos: z.number().int().default(0),
  matriculasAtivas: z.number().int().default(0),
  alunosInadimplentes: z.number().int().default(0),
  faturamentoMensal: z.number().default(0),
  crescimentoAnual: z.array(GrowthDataSchema).default([]),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const V_FaturamentoMensalSchema = z.object({
  Mes: z.string(),
  TotalRecebido: z.number(),
  QtdPagamentos: z.coerce.number().int(),
});

export const V_FrequenciaAlunosSchema = z.object({
  nomeCompleto: z.string(),
  TotalTreinos: z.coerce.number().int(),
});
