
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
      { nomeExercicio: 'Supino Reto com Barra', gifUrl: createUrl('Supino Reto') },
      { nomeExercicio: 'Supino Reto com Halteres', gifUrl: createUrl('Supino Halteres') },
      { nomeExercicio: 'Supino Inclinado com Barra', gifUrl: createUrl('Supino Inclinado') },
      { nomeExercicio: 'Supino Inclinado com Halteres' },
      { nomeExercicio: 'Supino Declinado com Barra' },
      { nomeExercicio: 'Crucifixo Reto com Halteres' },
      { nomeExercicio: 'Crucifixo Inclinado com Halteres' },
      { nomeExercicio: 'Peck Deck (Voador)', gifUrl: createUrl('Peck Deck') },
      { nomeExercicio: 'Flexão de Braço', gifUrl: createUrl('Flexão') },
      { nomeExercicio: 'Cross Over Polia Alta', gifUrl: createUrl('Cross Over Alto') },
      { nomeExercicio: 'Cross Over Polia Baixa' },
    ]
  },
  {
    grupo: 'Costas',
    exercicios: [
      { nomeExercicio: 'Levantamento Terra', gifUrl: createUrl('Levantamento\nTerra') },
      { nomeExercicio: 'Barra Fixa (Pull-up)', gifUrl: createUrl('Barra Fixa') },
      { nomeExercicio: 'Puxada Frontal com Polia' },
      { nomeExercicio: 'Puxada Triângulo' },
      { nomeExercicio: 'Remada Curvada com Barra', gifUrl: createUrl('Remada Curvada') },
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
      { nomeExercicio: 'Agachamento Livre', gifUrl: createUrl('Agachamento') },
      { nomeExercicio: 'Agachamento Smith' },
      { nomeExercicio: 'Agachamento Hack' },
      { nomeExercicio: 'Leg Press 45°', gifUrl: createUrl('Leg Press 45') },
      { nomeExercicio: 'Leg Press Horizontal' },
      { nomeExercicio: 'Cadeira Extensora', gifUrl: createUrl('Cadeira Extensora') },
      { nomeExercicio: 'Afundo (Passada)' },
      { nomeExercicio: 'Elevação Pélvica (Hip Thrust)' },
      { nomeExercicio: 'Cadeira Abdutora' },
    ]
  },
  {
    grupo: 'Pernas (Posterior e Glúteos)',
    exercicios: [
      { nomeExercicio: 'Stiff com Barra', gifUrl: createUrl('Stiff') },
      { nomeExercicio: 'Stiff com Halteres' },
      { nomeExercicio: 'Mesa Flexora', gifUrl: createUrl('Mesa Flexora') },
      { nomeExercicio: 'Cadeira Flexora' },
      { nomeExercicio: 'Levantamento Terra Romeno' },
      { nomeExercicio: 'Bom Dia (Good Morning)', gifUrl: createUrl('Good Morning') },
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
      { nomeExercicio: 'Desenvolvimento com Halteres', gifUrl: createUrl('Desenvolvimento\nCom Halteres') },
      { nomeExercicio: 'Elevação Lateral com Halteres', gifUrl: createUrl('Elevação Lateral') },
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
      { nomeExercicio: 'Rosca Direta com Barra', gifUrl: createUrl('Rosca Direta') },
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
      { nomeExercicio: 'Tríceps Pulley com Corda', gifUrl: createUrl('Tríceps Corda') },
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
      { nomeExercicio: 'Prancha Isométrica', gifUrl: createUrl('Prancha') },
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
            { id: 'ex1', nomeExercicio: 'Supino Reto com Barra', series: 4, repeticoes: '8-10', observacoes: 'Controlar a descida.', gifUrl: createUrl('Supino Reto') },
            { id: 'ex2', nomeExercicio: 'Remada Curvada com Barra', series: 4, repeticoes: '8-10', observacoes: 'Manter a coluna reta.', gifUrl: createUrl('Remada Curvada') },
            { id: 'ex3', nomeExercicio: 'Desenvolvimento Militar com Barra', series: 3, repeticoes: '10-12', observacoes: '' },
            { id: 'ex4', nomeExercicio: 'Rosca Direta com Barra', series: 3, repeticoes: '12-15', observacoes: 'Evitar balançar o corpo.', gifUrl: createUrl('Rosca Direta') },
            { id: 'ex5', nomeExercicio: 'Tríceps Pulley com Corda', series: 3, repeticoes: '12-15', observacoes: 'Estender completamente os cotovelos.', gifUrl: createUrl('Tríceps Corda') },
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
             { id: 'ex6', nomeExercicio: 'Agachamento Livre', series: 5, repeticoes: '15-20', observacoes: 'Foco na amplitude.', gifUrl: createUrl('Agachamento') },
             { id: 'ex7', nomeExercicio: 'Levantamento Terra', series: 3, repeticoes: '10', observacoes: 'Cuidado com a lombar.', gifUrl: createUrl('Levantamento\nTerra') },
             { id: 'ex8', nomeExercicio: 'Leg Press 45°', series: 4, repeticoes: '15', observacoes: 'Não travar os joelhos.', gifUrl: createUrl('Leg Press 45') },
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
             { id: 'ex9', nomeExercicio: 'Agachamento Livre', series: 4, repeticoes: '8-10', observacoes: '', gifUrl: createUrl('Agachamento') },
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
