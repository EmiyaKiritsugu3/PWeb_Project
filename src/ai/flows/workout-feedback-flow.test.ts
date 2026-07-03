import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFeedbackPrompt, mockDefinePrompt, mockDefineFlow, mockSetAttribute } = vi.hoisted(
  () => {
    const mockFeedbackPrompt = vi.fn();
    const mockDefinePrompt = vi.fn((_config: unknown) => mockFeedbackPrompt);
    const mockDefineFlow = vi.fn((_config: unknown, handler: unknown) => handler);
    const mockSetAttribute = vi.fn();
    return { mockFeedbackPrompt, mockDefinePrompt, mockDefineFlow, mockSetAttribute };
  }
);

vi.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: mockDefinePrompt,
    defineFlow: mockDefineFlow,
  },
}));

vi.mock('@genkit-ai/google-genai', () => ({
  googleAI: { model: vi.fn(() => 'gemini-2.5-flash') },
}));

vi.mock('@sentry/nextjs', () => ({
  startSpan: vi.fn(
    async (
      _config: unknown,
      fn: (span: { setAttribute: typeof mockSetAttribute }) => Promise<unknown>
    ) => fn({ setAttribute: mockSetAttribute })
  ),
}));

import { generateWorkoutFeedback } from '@/ai/flows/workout-feedback-flow';

describe('generateWorkoutFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fallback when no exercises completed (no AI call)', async () => {
    const result = await generateWorkoutFeedback({
      goal: 'Hipertrofia',
      completedExercises: [],
      totalExercises: 3,
    });

    expect(result.title).toBe('O primeiro passo é o mais importante!');
    expect(result.message).toMatch(/nenhum exercício/i);
    expect(mockFeedbackPrompt).not.toHaveBeenCalled();
  });

  it('returns AI feedback when exercises completed', async () => {
    const aiResult = {
      title: 'Mandou bem!',
      message: 'Excelente sessão. Continue assim!',
    };
    mockFeedbackPrompt.mockResolvedValue({ output: aiResult });

    const result = await generateWorkoutFeedback({
      goal: 'Hipertrofia',
      completedExercises: ['Supino Reto', 'Crucifixo'],
      totalExercises: 2,
    });

    expect(result.title).toBe('Mandou bem!');
    expect(result.message).toBe('Excelente sessão. Continue assim!');
    expect(mockFeedbackPrompt).toHaveBeenCalledTimes(1);
  });

  it('throws when AI returns null output', async () => {
    mockFeedbackPrompt.mockResolvedValue({ output: null });

    await expect(
      generateWorkoutFeedback({
        goal: 'Hipertrofia',
        completedExercises: ['Supino Reto'],
        totalExercises: 1,
      })
    ).rejects.toThrow('workoutFeedbackFlow: output is null');
  });
});
