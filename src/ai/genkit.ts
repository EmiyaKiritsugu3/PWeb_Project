import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

configureGenkit({
  plugins: [
    googleAI({
      // Opcional: Especifique a versão da API se necessário.
      // apiVersion: 'v1beta',
    }),
  ],
  // Log para ajudar na depuração.
  logLevel: 'debug',
  // Força o Genkit a esperar que as escritas do log sejam concluídas.
  enableTracingAndMetrics: true,
});

// Importe e exporte o objeto 'ai' para uso em outros lugares.
export { ai } from 'genkit';
