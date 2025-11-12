
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // A versão da API pode ser especificada se necessário,
      // mas geralmente o padrão é suficiente.
      // apiVersion: 'v1beta',
    }),
  ],
  // Log para ajudar na depuração durante o desenvolvimento.
  logLevel: 'debug',
  // Habilita o rastreamento e métricas para observabilidade.
  enableTracingAndMetrics: true,
});
