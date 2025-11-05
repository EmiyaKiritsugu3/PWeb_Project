
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

export const WorkoutGeneratorOutputSchema = z.object({
  objetivo: z.string().describe("O objetivo principal do treino, para confirmação."),
  exercicios: z.array(ExercicioGeradoSchema),
});
export type WorkoutGeneratorOutput = z.infer<typeof WorkoutGeneratorOutputSchema>;
