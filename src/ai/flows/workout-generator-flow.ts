
'use server';
/**
 * @fileOverview Flow de IA para gerar um plano de treino completo e validado.
 *
 * - generateWorkoutPlan - Função que gera um plano de treino estruturado, valida os dados e os retorna.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { EXERCICIOS_POR_GRUPO } from '@/lib/data';
import { 
    WorkoutGeneratorInputSchema, 
    WorkoutGeneratorAIOutputSchema,
    type WorkoutGeneratorInput,
    type WorkoutGeneratorOutput
} from '@/ai/schemas';

// --- CONSTANTES E HELPERS ---

// Transforma a lista de exercícios disponíveis em uma string formatada para o prompt.
const exerciciosDisponiveisString = EXERCICIOS_POR_GRUPO.map(
  (grupo) => `
## Grupo Muscular: ${grupo.grupo}
Exercícios:
${grupo.exercicios.map((ex) => `- ${ex.nomeExercicio}`).join('\n')}
`
).join('');

// Cria um Set com todos os nomes de exercícios válidos para uma validação rápida.
const validExerciseNames = new Set(EXERCICIOS_POR_GRUPO.flatMap(g => g.exercicios.map(ex => ex.nomeExercicio)));


// --- FUNÇÃO EXPORTADA (Ponto de entrada para o Frontend) ---

/**
 * Gera um plano de treino usando IA, valida a saída e retorna um formato limpo.
 * @param input - As especificações do aluno (objetivo, nível, etc.).
 * @returns Um objeto `WorkoutGeneratorOutput` com o plano de treino validado.
 */
export async function generateWorkoutPlan(input: WorkoutGeneratorInput): Promise<WorkoutGeneratorOutput> {
  
  const { output } = await workoutGeneratorFlow(input);
  
  if (!output || !output.workouts) {
    throw new Error("A IA não retornou um plano de treino válido.");
  }

  // Etapa de Validação e Limpeza:
  // Aqui garantimos que apenas dados válidos retornados pela IA sejam usados.
  const validatedWorkouts = output.workouts.map(workout => {
    
    // Filtra apenas os exercícios que existem na nossa lista de dados (`EXERCICIOS_POR_GRUPO`)
    const validatedExercises = workout.exercicios.filter(exercise => {
      const isValid = validExerciseNames.has(exercise.nomeExercicio);
      if (!isValid) {
        console.warn(`[Validação IA] Exercício inválido removido do plano: "${exercise.nomeExercicio}"`);
      }
      return isValid;
    });

    return {
      ...workout,
      exercicios: validatedExercises,
    };
  }).filter(workout => workout.exercicios.length > 0); // Garante que não haja treinos sem exercícios

  return {
    planName: output.planName,
    workouts: validatedWorkouts,
  };
}


// --- PROMPT E FLOW DO GENKIT (Lógica Interna da IA) ---

const workoutPrompt = ai.definePrompt({
  name: 'workoutGeneratorPrompt',
  model: googleAI.model('gemini-pro'),
  input: { schema: WorkoutGeneratorInputSchema },
  output: { schema: WorkoutGeneratorAIOutputSchema },
  prompt: `
    Você é um personal trainer de elite, especialista em fisiologia do exercício.
    Sua tarefa é criar um PLANO DE TREINO SEMANAL OTIMIZADO, baseado nas especificações do aluno, usando APENAS os exercícios da lista fornecida.

    **Especificações do Aluno:**
    - Objetivo Principal: {{{objetivo}}}
    - Nível de Experiência: {{{nivelExperiencia}}}
    - Dias de Treino por Semana: {{{diasPorSemana}}}
    {{#if observacoesAdicionais}}- Observações Importantes: {{{observacoesAdicionais}}}{{/if}}

    **Lista de Exercícios Disponíveis (Use APENAS estes):**
    ${exerciciosDisponiveisString}

    **Suas Diretrizes:**
    1.  **Estrutura da Divisão (Split):** Crie uma divisão de treinos lógica para a semana.
        - **2-3 dias:** Use "Full Body" (A/B).
        - **4 dias:** Use "Superior/Inferior" (Upper/Lower - A/B).
        - **5+ dias:** Use uma divisão por grupo muscular (ABCDE).
    2.  **Seleção de Exercícios:** Escolha os exercícios MAIS EFICAZES da lista para o objetivo e nível do aluno. Não invente exercícios.
        - 'Iniciante': 4-5 exercícios por treino.
        - 'Intermediário': 5-7 exercícios.
        - 'Avançado': 6-8 exercícios.
    3.  **Séries e Repetições:** Adapte ao objetivo:
        - **Hipertrofia:** 3-4 séries, 8-12 repetições.
        - **Força:** 4-5 séries, 4-6 repetições (para os principais).
        - **Perda de Peso:** 3-4 séries, 15-20 repetições.
    4.  **Nome do Plano e Treinos:** Crie um nome geral para o plano (ex: "Plano de Hipertrofia - 4 dias") e nomes específicos para cada treino (ex: "Treino A: Superiores").
    5.  **Dia Sugerido:** Sugira um dia da semana para cada treino (0=Domingo a 6=Sábado), com descanso apropriado.
    6.  **Grupo Muscular:** Para cada exercício, preencha o campo 'grupoMuscular' com o nome exato do grupo ao qual ele pertence na lista.
    7.  **Formato de Saída:** Sua resposta DEVE ser um objeto JSON que corresponda EXATAMENTE ao schema de saída.

    **Exemplo de Formato de Saída JSON:**
    \'\'\'json
    {
      "planName": "Plano Exemplo de Hipertrofia - 3 Dias",
      "workouts": [
        {
          "nome": "Treino A: Full Body",
          "objetivo": "Hipertrofia",
          "diaSugerido": 1,
          "exercicios": [
            {
              "nomeExercicio": "Agachamento Livre",
              "grupoMuscular": "Pernas (Quadríceps e Glúteos)",
              "series": 4,
              "repeticoes": "8-12",
              "observacoes": "Manter a postura correta."
            },
            {
              "nomeExercicio": "Supino Reto com Barra",
              "grupoMuscular": "Peito",
              "series": 4,
              "repeticoes": "8-12",
              "observacoes": "Descer a barra até o peito."
            }
          ]
        },
        {
          "nome": "Treino B: Full Body",
          "objetivo": "Hipertrofia",
          "diaSugerido": 3,
          "exercicios": [
            {
              "nomeExercicio": "Levantamento Terra",
              "grupoMuscular": "Costas",
              "series": 3,
              "repeticoes": "6-8",
              "observacoes": "Manter a coluna neutra."
            }
          ]
        }
      ]
    }
    \'\'\'
  `,
});


const workoutGeneratorFlow = ai.defineFlow(
  {
    name: 'workoutGeneratorFlow',
    inputSchema: WorkoutGeneratorInputSchema,
    outputSchema: WorkoutGeneratorAIOutputSchema,
  },
  async (input) => {
    const { output } = await workoutPrompt(input);
    return output!;
  }
);
