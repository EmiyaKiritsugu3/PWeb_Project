
export type Aluno = {
  id: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string; 
  dataCadastro: string;
  fotoUrl: string;
  biometriaHash?: string;
  statusMatricula: "ATIVA" | "INADIMPLENTE" | "INATIVA";
};

export type Plano = {
  id: string;
  nome: string;
  preco: number;
  duracaoDias: number;
};

export type Matricula = {
  id: string;
  alunoId: string;
  planoId: string;
  dataInicio: string;
  dataVencimento: string;
  status: "ATIVA" | "VENCIDA";
};

export type Pagamento = {
  id: string;
  matriculaId: string;
  alunoId: string;
  valor: number;
  dataPagamento: string;
  metodo: "PIX" | "Dinheiro" | "Cartão";
};

export type Exercicio = {
  id: string;
  nomeExercicio: string;
  series: number;
  repeticoes: string;
  observacoes?: string;
  descricao?: string;
};

export type Treino = {
  id: string;
  alunoId: string;
  instrutorId: string;
  objetivo: string;
  dataCriacao: string;
  /** Dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado). Null se não estiver ativo. */
  diaSemana: number | null; 
  exercicios: Exercicio[];
};

// --- Tipos para o Histórico de Treinos ---

/**
 * Representa uma única série de um exercício que foi executada pelo aluno.
 */
export type SerieExecutada = {
  id: string;
  serieNumero: number; // Ex: 1, 2, 3
  peso: number | null;
  repeticoesFeitas: number | null;
  concluido: boolean;
};

/**
 * Representa um registro de um treino completo executado pelo aluno em uma data específica.
 */
export type HistoricoTreino = {
  id: string;
  alunoId: string;
  treinoId: string; // Referência ao treino original
  dataExecucao: string; // ISO string
  duracaoMinutos: number;
  exercicios: {
    exercicioId: string;
    nomeExercicio: string;
    seriesExecutadas: SerieExecutada[];
  }[];
};
