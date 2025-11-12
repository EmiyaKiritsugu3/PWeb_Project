
'use server';
/**
 * @fileOverview Flow de IA para gerar feedback sobre treinos.
 *
 * - generateWorkoutFeedback - Função que gera feedback motivacional e dicas.
 * - WorkoutFeedbackInput - O tipo de entrada para a função.
 * - WorkoutFeedbackOutput - O tipo de retorno para a função.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

// Schema de Entrada
const WorkoutFeedbackInputSchema = z.object({
  goal: z.string().describe('O objetivo principal do treino do aluno (ex: Hipertrofia, Perda de Peso).'),
  completedExercises: z.array(z.string()).describe('Uma lista dos nomes dos exercícios que o aluno completou.'),
  totalExercises: z.number().describe('O número total de exercícios que estavam no plano de treino.'),
});
export type WorkoutFeedbackInput = z.infer<typeof WorkoutFeedbackInputSchema>;

// Schema de Saída
const WorkoutFeedbackOutputSchema = z.object({
  title: z.string().describe('Um título curto e motivacional para o feedback (ex: "Mandou bem!", "Impressionante!").'),
  message: z.string().describe('Uma mensagem de feedback (2-3 frases). Comece com um reforço positivo sobre o esforço. Depois, forneça uma dica prática e acionável relacionada ao objetivo do aluno para a próxima sessão ou para o dia a dia. Seja criativo e evite mensagens genéricas.'),
});
export type WorkoutFeedbackOutput = z.infer<typeof WorkoutFeedbackOutputSchema>;


// Função exportada que o frontend irá chamar
export async function generateWorkoutFeedback(input: WorkoutFeedbackInput): Promise<WorkoutFeedbackOutput> {
  return workoutFeedbackFlow(input);
}

// Definição do Prompt para a IA
const feedbackPrompt = ai.definePrompt({
  name: 'workoutFeedbackPrompt',
  model: googleAI.model('gemini-pro'),
  input: { schema: WorkoutFeedbackInputSchema },
  output: { schema: WorkoutFeedbackOutputSchema },
  prompt: `
    Você é um personal trainer de elite, especialista em motivação e ciência do esporte.
    Sua tarefa é fornecer um feedback rápido, positivo e útil para um aluno que acabou de finalizar seu treino.
    
    Seja uma figura de autoridade, mas amigável e encorajador. Evite clichês e mensagens genéricas como "continue assim".

    Aqui estão os dados do treino:
    - Objetivo Principal: {{{goal}}}
    - Total de Exercícios no Plano: {{{totalExercises}}}
    - Exercícios Concluídos: 
      {{#each completedExercises}}
      - {{{this}}}
      {{else}}
        Nenhum exercício concluído.
      {{/each}}

    Com base nisso, gere uma resposta seguindo o formato de saída.
    
    - No título, seja vibrante e positivo.
    - Na mensagem:
      1. Comece reconhecendo o esforço. Se o aluno completou todos os exercícios, elogie a disciplina e a dedicação total. Se completou a maioria, elogie o ótimo progresso e a consistência. Se completou poucos, elogie por ter começado e o incentive a não desistir, lembrando que cada passo conta.
      2. Em seguida, dê UMA dica prática e específica relacionada ao objetivo '{{{goal}}}'. Por exemplo, se o objetivo for 'Hipertrofia', sugira algo sobre a importância do descanso para a reconstrução muscular ou uma dica de proteína pós-treino. Se for 'Perda de Peso', sugira algo sobre hidratação ou um lanche pós-treino leve e nutritivo.
  `,
});

// Definição do Flow
const workoutFeedbackFlow = ai.defineFlow(
  {
    name: 'workoutFeedbackFlow',
    inputSchema: WorkoutFeedbackInputSchema,
    outputSchema: WorkoutFeedbackOutputSchema,
  },
  async (input) => {
    // Se nenhum exercício foi feito, podemos retornar uma mensagem padrão sem chamar a IA.
    if (input.completedExercises.length === 0) {
        return {
            title: "O primeiro passo é o mais importante!",
            message: "Notamos que você não marcou nenhum exercício hoje. Lembre-se que consistência é a chave! Que tal tentar fazer pelo menos um ou dois amanhã? Estamos aqui para te apoiar!"
        }
    }
    
    const { output } = await feedbackPrompt(input);
    return output!;
  }
);
