import type { Aluno, Plano, Treino, Exercicio } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const ALUNOS: Aluno[] = [
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

export const EXERCICIOS_BASE: Pick<Exercicio, 'nomeExercicio'>[] = [
    { nomeExercicio: 'Supino Reto com Barra' },
    { nomeExercicio: 'Agachamento Livre' },
    { nomeExercicio: 'Levantamento Terra' },
    { nomeExercicio: 'Remada Curvada' },
    { nomeExercicio: 'Desenvolvimento Militar' },
    { nomeExercicio: 'Rosca Direta' },
    { nomeExercicio: 'Tríceps Pulley' },
    { nomeExercicio: 'Leg Press 45°' },
    { nomeExercicio: 'Puxada Frontal' },
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
        { mes: "Set", alunos: 145 },
        { mes: "Out", alunos: 150 },
        { mes: "Nov", alunos: 155 },
        { mes: "Dez", alunos: 157 },
    ]
}
