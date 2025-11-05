
import type { Aluno, Plano, Treino, Exercicio } from './definitions';

export const ALUNOS: Omit<Aluno, 'biometriaHash'>[] = [
  {
    id: '1',
    nomeCompleto: 'Ana Silva',
    cpf: '111.222.333-44',
    email: 'ana.silva@example.com',
    telefone: '(11) 98765-4321',
    dataNascimento: '1995-03-15',
    dataCadastro: '2023-01-10',
    fotoUrl: 'https://picsum.photos/seed/avatar-1/100/100',
    statusMatricula: 'ATIVA',
  },
  {
    id: '2',
    nomeCompleto: 'Bruno Costa',
    cpf: '222.333.444-55',
    email: 'bruno.costa@example.com',
    telefone: '(21) 91234-5678',
    dataNascimento: '1988-07-22',
    dataCadastro: '2022-11-20',
    fotoUrl: 'https://picsum.photos/seed/avatar-2/100/100',
    statusMatricula: 'INADIMPLENTE',
  },
  {
    id: '3',
    nomeCompleto: 'Carla Dias',
    cpf: '333.444.555-66',
    email: 'carla.dias@example.com',
    telefone: '(31) 95555-4444',
    dataNascimento: '2001-11-30',
    dataCadastro: '2023-05-01',
    fotoUrl: 'https://picsum.photos/seed/avatar-3/100/100',
    statusMatricula: 'ATIVA',
  },
  {
    id: '4',
    nomeCompleto: 'Daniel Martins',
    cpf: '444.555.666-77',
    email: 'daniel.martins@example.com',
    telefone: '(41) 98888-7777',
    dataNascimento: '1999-01-05',
    dataCadastro: '2023-02-15',
    fotoUrl: 'https://picsum.photos/seed/avatar-4/100/100',
    statusMatricula: 'INATIVA',
  },
  {
    id: '5',
    nomeCompleto: 'Eduarda Ferreira',
    cpf: '555.666.777-88',
    email: 'eduarda.ferreira@example.com',
    telefone: '(51) 97777-6666',
    dataNascimento: '1992-09-12',
    dataCadastro: '2021-08-30',
    fotoUrl: 'https://picsum.photos/seed/avatar-5/100/100',
    statusMatricula: 'ATIVA',
  },
   {
    id: '6',
    nomeCompleto: 'Fábio Souza',
    cpf: '666.777.888-99',
    email: 'fabio.souza@example.com',
    telefone: '(61) 96666-5555',
    dataNascimento: '2003-04-25',
    dataCadastro: '2024-01-05',
    fotoUrl: 'https://picsum.photos/seed/avatar-6/100/100',
    statusMatricula: 'ATIVA',
  },
];

export const PLANOS: Plano[] = [
  { id: '1', nome: 'Plano Mensal', preco: 120, duracaoDias: 30 },
  { id: '2', nome: 'Plano Trimestral', preco: 330, duracaoDias: 90 },
  { id: '3', nome: 'Plano Semestral', preco: 600, duracaoDias: 180 },
  { id: '4', nome: 'Plano Anual', preco: 1080, duracaoDias: 365 },
];

type ExercicioData = Omit<Exercicio, 'id' | 'series' | 'repeticoes' | 'observacoes'>;

