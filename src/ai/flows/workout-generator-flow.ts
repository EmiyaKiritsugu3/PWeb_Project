
'use server';
/**
 * @fileOverview Flow de IA para gerar um plano de treino completo.
 *
 * - generateWorkoutPlan - Função que gera um plano de treino estruturado.
 */

import { ai } from '@/ai/genkit';
import { EXERCICIOS_POR_GRUPO } from '@/lib/data';
import { 
    WorkoutGeneratorInputSchema, 
    WorkoutGeneratorOutputSchema,
    type WorkoutGeneratorInput,
    type WorkoutGeneratorOutput
} from '@/ai/schemas';


// --- FUNÇÃO EXPORTADA ---

export async function generateWorkoutPlan(input: WorkoutGeneratorInput): Promise<WorkoutGeneratorOutput> {
  return workoutGeneratorFlow(input);
}


// --- LÓGICA DO FLOW ---

// Transforma a lista de exercícios disponíveis em uma string formatada para o prompt.
const exerciciosDisponiveisString = EXERCICIOS_POR_GRUPO.map(
  (grupo) => `
Grupo Muscular: ${grupo.grupo}
Exercícios:
${grupo.exercicios.map((ex) => `- ${ex.nomeExercicio}`).join('\n')}
`
).join('');


const workoutPrompt = ai.definePrompt({
  name: 'workoutGeneratorPrompt',
  input: { schema: WorkoutGeneratorInputSchema },
  output: { schema: WorkoutGeneratorOutputSchema },
  prompt: `
    Você é um personal trainer de elite, com vasta experiência em fisiologia do exercício e montagem de programas de treino.
    Sua tarefa é criar um PLANO DE TREINO SEMANAL OTIMIZADO, baseado nas especificações do aluno e usando APENAS os exercícios da lista fornecida.

    **Especificações do Aluno:**
    - Objetivo Principal: {{{objetivo}}}
    - Nível de Experiência: {{{nivelExperiencia}}}
    - Dias de Treino por Semana: {{{diasPorSemana}}}
    {{#if observacoesAdicionais}}- Observações Importantes: {{{observacoesAdicionais}}}{{/if}}

    **Lista de Exercícios Disponíveis:**
    ${exerciciosDisponiveisString}

    **Suas Diretrizes:**
    1.  **Crie um Plano Semanal:** Gere uma sequência de treinos para a semana. O número de treinos distintos deve ser apropriado para a quantidade de dias por semana.
    2.  **Estrutura da Divisão (Split):**
        - **2-3 dias/semana:** Crie um plano "Full Body" (corpo todo) ou uma divisão "A/B". Se for A/B, o aluno repetirá o A na terceira sessão. Gere 2 treinos distintos (Treino A, Treino B).
        - **4 dias/semana:** Crie uma divisão "Superior/Inferior" (Upper/Lower). Gere 2 treinos para superiores e 2 para inferiores, ou 2 treinos distintos (Treino A - Superiores, Treino B - Inferiores).
        - **5+ dias/semana:** Crie uma divisão por grupo muscular (ex: A: Peito/Tríceps, B: Costas/Bíceps, C: Pernas, D: Ombros, E: Cardio/Abdômen). Gere de 3 a 5 treinos distintos.
    3.  **Nomeie os Treinos:** Dê nomes claros para cada treino na divisão (ex: "Treino A - Peito e Tríceps", "Treino B - Costas e Bíceps").
    4.  **SUGIRA OS DIAS:** Para cada treino gerado, preencha o campo 'diaSugerido' com um número de 0 (Domingo) a 6 (Sábado). Distribua os treinos de forma lógica na semana, respeitando dias de descanso. Ex: Para uma divisão A/B de 3 dias, sugira dias 1 (Seg), 3 (Qua) e 5 (Sex). Para uma Superior/Inferior de 4 dias, sugira dias 1 (Seg), 2 (Ter), 4 (Qui), 5 (Sex).
    5.  **Seleção de Exercícios:** Escolha os exercícios MAIS EFICAZES da lista para o objetivo e nível do aluno. Não invente exercícios.
        - Para 'Iniciante', selecione de 4 a 5 exercícios por treino, priorizando máquinas e movimentos básicos.
        - Para 'Intermediário', selecione de 5 a 7 exercícios por treino, incluindo pesos livres.
        - Para 'Avançado', selecione de 6 a 8 exercícios, com foco em exercícios compostos e variações complexas.
    6.  **Séries e Repetições:**
        - **Hipertrofia:** 3-4 séries, 8-12 repetições.
        - **Força:** 4-5 séries, 4-6 repetições (para exercícios principais).
        - **Perda de Peso:** 3-4 séries, 15-20 repetições.
    7.  **Observações:** Adicione dicas úteis e de segurança quando relevante.
    8.  **Formato de Saída:** Sua resposta DEVE ser um objeto JSON que corresponda EXATAMENTE ao schema de saída. Preencha 'planName' com um nome descritivo para o plano geral (ex: "Plano de Hipertrofia - 4 dias/semana") e 'workouts' com o array de treinos que você criou.
  `,
});


const workoutGeneratorFlow = ai.defineFlow(
  {
    name: 'workoutGeneratorFlow',
    inputSchema: WorkoutGeneratorInputSchema,
    outputSchema: WorkoutGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await workoutPrompt(input);
    return output!;
  }
);
