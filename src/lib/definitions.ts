
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
  id?: string;
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
  observacoes: string;
};

export type Treino = {
  id: string;
  alunoId: string;
  instrutorId: string;
  objetivo: string;
  dataCriacao: string;
  ativo: boolean;
  exercicios: Exercicio[];
};
