
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
    Sua tarefa é criar um plano de treino OTIMIZADO para UM DIA, baseado nas especificações do aluno e usando APENAS os exercícios da lista fornecida.

    **Especificações do Aluno:**
    - Objetivo Principal: {{{objetivo}}}
    - Nível de Experiência: {{{nivelExperiencia}}}
    - Dias de Treino por Semana: {{{diasPorSemana}}}
    {{#if observacoesAdicionais}}- Observações Importantes: {{{observacoesAdicionais}}}{{/if}}

    **Lista de Exercícios Disponíveis:**
    ${exerciciosDisponiveisString}

    **Suas Diretrizes:**
    1.  **Seleção de Exercícios:** Escolha os exercícios MAIS EFICAZES da lista para o objetivo e nível do aluno. Não invente exercícios.
    2.  **Estrutura do Treino:**
        - Se o treino for para 'Hipertrofia' ou 'Força', crie um treino focado em um ou dois grupos musculares (ex: Peito e Tríceps, Costas e Bíceps, ou só Pernas).
        - Se for 'Perda de Peso', crie um treino "Full Body", combinando exercícios compostos de diferentes grupos (ex: Agachamento, Supino, Remada).
        - Para 'Iniciante', selecione de 4 a 5 exercícios, priorizando máquinas e movimentos básicos.
        - Para 'Intermediário', selecione de 5 a 7 exercícios, incluindo pesos livres.
        - Para 'Avançado', selecione de 6 a 8 exercícios, com foco em exercícios compostos e variações complexas.
    3.  **Séries e Repetições:**
        - **Hipertrofia:** 3-4 séries, 8-12 repetições.
        - **Força:** 4-5 séries, 4-6 repetições (para exercícios principais).
        - **Perda de Peso:** 3-4 séries, 15-20 repetições.
        - Ajuste para o nível de experiência. Iniciantes podem ter menos séries.
    4.  **Observações:** Adicione dicas úteis e de segurança quando relevante.
    5.  **Formato de Saída:** Sua resposta DEVE ser um objeto JSON que corresponda EXATAMENTE ao schema de saída. Preencha o campo 'objetivo' com o objetivo fornecido e o array 'exercicios' com a sua seleção.
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
