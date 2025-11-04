
import type { Aluno, Plano, Treino, Exercicio } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const ALUNOS: Omit<Aluno, 'biometriaHash'>[] = [
  {
    id: '1',
    nomeCompleto: 'Ana Silva',
    cpf: '111.222.333-44',
    email: 'ana.silva@example.com',
    telefone: '(11) 98765-4321',
    dataNascimento: '1995-03-15',
    dataCadastro: '2023-01-10',
    fotoUrl: findImage('avatar-1'),
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
    fotoUrl: findImage('avatar-2'),
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
    fotoUrl: findImage('avatar-3'),
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
    fotoUrl: findImage('avatar-4'),
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
    fotoUrl: findImage('avatar-5'),
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
    fotoUrl: findImage('avatar-6'),
    statusMatricula: 'ATIVA',
  },
];

export const PLANOS: Plano[] = [
  { id: '1', nome: 'Plano Mensal', preco: 120, duracaoDias: 30 },
  { id: '2', nome: 'Plano Trimestral', preco: 330, duracaoDias: 90 },
  { id: '3', nome: 'Plano Semestral', preco: 600, duracaoDias: 180 },
  { id: '4', nome: 'Plano Anual', preco: 1080, duracaoDias: 365 },
];

type ExercicioData = {
    nomeExercicio: string;
    gifUrl?: string;
}

const createUrl = (text: string) => `https://placehold.co/400x400.gif/EBF5FF/1E40AF?text=${encodeURIComponent(text)}`

