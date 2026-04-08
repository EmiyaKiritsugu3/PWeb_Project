'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { EXERCICIOS_POR_GRUPO } from '@/lib/constants';
import {
  WorkoutGeneratorInputSchema,
  WorkoutGeneratorAIOutputSchema,
  type WorkoutGeneratorInput,
  type WorkoutGeneratorOutput,
} from '@/ai/schemas';

// Transforma a lista de exercícios disponíveis em uma string formatada para o prompt.
const exerciciosDisponiveisString = EXERCICIOS_POR_GRUPO.map(
  (grupo) => `
## Grupo Muscular: ${grupo.grupo}
Exercícios:
${grupo.exercicios.map((ex) => `- ${ex.nomeExercicio}`).join('\n')}
`
).join('');

// Cria um Set com todos os nomes de exercícios válidos para uma validação rápida.
const validExerciseNames = new Set(
  EXERCICIOS_POR_GRUPO.flatMap((g) => g.exercicios.map((ex) => ex.nomeExercicio))
);

export const streamWorkoutPlan = ai.defineFlow(
  {
    name: 'streamWorkoutPlan',
    inputSchema: WorkoutGeneratorInputSchema,
    outputSchema: WorkoutGeneratorAIOutputSchema,
    streamSchema: WorkoutGeneratorAIOutputSchema,
  },
  async (input, { sendChunk }) => {
    const promptText = `
    Você é um personal trainer de elite, especialista em fisiologia do exercício.
    Sua tarefa é criar um PLANO DE TREINO SEMANAL OTIMIZADO, baseado nas especificações do aluno, usando APENAS os exercícios da lista fornecida.

    **Especificações do Aluno:**
    - Objetivo Principal: ${input.objetivo}
    - Nível de Experiência: ${input.nivelExperiencia}
    - Dias de Treino por Semana: ${input.diasPorSemana}
    ${input.observacoesAdicionais ? `- Observações Importantes: ${input.observacoesAdicionais}` : ''}

    **Lista de Exercícios Disponíveis (Use APENAS estes):**
    ${exerciciosDisponiveisString}

    **Suas Diretrizes:**
    1.  **Estrutura da Divisão (Split):** Crie uma divisão de treinos lógica para a semana.
    2.  **Seleção de Exercícios:** Escolha os exercícios MAIS EFICAZES da lista para o objetivo e nível do aluno. Não invente exercícios.
    3.  **Séries e Repetições:** Adapte ao objetivo (Hipertrofia, Força, Perda de Peso).
    4.  **Nome do Plano e Treinos:** Crie nomes gerais e específicos.
    5.  **Dia Sugerido:** Sugira um dia da semana (0=Domingo a 6=Sábado).
    6.  **Grupo Muscular:** Use o nome exato do grupo.
    `;

    const responseStream = await ai.generateStream({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: promptText,
      output: { schema: WorkoutGeneratorAIOutputSchema },
    });

    for await (const chunk of responseStream.stream) {
      if (chunk && chunk.output) {
        sendChunk(chunk.output as WorkoutGeneratorOutput);
      }
    }

    const finalOutput = await responseStream.response;
    if (!finalOutput || !finalOutput.output) {
      throw new Error('A IA não retornou um plano de treino válido.');
    }
    return finalOutput.output as WorkoutGeneratorOutput;
  }
);

// Manter a função anterior caso o front-end precise do modo normal
export async function generateWorkoutPlan(
  input: WorkoutGeneratorInput
): Promise<WorkoutGeneratorOutput> {
  const { output } = await ai.generate({
    model: googleAI.model('gemini-2.5-flash'),
    prompt: `Você é um personal trainer de elite... (usando versão não-streaming para ${input.objetivo})`,
    output: { schema: WorkoutGeneratorAIOutputSchema },
  });
  return output as WorkoutGeneratorOutput;
}
