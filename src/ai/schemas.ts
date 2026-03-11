
import { z } from 'zod';

// =================================================================================
// INPUT SCHEMA - O que o frontend envia para a IA
// =================================================================================

export const WorkoutGeneratorInputSchema = z.object({
  objetivo: z.enum(['Hipertrofia', 'Perda de Peso', 'Força']),
  nivelExperiencia: z.enum(['Iniciante', 'Intermediário', 'Avançado']),
  diasPorSemana: z.number().min(1).max(7),
  observacoesAdicionais: z.string().optional().describe("Qualquer observação adicional do instrutor, como lesões pré-existentes ou preferências do aluno."),
});
export type WorkoutGeneratorInput = z.infer<typeof WorkoutGeneratorInputSchema>;


// =================================================================================
// AI OUTPUT SCHEMA - O formato de dados que a IA DEVE retornar.
// =================================================================================

const ExercicioGeradoAISchema = z.object({
  nomeExercicio: z.string().describe("O nome exato do exercício como fornecido na lista de exercícios disponíveis."),
  grupoMuscular: z.string().describe("O nome exato do grupo muscular ao qual este exercício pertence."),
  series: z.number().describe("O número de séries para este exercício."),
  repeticoes: z.string().describe("A faixa de repetições (ex: '8-12', '15-20')."),
  observacoes: z.string().describe("Observações curtas e úteis para o aluno (ex: 'Controlar a descida', 'Não travar os joelhos'). Deixe em branco se não houver observação especial."),
});

const TreinoGeradoAISchema = z.object({
    nome: z.string().describe("O nome do treino (ex: Treino A, Treino B, Peito & Tríceps)."),
    objetivo: z.string().describe("O objetivo principal deste treino específico."),
    diaSugerido: z.number().min(0).max(6).describe("O dia da semana sugerido para este treino (0=Domingo, 1=Segunda, ..., 6=Sábado)."),
    exercicios: z.array(ExercicioGeradoAISchema),
});

export const WorkoutGeneratorAIOutputSchema = z.object({
  planName: z.string().describe("Um nome geral para o plano de treino semanal."),
  workouts: z.array(TreinoGeradoAISchema),
});
export type WorkoutGeneratorAIOutput = z.infer<typeof WorkoutGeneratorAIOutputSchema>;


// =================================================================================
// FINAL OUTPUT SCHEMA - O formato de dados que a função principal retorna ao frontend (após validação)
// =================================================================================
// Neste caso, a estrutura é a mesma da saída da IA, mas o tipo é exportado separadamente
// para clareza de que estes são os dados validados.

export type WorkoutGeneratorOutput = WorkoutGeneratorAIOutput;
