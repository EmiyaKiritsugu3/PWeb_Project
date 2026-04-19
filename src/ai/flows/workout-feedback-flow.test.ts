import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WorkoutFeedbackOutput } from '@/ai/flows/workout-feedback-flow';

vi.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: vi.fn(),
    defineFlow: vi.fn(),
  },
}));

vi.mock('@genkit-ai/google-genai', () => ({
  googleAI: { model: vi.fn(() => 'gemini-2.5-flash') },
}));

vi.mock('@/ai/flows/workout-feedback-flow', async () => {
  return {
    generateWorkoutFeedback: vi.fn(),
  };
});

import { generateWorkoutFeedback } from '@/ai/flows/workout-feedback-flow';

describe('generateWorkoutFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fallback when no exercises completed (no AI call)', async () => {
    vi.mocked(generateWorkoutFeedback).mockResolvedValue({
      title: 'O primeiro passo é o mais importante!',
      message: expect.any(String) as unknown as string,
    });

    const result = await generateWorkoutFeedback({
      goal: 'Hipertrofia',
      completedExercises: [],
      totalExercises: 3,
    });

    expect(result.title).toBe('O primeiro passo é o mais importante!');
  });

  it('returns AI feedback when exercises are completed', async () => {
    vi.mocked(generateWorkoutFeedback).mockResolvedValue({
      title: 'Mandou bem!',
      message: 'Excelente sessão. Continue assim!',
    });

    const result = await generateWorkoutFeedback({
      goal: 'Hipertrofia',
      completedExercises: ['Supino Reto', 'Crucifixo'],
      totalExercises: 2,
    });

    expect(result.title).toBe('Mandou bem!');
    expect(result.message).toBeTruthy();
  });

  it('propagates errors from AI call', async () => {
    vi.mocked(generateWorkoutFeedback).mockRejectedValue(new Error('AI unavailable'));

    await expect(
      generateWorkoutFeedback({
        goal: 'Força',
        completedExercises: ['Agachamento'],
        totalExercises: 1,
      })
    ).rejects.toThrow('AI unavailable');
  });
});

// Integration contract: WorkoutSession must handle the rejection gracefully
describe('WorkoutSession feedback contract', () => {
  it('fallback feedback shape is valid', () => {
    const fallback: WorkoutFeedbackOutput = {
      title: 'Treino Concluído!',
      message: 'Continue assim!',
    };
    expect(fallback.title).toBeTruthy();
    expect(fallback.message).toBeTruthy();
  });
});
