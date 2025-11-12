
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Força o uso da versão v1beta da API, garantindo a compatibilidade
      // e resolvendo erros de "modelo não encontrado".
      apiVersion: 'v1beta',
    }),
  ],
  // Log para ajudar na depuração durante o desenvolvimento.
  logLevel: 'debug',
  // Habilita o rastreamento e métricas para observabilidade.
  enableTracingAndMetrics: true,
});