export const EXERCICIOS_POR_GRUPO: { grupo: string; exercicios: ExercicioData[] }[] = [
  {
    grupo: 'Peito',
    exercicios: [
      { nomeExercicio: 'Supino Reto com Barra', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2016/06/supino-reto.gif' },
      { nomeExercicio: 'Supino Reto com Halteres', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/02/supino-reto-com-halteres.gif' },
      { nomeExercicio: 'Supino Inclinado com Barra', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2016/06/supino-inclinado.gif' },
      { nomeExercicio: 'Supino Inclinado com Halteres', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/02/supino-inclinado-com-halteres.gif' },
      { nomeExercicio: 'Supino Declinado com Barra', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/02/supino-declinado-com-barra.gif' },
      { nomeExercicio: 'Crucifixo Reto com Halteres' },
      { nomeExercicio: 'Crucifixo Inclinado com Halteres' },
      { nomeExercicio: 'Peck Deck (Voador)', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/04/peck-deck.gif' },
      { nomeExercicio: 'Flexão de Braço' },
      { nomeExercicio: 'Cross Over Polia Alta', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/02/cross-over.gif' },
      { nomeExercicio: 'Cross Over Polia Baixa' },
    ]
  },
  {
    grupo: 'Costas',
    exercicios: [
      { nomeExercicio: 'Levantamento Terra', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/11/levantamento-terra-min.gif' },
      { nomeExercicio: 'Barra Fixa (Pull-up)' },
      { nomeExercicio: 'Puxada Frontal com Polia' },
      { nomeExercicio: 'Puxada Triângulo' },
      { nomeExercicio: 'Remada Curvada com Barra', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/remada-curvada.gif' },
      { nomeExercicio: 'Remada Cavalinho' },
      { nomeExercicio: 'Remada Unilateral com Halter (Serrote)' },
      { nomeExercicio: 'Remada Sentada na Máquina' },
      { nomeExercicio: 'Pulldown com Corda' },
      { nomeExercicio: 'Hiperextensão Lombar (Banco Romano)' },
    ]
  },
  {
    grupo: 'Pernas (Quadríceps e Glúteos)',
    exercicios: [
      { nomeExercicio: 'Agachamento Livre', gifUrl: 'https://i.imgur.com/gI2t3b4.gif' },
      { nomeExercicio: 'Agachamento Smith' },
      { nomeExercicio: 'Agachamento Hack' },
      { nomeExercicio: 'Leg Press 45°' },
      { nomeExercicio: 'Leg Press Horizontal' },
      { nomeExercicio: 'Cadeira Extensora', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/cadeira-extensora.gif' },
      { nomeExercicio: 'Afundo (Passada)' },
      { nomeExercicio: 'Elevação Pélvica (Hip Thrust)' },
      { nomeExercicio: 'Cadeira Abdutora' },
    ]
  },
  {
    grupo: 'Pernas (Posterior e Glúteos)',
    exercicios: [
      { nomeExercicio: 'Stiff com Barra', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/stiff.gif' },
      { nomeExercicio: 'Stiff com Halteres' },
      { nomeExercicio: 'Mesa Flexora' },
      { nomeExercicio: 'Cadeira Flexora' },
      { nomeExercicio: 'Levantamento Terra Romeno' },
      { nomeExercicio: 'Bom Dia (Good Morning)' },
    ]
  },
  {
    grupo: 'Panturrilhas',
    exercicios: [
      { nomeExercicio: 'Panturrilha em Pé na Máquina (Gêmeos)' },
      { nomeExercicio: 'Panturrilha Sentado (Sóleo)' },
      { nomeExercicio: 'Panturrilha no Leg Press' },
    ]
  },
  {
    grupo: 'Ombros',
    exercicios: [
      { nomeExercicio: 'Desenvolvimento Militar com Barra' },
      { nomeExercicio: 'Desenvolvimento com Halteres', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/desenvolvimento-com-halteres.gif' },
      { nomeExercicio: 'Elevação Lateral com Halteres', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/elevacao-lateral.gif' },
      { nomeExercicio: 'Elevação Frontal com Halteres' },
      { nomeExercicio: 'Elevação Lateral na Polia' },
      { nomeExercicio: 'Crucifixo Inverso na Polia' },
      { nomeExercicio: 'Face Pull' },
      { nomeExercicio: 'Remada Alta' },
    ]
  },
  {
    grupo: 'Trapézio',
    exercicios: [
        { nomeExercicio: 'Encolhimento com Barra' },
        { nomeExercicio: 'Encolhimento com Halteres' },
    ]
  },
  {
    grupo: 'Bíceps',
    exercicios: [
      { nomeExercicio: 'Rosca Direta com Barra', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/rosca-direta-com-barra.gif' },
      { nomeExercicio: 'Rosca Alternada com Halteres' },
      { nomeExercicio: 'Rosca Scott com Barra W' },
      { nomeExercicio: 'Rosca Concentrada' },
      { nomeExercicio: 'Rosca Martelo' },
      { nomeExercicio: 'Rosca na Polia Alta' },
    ]
  },
  {
    grupo: 'Tríceps',
    exercicios: [
      { nomeExercicio: 'Tríceps Pulley com Barra' },
      { nomeExercicio: 'Tríceps Pulley com Corda' },
      { nomeExercicio: 'Tríceps Testa com Barra' },
      { nomeExercicio: 'Tríceps Francês com Halter' },
      { nomeExercicio: 'Mergulho no Banco' },
      { nomeExercicio: 'Supino Fechado' },
    ]
  },
  {
    grupo: 'Abdômen',
    exercicios: [
      { nomeExercicio: 'Abdominal Supra (Crunch)' },
      { nomeExercicio: 'Abdominal Infra (Elevação de Pernas)' },
      { nomeExercicio: 'Prancha Isométrica' },
      { nomeExercicio: 'Abdominal na Roda (Ab Wheel)' },
      { nomeExercicio: 'Abdominal Oblíquo (Giro Russo)' },
      { nomeExercicio: 'Abdominal na Polia Alta' },
    ]
  }
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
            { id: 'ex1', nomeExercicio: 'Supino Reto com Barra', series: 4, repeticoes: '8-10', observacoes: 'Controlar a descida.', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2016/06/supino-reto.gif' },
            { id: 'ex2', nomeExercicio: 'Remada Curvada com Barra', series: 4, repeticoes: '8-10', observacoes: 'Manter a coluna reta.', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/remada-curvada.gif' },
            { id: 'ex3', nomeExercicio: 'Desenvolvimento com Halteres', series: 3, repeticoes: '10-12', observacoes: '', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/desenvolvimento-com-halteres.gif' },
            { id: 'ex4', nomeExercicio: 'Rosca Direta com Barra', series: 3, repeticoes: '12-15', observacoes: 'Evitar balançar o corpo.', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2021/04/rosca-direta-com-barra.gif' },
            { id: 'ex5', nomeExercicio: 'Tríceps Pulley com Corda', series: 3, repeticoes: '12-15', observacoes: 'Estender completamente os cotovelos.' },
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
             { id: 'ex6', nomeExercicio: 'Agachamento Livre', series: 5, repeticoes: '15-20', observacoes: 'Foco na amplitude.', gifUrl: 'https://i.imgur.com/gI2t3b4.gif' },
             { id: 'ex7', nomeExercicio: 'Levantamento Terra', series: 3, repeticoes: '10', observacoes: 'Cuidado com a lombar.', gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/11/levantamento-terra-min.gif' },
             { id: 'ex8', nomeExercicio: 'Leg Press 45°', series: 4, repeticoes: '15', observacoes: 'Não travar os joelhos.' },
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
             { id: 'ex9', nomeExercicio: 'Agachamento Livre', series: 4, repeticoes: '8-10', observacoes: '', gifUrl: 'https://i.imgur.com/gI2t3b4.gif' },
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

    
