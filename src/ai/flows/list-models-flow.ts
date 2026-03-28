
'use server';
/**
 * @fileOverview Flow para listar os modelos de IA disponíveis.
 */

import { ai } from '@/ai/genkit';
// import { listModels } from '@genkit-ai/core/plugins'; // Removido devido a erro de exportação na versão atual.

/**
 * Retorna uma lista de nomes de modelos disponíveis no registro do Genkit.
 * Em Genkit 1.x, usamos ai.registry.listActions() para descobrir modelos dinamicamente.
 */
export async function listAvailableModels(): Promise<string[]> {
    // Pegamos todas as ações do registro
    const actions = await ai.registry.listActions();
    
    // As chaves do registro em Genkit 1.x vêm no formato: /tipo/plugin/nome
    // Exemplo: /model/googleai/gemini-1.5-flash
    // Queremos apenas as que começam com /model/ e retornar plugin/nome
    return Object.keys(actions)
        .filter(key => key.startsWith('/model/'))
        .map(key => key.replace(/^\/model\//, ''));
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
