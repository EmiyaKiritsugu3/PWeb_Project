import { z } from 'zod/v4';
export { Role } from '@prisma/client';

// --- Schemas & Tipos: Aluno ---

export const AlunoStatusEnum = z.enum(['ATIVA', 'INADIMPLENTE', 'INATIVA']);

/** Esquema Base para Aluno (Campos de entrada e comum) */
export const AlunoBaseSchema = z.object({
  nomeCompleto: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  cpf: z.string().min(11, { message: 'CPF deve ter pelo menos 11 dígitos' }),
  email: z.email({ error: 'Email inválido' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  dataNascimento: z.string().or(z.date()).optional().nullable(),
  dataCadastro: z.string().or(z.date()).optional(),
  fotoUrl: z.url().optional().nullable(),
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
  id: z.uuid({ error: 'ID inválido' }), // IDs no Supabase/Prisma são UUIDs
});

export type AlunoBase = z.infer<typeof AlunoBaseSchema>;

// --- Onboarding (first Google OAuth login) ---
// Strict CPF validation: format regex + check-digit verification. The
// placeholder `OAUTH-...` CPF minted by the removed auto-provision block
// violates this regex, so only real onboarding-submitted CPFs pass.
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

function cpfCheckDigit(value: string): boolean {
  const digits = value.replaceAll(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number(digits[10]);
}

const CEP_REGEX = /^\d{5}-\d{3}$/;
const UF_REGEX = /^[A-Z]{2}$/;

/** Esquema para o formulário de onboarding (primeiro login OAuth) */
export const OnboardingBaseSchema = z.object({
  nomeCompleto: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.email({ error: 'Email inválido' }),
  cpf: z
    .string()
    .regex(CPF_REGEX, { message: 'CPF inválido. Use o formato xxx.xxx.xxx-xx.' })
    .refine(cpfCheckDigit, { message: 'CPF inválido (dígitos verificadores não conferem).' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  dataNascimento: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Data de nascimento inválida.',
  }),
  cep: z.string().regex(CEP_REGEX, { message: 'CEP inválido. Use o formato xxxxx-xxx.' }),
  endereco: z.string().min(3, { message: 'Endereço inválido' }),
  numero: z.string().min(1, { message: 'Número é obrigatório' }),
  bairro: z.string().min(2, { message: 'Bairro inválido' }),
  cidade: z.string().min(2, { message: 'Cidade inválida' }),
  estado: z.string().regex(UF_REGEX, { message: 'UF inválida (2 letras)' }),
});

export type OnboardingBase = z.infer<typeof OnboardingBaseSchema>;
export type Aluno = z.infer<typeof AlunoSchema>;

// --- Schemas & Tipos: Treino & Exercício ---

export const ExercicioBaseSchema = z.object({
  nomeExercicio: z.string().min(2, { message: 'Nome do exercício é obrigatório' }),
  series: z.coerce.number().int().min(1, { message: 'Mínimo de 1 série' }),
  repeticoes: z.string().min(1, { message: 'Repetições obrigatórias' }),
  observacoes: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
});

export const ExercicioSchema = ExercicioBaseSchema.extend({
  id: z.uuid({ error: 'ID inválido' }),
});

export type ExercicioBase = z.infer<typeof ExercicioBaseSchema>;
export type Exercicio = z.infer<typeof ExercicioSchema>;

export const TreinoBaseSchema = z.object({
  alunoId: z.uuid({ error: 'ID do aluno inválido' }),
  // instrutorId is server-derived from session — not accepted from client
  objetivo: z.string().min(3, { message: 'Objetivo é obrigatório' }),
  dataCriacao: z.string().or(z.date()).optional(),
  /** Dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado). Null se não estiver ativo. */
  diaSemana: z.coerce.number().int().min(0).max(6).nullable(),
  exercicios: z.array(ExercicioBaseSchema).min(1, { message: 'Adicione pelo menos um exercício' }),
});

export const TreinoSchema = TreinoBaseSchema.extend({
  id: z.uuid({ error: 'ID inválido' }),
  instrutorId: z.uuid().optional().nullable(),
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
  id: z.uuid({ error: 'ID inválido' }),
});

export type SerieExecutadaBase = z.infer<typeof SerieExecutadaBaseSchema>;
export type SerieExecutada = z.infer<typeof SerieExecutadaSchema>;

export const HistoricoTreinoBaseSchema = z.object({
  alunoId: z.uuid({ error: 'ID do aluno inválido' }),
  treinoId: z.uuid({ error: 'ID do treino inválido' }),
  dataExecucao: z.string().or(z.date()),
  duracaoMinutos: z.coerce.number().int().min(1),
  exercicios: z.array(
    z.object({
      exercicioId: z.uuid({ error: 'ID do exercício inválido' }),
      nomeExercicio: z.string(),
      seriesExecutadas: z.array(SerieExecutadaBaseSchema),
    })
  ),
});

export const HistoricoTreinoSchema = HistoricoTreinoBaseSchema.extend({
  id: z.uuid({ error: 'ID inválido' }),
  exercicios: z.array(
    z.object({
      exercicioId: z.uuid(),
      nomeExercicio: z.string(),
      seriesExecutadas: z.array(SerieExecutadaSchema),
    })
  ),
});

export type HistoricoTreinoBase = z.infer<typeof HistoricoTreinoBaseSchema>;
export type HistoricoTreino = z.infer<typeof HistoricoTreinoSchema>;

// --- Schemas & Tipos: Financeiro ---

export const PlanoBaseSchema = z.object({
  nome: z.string().min(2, { message: 'Nome do plano é obrigatório' }),
  preco: z.coerce.number().min(0, { message: 'Preço inválido' }),
  duracaoDias: z.coerce.number().int().positive({ message: 'Duração deve ser positiva' }),
});

export const PlanoSchema = PlanoBaseSchema.extend({
  id: z.uuid({ error: 'ID inválido' }),
});

export type PlanoBase = z.infer<typeof PlanoBaseSchema>;
export type Plano = z.infer<typeof PlanoSchema>;

export const MatriculaBaseSchema = z.object({
  alunoId: z.uuid({ error: 'ID do aluno inválido' }),
  planoId: z.uuid({ error: 'ID do plano inválido' }),
  dataInicio: z.string().or(z.date()),
  dataVencimento: z.string().or(z.date()),
  status: z.enum(['ATIVA', 'VENCIDA']).default('ATIVA'),
});

export const MatriculaSchema = MatriculaBaseSchema.extend({
  id: z.uuid({ error: 'ID inválido' }),
});

export type MatriculaBase = z.infer<typeof MatriculaBaseSchema>;
export type Matricula = z.infer<typeof MatriculaSchema>;

export const PagamentoBaseSchema = z.object({
  matriculaId: z.uuid({ error: 'ID da matrícula inválido' }),
  alunoId: z.uuid({ error: 'ID do aluno inválido' }),
  valor: z.coerce.number().min(0),
  dataPagamento: z.string().or(z.date()),
  metodo: z.enum(['PIX', 'Dinheiro', 'Cartão']),
});

export const PagamentoSchema = PagamentoBaseSchema.extend({
  id: z.uuid({ error: 'ID inválido' }),
});

export type PagamentoBase = z.infer<typeof PagamentoBaseSchema>;
export type Pagamento = z.infer<typeof PagamentoSchema>;

// --- Schemas & Tipos: Dashboard & Views ---

export const MonthTotalSchema = z.object({
  mes: z.string(),
  total: z.number(),
});

export type MonthTotal = z.infer<typeof MonthTotalSchema>;

export const PlanTotalSchema = z.object({
  plano: z.string(),
  total: z.number(),
});

export type PlanTotal = z.infer<typeof PlanTotalSchema>;

export const DashboardDeltasSchema = z.object({
  alunos: z.number(),
  receita: z.number(),
  inadimplentes: z.number(),
  novos: z.number(),
});

export type DashboardDeltas = z.infer<typeof DashboardDeltasSchema>;

export const DashboardStatsSchema = z
  .object({
    totalAlunos: z.number().int().default(0),
    matriculasAtivas: z.number().int().default(0),
    alunosInadimplentes: z.number().int().default(0),
    faturamentoMensal: z.number().default(0),
    matriculasPorMes: z.array(MonthTotalSchema).default([]),
    receitaPorMes: z.array(MonthTotalSchema).default([]),
    matriculasPorPlano: z.array(PlanTotalSchema).default([]),
    deltas: DashboardDeltasSchema.default({ alunos: 0, receita: 0, inadimplentes: 0, novos: 0 }),
  })
  .strict();

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
