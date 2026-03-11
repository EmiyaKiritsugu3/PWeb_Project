
'use server';
/**
 * @fileOverview Flow para listar os modelos de IA disponíveis.
 */

import { ai } from '@/ai/genkit';
// import { listModels } from '@genkit-ai/core/plugins'; // Removido devido a erro de exportação na versão atual.

/**
 * Retorna uma lista de nomes de modelos disponíveis no plugin do Google AI.
 * WORKAROUND: Retorna uma lista estática para evitar o erro de build.
 * A função `listModels` parece estar quebrada ou foi alterada na versão atual do Genkit.
 */
export async function listAvailableModels(): Promise<string[]> {
    // const models = await listModels({ plugin: googleAI.name }); // Chamada original comentada.
    // return models.map(m => m.name); // Chamada original comentada.
    return [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-2.5-flash",
    ];
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
