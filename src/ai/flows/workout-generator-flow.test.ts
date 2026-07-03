import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

const { mockGenerate, mockGenerateStream, mockDefineFlow, mockSetAttribute, mockSpan } =
  vi.hoisted(() => {
    const mockGenerate = vi.fn();
    const mockGenerateStream = vi.fn();
    const mockDefineFlow = vi.fn((_config: unknown, handler: unknown) => handler);
    const mockSetAttribute = vi.fn();
    const mockSpan = { setAttribute: mockSetAttribute };
    return { mockGenerate, mockGenerateStream, mockDefineFlow, mockSetAttribute, mockSpan };
  });

vi.mock('@/ai/genkit', () => ({
  ai: {
    defineFlow: (...args: [unknown, unknown]) => mockDefineFlow(...args),
    generate: (...args: [unknown]) => mockGenerate(...args),
    generateStream: (...args: [unknown]) => mockGenerateStream(...args),
  },
}));

vi.mock('@genkit-ai/google-genai', () => ({
  googleAI: { model: vi.fn(() => 'gemini-2.5-flash') },
}));

vi.mock('@sentry/nextjs', () => ({
  startSpan: vi.fn(
    async (_config: unknown, fn: (span: typeof mockSpan) => Promise<unknown>) => fn(mockSpan)
  ),
}));

vi.mock('@/lib/constants', () => ({
  EXERCICIOS_POR_GRUPO: [
    {
      grupo: 'Peito',
      exercicios: [{ nomeExercicio: 'Supino Reto' }],
    },
  ],
}));

vi.mock('@/ai/schemas', () => {
  const WorkoutGeneratorInputSchema = z.object({
    objetivo: z.enum(['Hipertrofia', 'Perda de Peso', 'Força']),
    nivelExperiencia: z.enum(['Iniciante', 'Intermediário', 'Avançado']),
    diasPorSemana: z.number().min(1).max(7),
    observacoesAdicionais: z.string().optional(),
  });

  const WorkoutGeneratorAIOutputSchema = z.object({
    planName: z.string(),
    workouts: z.array(
      z.object({
        nome: z.string(),
        objetivo: z.string(),
        diaSugerido: z.number(),
        exercicios: z.array(
          z.object({
            nomeExercicio: z.string(),
            grupoMuscular: z.string(),
            series: z.number(),
            repeticoes: z.string(),
            observacoes: z.string(),
          })
        ),
      })
    ),
  });

  return {
    WorkoutGeneratorInputSchema,
    WorkoutGeneratorAIOutputSchema,
    WorkoutGeneratorInput: undefined,
    WorkoutGeneratorAIOutput: undefined,
  };
});

const validInput = {
  objetivo: 'Hipertrofia' as const,
  nivelExperiencia: 'Intermediário' as const,
  diasPorSemana: 4,
};