export const EXERCICIOS_POR_GRUPO: { grupo: string; exercicios: ExercicioData[] }[] = [
  {
    grupo: 'Peito',
    exercicios: [
      { nomeExercicio: 'Supino Reto com Barra', descricao: 'Deite-se em um banco reto, segure a barra com as mãos um pouco mais afastadas que a largura dos ombros. Desça a barra até tocar o peito e empurre de volta à posição inicial.' },
      { nomeExercicio: 'Supino Reto com Halteres', descricao: 'Deite-se em um banco reto com um halter em cada mão. Desça os halteres até a altura do peito e empurre-os para cima, quase se tocando no topo.' },
      { nomeExercicio: 'Supino Inclinado com Barra', descricao: 'Similar ao supino reto, mas em um banco inclinado a 45 graus. Foco na parte superior do peitoral.' },
      { nomeExercicio: 'Crucifixo Reto com Halteres', descricao: 'Deite-se em um banco reto com halteres. Com os cotovelos levemente flexionados, abra os braços até sentir o peitoral alongar e retorne à posição inicial.' },
      { nomeExercicio: 'Peck Deck (Voador)', descricao: 'Sente-se na máquina com as costas apoiadas. Segure os pegadores e junte-os na frente do corpo, contraindo o peitoral.' },
    ]
  },
  {
    grupo: 'Costas',
    exercicios: [
      { nomeExercicio: 'Levantamento Terra', descricao: 'Com a barra no chão, agache-se com a coluna reta e segure a barra. Levante-se estendendo as pernas e o quadril. Mantenha a barra próxima ao corpo.' },
      { nomeExercicio: 'Barra Fixa (Pull-up)', descricao: 'Segure a barra com as mãos em pronação (palmas para frente). Puxe o corpo para cima até o queixo passar da barra.' },
      { nomeExercicio: 'Remada Curvada com Barra', descricao: 'Incline o tronco para frente, mantendo a coluna reta. Puxe a barra em direção ao abdômen.' },
      { nomeExercicio: 'Remada Unilateral com Halter (Serrote)', descricao: 'Apoie um joelho e uma mão em um banco. Com a outra mão, puxe um halter para cima, mantendo o cotovelo próximo ao corpo.' },
    ]
  },
  {
    grupo: 'Pernas (Quadríceps e Glúteos)',
    exercicios: [
      { nomeExercicio: 'Agachamento Livre', descricao: 'Com a barra nos ombros, agache como se fosse sentar em uma cadeira, mantendo a coluna reta e os joelhos alinhados com os pés. Desça até os quadris ficarem paralelos ao chão ou mais baixo.' },
      { nomeExercicio: 'Leg Press 45°', descricao: 'Sente-se na máquina e coloque os pés na plataforma. Empurre a plataforma para cima e controle a descida.' },
      { nomeExercicio: 'Cadeira Extensora', descricao: 'Sente-se na máquina e posicione os tornozelos atrás do rolo. Estenda as pernas para cima, contraindo o quadríceps.' },
      { nomeExercicio: 'Afundo (Passada)', descricao: 'Dê um passo à frente e flexione ambos os joelhos, descendo o corpo até que o joelho de trás quase toque o chão. Retorne e alterne as pernas.' },
      { nomeExercicio: 'Elevação Pélvica (Hip Thrust)', descricao: 'Apoie as costas em um banco e coloque uma barra sobre o quadril. Eleve o quadril, contraindo os glúteos, até o corpo formar uma linha reta dos ombros aos joelhos.' },
    ]
  },
  {
    grupo: 'Pernas (Posterior e Glúteos)',
    exercicios: [
      { nomeExercicio: 'Stiff com Barra', descricao: 'Segurando uma barra, desça o tronco com as pernas quase retas, sentindo alongar a parte de trás das coxas. Mantenha a coluna reta.' },
      { nomeExercicio: 'Mesa Flexora', descricao: 'Deite-se de bruços na máquina e posicione os tornozelos sob o rolo. Flexione os joelhos, trazendo o rolo em direção aos glúteos.' },
      { nomeExercicio: 'Cadeira Flexora', descricao: 'Sente-se na máquina e prenda as pernas. Flexione os joelhos para baixo, contraindo os músculos posteriores da coxa.' },
      { nomeExercicio: 'Bom Dia (Good Morning)', descricao: 'Com uma barra nos ombros (como no agachamento), incline o tronco para frente, mantendo a coluna reta e os joelhos levemente flexionados. Desça até o tronco ficar quase paralelo ao chão e retorne.' },
    ]
  },
  {
    grupo: 'Ombros',
    exercicios: [
      { nomeExercicio: 'Desenvolvimento Militar com Barra', descricao: 'Em pé ou sentado, segure a barra na altura dos ombros e empurre-a para cima da cabeça, estendendo completamente os cotovelos.' },
      { nomeExercicio: 'Elevação Lateral com Halteres', descricao: 'Em pé, com um halter em cada mão, eleve os braços para os lados até a altura dos ombros, com os cotovelos levemente flexionados.' },
      { nomeExercicio: 'Face Pull', descricao: 'Usando a polia alta com uma corda, puxe a corda em direção ao seu rosto, afastando as mãos e contraindo a parte de trás dos ombros.' },
    ]
  },
   {
    grupo: 'Bíceps',
    exercicios: [
      { nomeExercicio: 'Rosca Direta com Barra', descricao: 'Segure a barra com as palmas das mãos para cima (supinação). Flexione os cotovelos, trazendo a barra em direção aos ombros.' },
      { nomeExercicio: 'Rosca Martelo', descricao: 'Segure os halteres com as palmas das mãos voltadas uma para a outra (pegada neutra). Flexione os cotovelos.' },
    ]
  },
  {
    grupo: 'Tríceps',
    exercicios: [
      { nomeExercicio: 'Tríceps Pulley com Barra', descricao: 'Na polia alta, segure a barra e empurre-a para baixo até estender completamente os cotovelos. Mantenha os cotovelos fixos ao lado do corpo.' },
      { nomeExercicio: 'Tríceps Testa com Barra', descricao: 'Deitado, segure a barra acima da cabeça. Desça a barra em direção à testa, flexionando os cotovelos, e depois estenda de volta.' },
      { nomeExercicio: 'Tríceps Francês com Halter', descricao: 'Sentado ou em pé, segure um halter com as duas mãos acima da cabeça. Desça o halter por trás da cabeça, flexionando os cotovelos, e retorne.' },
    ]
  },
];


