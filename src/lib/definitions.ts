import { z } from "zod";

// --- Schemas & Tipos: Aluno ---

export const AlunoStatusEnum = z.enum(["ATIVA", "INADIMPLENTE", "INATIVA"]);

export const AlunoSchema = z.object({
  id: z.string().optional(),
  nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(11, "CPF deve ter pelo menos 11 dígitos"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  dataNascimento: z.string().or(z.date()).optional().nullable(),
  dataCadastro: z.string().or(z.date()).optional(),
  fotoUrl: z.string().url().optional().nullable(),
  biometriaHash: z.string().optional().nullable(),
  statusMatricula: AlunoStatusEnum.default("ATIVA"),
  // Campos de Gamificação
  nivel: z.number().int().min(1).default(1),
  exp: z.number().int().min(0).default(0),
  streakDiasSeguidos: z.number().int().min(0).default(0),
  treinosNoMes: z.number().int().min(0).default(0),
  ultimoTreinoData: z.string().or(z.date()).optional().nullable(),
  xpToNextLevel: z.number().optional(),
  progressPerc: z.number().optional(),
});

export type Aluno = z.infer<typeof AlunoSchema>;

// --- Schemas & Tipos: Treino & Exercício ---

export const ExercicioSchema = z.object({
  id: z.string().optional(),
  nomeExercicio: z.string().min(2, "Nome do exercício é obrigatório"),
  series: z.coerce.number().int().min(1, "Mínimo de 1 série"),
  repeticoes: z.string().min(1, "Repetições obrigatórias"),
  observacoes: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
});

export type Exercicio = z.infer<typeof ExercicioSchema>;

export const TreinoSchema = z.object({
  id: z.string().optional(),
  alunoId: z.string(),
  instrutorId: z.string().optional(),
  objetivo: z.string().min(3, "Objetivo é obrigatório"),
  dataCriacao: z.string().or(z.date()).optional(),
  /** Dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado). Null se não estiver ativo. */
  diaSemana: z.coerce.number().int().min(0).max(6).nullable(), 
  exercicios: z.array(ExercicioSchema).min(1, "Adicione pelo menos um exercício"),
});

export type Treino = z.infer<typeof TreinoSchema>;

// --- Schemas & Tipos: Histórico & Gamificação ---

export const SerieExecutadaSchema = z.object({
  id: z.string().optional(),
  serieNumero: z.number().int().min(1),
  peso: z.coerce.number().nullable(),
  repeticoesFeitas: z.coerce.number().int().nullable(),
  concluido: z.boolean().default(false),
});

export type SerieExecutada = z.infer<typeof SerieExecutadaSchema>;

export const HistoricoTreinoSchema = z.object({
  id: z.string().optional(),
  alunoId: z.string(),
  treinoId: z.string(),
  dataExecucao: z.string().or(z.date()),
  duracaoMinutos: z.coerce.number().int().min(1),
  exercicios: z.array(z.object({
    exercicioId: z.string(),
    nomeExercicio: z.string(),
    seriesExecutadas: z.array(SerieExecutadaSchema),
  })),
});

export type HistoricoTreino = z.infer<typeof HistoricoTreinoSchema>;

// --- Schemas & Tipos: Financeiro ---

export const PlanoSchema = z.object({
  id: z.string().optional(),
  nome: z.string(),
  preco: z.coerce.number(),
  duracaoDias: z.coerce.number().int(),
});

export type Plano = z.infer<typeof PlanoSchema>;

export const MatriculaSchema = z.object({
  id: z.string().optional(),
  alunoId: z.string(),
  planoId: z.string(),
  dataInicio: z.string().or(z.date()),
  dataVencimento: z.string().or(z.date()),
  status: z.enum(["ATIVA", "VENCIDA"]).default("ATIVA"),
});

export type Matricula = z.infer<typeof MatriculaSchema>;

export const PagamentoSchema = z.object({
  id: z.string().optional(),
  matriculaId: z.string(),
  alunoId: z.string(),
  valor: z.coerce.number(),
  dataPagamento: z.string().or(z.date()),
  metodo: z.enum(["PIX", "Dinheiro", "Cartão"]),
});

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