describe('streamWorkoutPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('streams workout plan successfully', async () => {
    const chunkOutput = {
      planName: 'Plano Teste',
      workouts: [],
    };
    mockGenerateStream.mockReturnValue({
      stream: (async function* () {
        yield { output: chunkOutput };
      })(),
      response: Promise.resolve({
        output: {
          planName: 'Plano Teste',
          workouts: [
            {
              nome: 'Treino A',
              objetivo: 'Hipertrofia',
              diaSugerido: 1,
              exercicios: [
                {
                  nomeExercicio: 'Supino Reto',
                  grupoMuscular: 'Peito',
                  series: 3,
                  repeticoes: '10-12',
                  observacoes: '',
                },
              ],
            },
          ],
        },
        usage: { inputTokens: 100, outputTokens: 200 },
      }),
    });

    const { streamWorkoutPlan } = await import('@/ai/flows/workout-generator-flow');
    const sendChunk = vi.fn();

    const result = await (
      streamWorkoutPlan as unknown as (
        input: typeof validInput,
        ctx: { sendChunk: (chunk: unknown) => void }
      ) => Promise<unknown>
    )(validInput, { sendChunk });

    expect(result).toBeDefined();
    expect(sendChunk).toHaveBeenCalled();
  });

  it('throws when AI returns no output', async () => {
    mockGenerateStream.mockReturnValue({
      stream: (async function* () {
        yield {};
      })(),
      response: Promise.resolve({
        output: null,
        usage: { inputTokens: 0, outputTokens: 0 },
      }),
    });

    const { streamWorkoutPlan } = await import('@/ai/flows/workout-generator-flow');
    const sendChunk = vi.fn();

    await expect(
      (
        streamWorkoutPlan as unknown as (
          input: typeof validInput,
          ctx: { sendChunk: (chunk: unknown) => void }
        ) => Promise<unknown>
      )(validInput, { sendChunk })
    ).rejects.toThrow('A IA não retornou um plano de treino válido.');
  });

  it('uses observacoesAdicionais when provided', async () => {
    mockGenerateStream.mockReturnValue({
      stream: (async function* () {
        yield { output: { planName: 'Plano', workouts: [] } };
      })(),
      response: Promise.resolve({
        output: {
          planName: 'Plano',
          workouts: [],
        },
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    });

    const { streamWorkoutPlan } = await import('@/ai/flows/workout-generator-flow');
    const sendChunk = vi.fn();
    const inputWithObs = { ...validInput, observacoesAdicionais: 'Lesão no joelho' };

    const result = await (
      streamWorkoutPlan as unknown as (
        input: typeof inputWithObs,
        ctx: { sendChunk: (chunk: unknown) => void }
      ) => Promise<unknown>
    )(inputWithObs, { sendChunk });

    expect(result).toBeDefined();
  });

  it('handles missing usage stats with nullish coalescing', async () => {
    const chunkOutput = {
      planName: 'Plano Teste',
      workouts: [],
    };
    mockGenerateStream.mockReturnValue({
      stream: (async function* () {
        yield { output: chunkOutput };
      })(),
      response: Promise.resolve({
        output: {
          planName: 'Plano Teste',
          workouts: [
            {
              nome: 'Treino A',
              objetivo: 'Hipertrofia',
              diaSugerido: 1,
              exercicios: [
                {
                  nomeExercicio: 'Supino Reto',
                  grupoMuscular: 'Peito',
                  series: 3,
                  repeticoes: '10-12',
                  observacoes: '',
                },
              ],
            },
          ],
        },
        usage: null,
      }),
    });

    const { streamWorkoutPlan } = await import('@/ai/flows/workout-generator-flow');
    const sendChunk = vi.fn();

    const result = await (
      streamWorkoutPlan as unknown as (
        input: typeof validInput,
        ctx: { sendChunk: (chunk: unknown) => void }
      ) => Promise<unknown>
    )(validInput, { sendChunk });

    expect(result).toBeDefined();
  });

  it('throws when AI output fails schema validation', async () => {
    mockGenerateStream.mockReturnValue({
      stream: (async function* () {
        yield {};
      })(),
      response: Promise.resolve({
        output: {
          planName: 123,
          workouts: [
            {
              nome: 'A',
              objetivo: 'Força',
              diaSugerido: 1,
              exercicios: [
                {
                  nomeExercicio: 'Supino',
                  grupoMuscular: 'Peito',
                  series: 3,
                  repeticoes: '10',
                  observacoes: '',
                },
              ],
            },
          ],
        },
        usage: { inputTokens: 10, outputTokens: 20 },
      }),
    });

    const { streamWorkoutPlan } = await import('@/ai/flows/workout-generator-flow');
    const sendChunk = vi.fn();

    await expect(
      (
        streamWorkoutPlan as unknown as (
          input: typeof validInput,
          ctx: { sendChunk: (chunk: unknown) => void }
        ) => Promise<unknown>
      )(validInput, { sendChunk })
    ).rejects.toThrow('A IA não retornou um plano de treino válido.');
  });
});

describe('generateWorkoutPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates workout plan successfully', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        planName: 'Plano Força',
        workouts: [
          {
            nome: 'Treino A',
            objetivo: 'Força',
            diaSugerido: 2,
            exercicios: [
              {
                nomeExercicio: 'Supino Reto',
                grupoMuscular: 'Peito',
                series: 5,
                repeticoes: '5-6',
                observacoes: '',
              },
            ],
          },
        ],
      },
      usage: { inputTokens: 50, outputTokens: 150 },
    });

    const { generateWorkoutPlan } = await import('@/ai/flows/workout-generator-flow');
    const result = await generateWorkoutPlan(validInput);

    expect(result).toBeDefined();
    expect(result.planName).toBe('Plano Força');
    expect(mockGenerate).toHaveBeenCalled();
  });

  it('handles undefined usage stats in generateWorkoutPlan', async () => {
    mockGenerate.mockResolvedValue({
      output: null,
      usage: null,
    });

    const { generateWorkoutPlan } = await import('@/ai/flows/workout-generator-flow');
    await expect(generateWorkoutPlan(validInput)).rejects.toThrow(
      'A IA não retornou um plano de treino válido.'
    );
  });

  it('throws when output is null', async () => {
    mockGenerate.mockResolvedValue({
      output: null,
      usage: { inputTokens: 0, outputTokens: 0 },
    });

    const { generateWorkoutPlan } = await import('@/ai/flows/workout-generator-flow');
    await expect(generateWorkoutPlan(validInput)).rejects.toThrow(
      'A IA não retornou um plano de treino válido.'
    );
  });
});
