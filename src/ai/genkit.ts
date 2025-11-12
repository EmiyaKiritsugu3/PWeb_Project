
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Log para ajudar na depuração durante o desenvolvimento.
  logLevel: 'debug',
  // Habilita o rastreamento e métricas para observabilidade.
  enableTracingAndMetrics: true,
});
