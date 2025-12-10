import { ai } from '@/ai/genkit';

// Lista estática de modelos Gemini conhecidos e suportados.
// WORKAROUND: A função `listModels` do Genkit não está funcionando como esperado no ambiente atual.
// Usamos uma lista estática para garantir que a funcionalidade principal não seja bloqueada.
// Isso deve ser revisitado quando a biblioteca Genkit for atualizada ou o problema subjacente for resolvido.
const SUPPORTED_MODELS = [
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "gemini-1.0-pro",
];

/**
 * Retorna uma lista de nomes de modelos de IA suportados.
 */
export async function listAvailableModels(): Promise<string[]> {
  // Retorna a lista estática em vez de buscar dinamicamente
  return Promise.resolve(SUPPORTED_MODELS);
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
