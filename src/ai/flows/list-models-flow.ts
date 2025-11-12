
'use server';
/**
 * @fileOverview Flow para listar os modelos de IA disponíveis.
 */

import { ai } from '@/ai/genkit';
import { listModels } from 'genkit/plugins';
import { googleAI }s from '@genkit-ai/google-genai';

/**
 * Retorna uma lista de nomes de modelos disponíveis no plugin do Google AI.
 */
export async function listAvailableModels(): Promise<string[]> {
  const models = await listModels({ plugin: googleAI.name });
  return models.map(m => m.name);
}

// O flow é a função exportada diretamente neste caso simples.
export const listModelsFlow = ai.defineFlow(
  {
    name: 'listModelsFlow',
  },
  async () => {
    return await listAvailableModels();
  }
);
