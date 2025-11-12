
import { z } from 'zod';

const ExercicioGeradoSchema = z.object({
  nomeExercicio: z.string().describe("O nome exato do exercício como fornecido na lista de exercícios disponíveis."),
  series: z.number().describe("O número de séries para este exercício."),
  repeticoes: z.string().describe("A faixa de repetições (ex: '8-12', '15-20')."),
  observacoes: z.string().describe("Observações curtas e úteis para o aluno (ex: 'Controlar a descida', 'Não travar os joelhos'). Deixe em branco se não houver observação especial."),
});

export const WorkoutGeneratorInputSchema = z.object({
  objetivo: z.enum(['Hipertrofia', 'Perda de Peso', 'Força']),
  nivelExperiencia: z.enum(['Iniciante', 'Intermediário', 'Avançado']),
  diasPorSemana: z.number().min(1).max(7),
  observacoesAdicionais: z.string().optional().describe("Qualquer observação adicional do instrutor, como lesões pré-existentes ou preferências do aluno."),
});
export type WorkoutGeneratorInput = z.infer<typeof WorkoutGeneratorInputSchema>;


const TreinoGeradoSchema = z.object({
    nome: z.string().describe("O nome do treino (ex: Treino A, Treino B, Peito & Tríceps)."),
    objetivo: z.string().describe("O objetivo principal deste treino específico."),
    diaSugerido: z.number().min(0).max(6).describe("O dia da semana sugerido para este treino (0=Domingo, 1=Segunda, 2=Terça, ..., 6=Sábado)."),
    exercicios: z.array(ExercicioGeradoSchema),
});

export const WorkoutGeneratorOutputSchema = z.object({
  planName: z.string().describe("Um nome geral para o plano de treino semanal."),
  workouts: z.array(TreinoGeradoSchema),
});
export type WorkoutGeneratorOutput = z.infer<typeof WorkoutGeneratorOutputSchema>;