export const TREINOS: Treino[] = [
    {
        id: 't1',
        alunoId: '1', // Ana Silva
        instrutorId: 'func1',
        objetivo: 'Hipertrofia - Membros Superiores',
        dataCriacao: '2024-01-15',
        ativo: true,
        exercicios: [
            { id: 'ex1', nomeExercicio: 'Supino Reto com Barra', series: 4, repeticoes: '8-10', observacoes: 'Controlar a descida.', descricao: 'Deite-se em um banco reto, segure a barra com as mãos um pouco mais afastadas que a largura dos ombros. Desça a barra até tocar o peito e empurre de volta à posição inicial.' },
            { id: 'ex2', nomeExercicio: 'Remada Curvada com Barra', series: 4, repeticoes: '8-10', observacoes: 'Manter a coluna reta.', descricao: 'Incline o tronco para frente, mantendo a coluna reta. Puxe a barra em direção ao abdômen.' },
            { id: 'ex3', nomeExercicio: 'Desenvolvimento Militar com Barra', series: 3, repeticoes: '10-12', observacoes: '', descricao: 'Em pé ou sentado, segure a barra na altura dos ombros e empurre-a para cima da cabeça, estendendo completamente os cotovelos.' },
            { id: 'ex4', nomeExercicio: 'Rosca Direta com Barra', series: 3, repeticoes: '12-15', observacoes: 'Evitar balançar o corpo.', descricao: 'Segure a barra com as palmas das mãos para cima (supinação). Flexione os cotovelos, trazendo a barra em direção aos ombros.' },
            { id: 'ex5', nomeExercicio: 'Tríceps Pulley com Barra', series: 3, repeticoes: '12-15', observacoes: 'Estender completamente os cotovelos.', descricao: 'Na polia alta, segure a barra e empurre-a para baixo até estender completamente os cotovelos. Mantenha os cotovelos fixos ao lado do corpo.' },
        ]
    },
    {
        id: 't2',
        alunoId: '2', // Bruno Costa
        instrutorId: 'func1',
        objetivo: 'Perda de Peso',
        dataCriacao: '2024-01-20',
        ativo: true,
        exercicios: [
             { id: 'ex6', nomeExercicio: 'Agachamento Livre', series: 5, repeticoes: '15-20', observacoes: 'Foco na amplitude.', descricao: 'Com a barra nos ombros, agache como se fosse sentar em uma cadeira, mantendo a coluna reta e os joelhos alinhados com os pés. Desça até os quadris ficarem paralelos ao chão ou mais baixo.' },
             { id: 'ex7', nomeExercicio: 'Levantamento Terra', series: 3, repeticoes: '10', observacoes: 'Cuidado com a lombar.', descricao: 'Com a barra no chão, agache-se com a coluna reta e segure a barra. Levante-se estendendo as pernas e o quadril. Mantenha a barra próxima ao corpo.' },
             { id: 'ex8', nomeExercicio: 'Leg Press 45°', series: 4, repeticoes: '15', observacoes: 'Não travar os joelhos.', descricao: 'Sente-se na máquina e coloque os pés na plataforma. Empurre a plataforma para cima e controle a descida.' },
        ]
    },
    {
        id: 't3',
        alunoId: '1', // Ana Silva
        instrutorId: 'func1',
        objetivo: 'Hipertrofia - Membros Inferiores',
        dataCriacao: '2023-11-15',
        ativo: false, // Treino antigo
        exercicios: [
             { id: 'ex9', nomeExercicio: 'Agachamento Livre', series: 4, repeticoes: '8-10', observacoes: '', descricao: 'Com a barra nos ombros, agache como se fosse sentar em uma cadeira, mantendo a coluna reta e os joelhos alinhados com os pés. Desça até os quadris ficarem paralelos ao chão ou mais baixo.' },
        ]
    }
];

export const DADOS_DASHBOARD = {
    totalAlunos: 157,
    matriculasAtivas: 123,
    alunosInadimplentes: 14,
    faturamentoMensal: 14760,
    crescimentoAnual: [
        { mes: "Jan", alunos: 80 },
        { mes: "Fev", alunos: 85 },
        { mes: "Mar", alunos: 95 },
        { mes: "Abr", alunos: 110 },
        { mes: "Mai", alunos: 118 },
        { mes: "Jun", alunos: 123 },
        { mes: "Jul", alunos: 130 },
        { mes: "Ago", alunos: 138 },
        { mesS: "Set", alunos: 145 },
        { mes: "Out", alunos: 150 },
        { mes: "Nov", alunos: 155 },
        { mes: "Dez", alunos: 157 },
    ]
}

    
