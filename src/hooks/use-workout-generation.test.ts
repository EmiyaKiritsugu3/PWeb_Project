import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutGeneration } from './use-workout-generation';

vi.mock('@/ai/flows/workout-generator-flow', () => ({
  streamWorkoutPlan: vi.fn(),
}));

vi.mock('@/lib/actions/treinos', () => ({
  upsertTreinoAction: vi.fn(),
}));

vi.mock('@/lib/constants', () => ({
  EXERCICIOS_POR_GRUPO: [
    {
      grupo: 'Peito',
      exercicios: [
        { nomeExercicio: 'Supino Reto com Barra', descricao: 'Deite-se em um banco reto...' },
        { nomeExercicio: 'Crucifixo Reto', descricao: 'Deite-se em um banco reto...' },
      ],
    },
  ],
}));

vi.mock('@/lib/logger', () => ({
  Logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/error', () => ({
  getErrorMessage: vi.fn((err: unknown) =>
    err instanceof Error ? err.message : 'Erro desconhecido'
  ),
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage: vi.fn(),
}));

import { streamWorkoutPlan } from '@/ai/flows/workout-generator-flow';
import { upsertTreinoAction } from '@/lib/actions/treinos';
import { Logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import type { Treino } from '@/lib/definitions';

const mockNotify = {
  success: vi.fn(),
  error: vi.fn(),
};

const baseOptions = {
  userId: 'user-123',
  meusTreinos: [] as Treino[],
  notify: mockNotify,
};

const aiResult = {
  planName: 'Plano Hipertrofia',
  workouts: [
    {
      nome: 'Treino A - Peito',
      objetivo: 'Hipertrofia do peitoral',
      diaSugerido: 1,
      exercicios: [
        {
          nomeExercicio: 'Supino Reto com Barra',
          grupoMuscular: 'Peito',
          series: 4,
          repeticoes: '8-12',
          observacoes: 'Controlar a descida',
        },
      ],
    },
  ],
};

describe('useWorkoutGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(streamWorkoutPlan).mockResolvedValue(aiResult as never);
    vi.mocked(upsertTreinoAction).mockResolvedValue({ success: true });
  });

  it('returns initial state with isGenerating false', () => {
    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));
    expect(result.current.isGenerating).toBe(false);
    expect(typeof result.current.handleGenerate).toBe('function');
  });

  it('sets isGenerating to true while generating', async () => {
    let resolvePromise: (value: unknown) => void;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(streamWorkoutPlan).mockReturnValue(slowPromise as never);

    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    act(() => {
      result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(result.current.isGenerating).toBe(true);

    await act(async () => {
      resolvePromise!(null);
      await slowPromise;
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('calls streamWorkoutPlan with input data', async () => {
    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));
    const input = {
      objetivo: 'Força' as const,
      nivelExperiencia: 'Avançado' as const,
      diasPorSemana: 5,
    };

    await act(async () => {
      await result.current.handleGenerate(input);
    });

    expect(streamWorkoutPlan).toHaveBeenCalledWith(input);
  });

  it('calls upsertTreinoAction for each workout', async () => {
    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(upsertTreinoAction).toHaveBeenCalledTimes(1);
    expect(upsertTreinoAction).toHaveBeenCalledWith(
      expect.objectContaining({
        alunoId: 'user-123',
        objetivo: 'Treino A - Peito',
      })
    );
  });

  it('shows success notification after generation', async () => {
    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(mockNotify.success).toHaveBeenCalledWith(
      'Plano Pessoal Gerado!',
      'Plano Hipertrofia foi criado com sucesso.'
    );
  });

  it('shows error notification when streamWorkoutPlan throws', async () => {
    vi.mocked(streamWorkoutPlan).mockRejectedValue(new Error('API failure'));

    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(mockNotify.error).toHaveBeenCalledWith('Erro da IA', 'API failure', expect.any(Error));
  });

  it('shows error notification when upsertTreinoAction fails', async () => {
    vi.mocked(upsertTreinoAction).mockResolvedValue({ success: false, error: 'DB error' });

    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(mockNotify.error).toHaveBeenCalled();
    expect(result.current.isGenerating).toBe(false);
  });

  it('throws when AI returns null/empty result', async () => {
    vi.mocked(streamWorkoutPlan).mockResolvedValue(null as never);

    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(mockNotify.error).toHaveBeenCalledWith(
      'Erro da IA',
      expect.stringContaining('inválido'),
      expect.any(Error)
    );
  });

  it('sends Sentry message for hallucinated exercise', async () => {
    vi.mocked(streamWorkoutPlan).mockResolvedValue({
      planName: 'Test',
      workouts: [
        {
          nome: 'Treino A',
          objetivo: 'Teste',
          diaSugerido: 1,
          exercicios: [
            {
              nomeExercicio: 'Exercise Not In Constants',
              grupoMuscular: 'Unknown',
              series: 3,
              repeticoes: '10',
              observacoes: '',
            },
          ],
        },
      ],
    } as never);

    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.stringContaining('Hallucination'),
      expect.objectContaining({ level: 'warning' })
    );
  });

  it('uses diaSemana from occupied day when day is taken', async () => {
    const existingTreinos = [{ diaSemana: 1 }] as Treino[];
    const { result } = renderHook(() =>
      useWorkoutGeneration({ ...baseOptions, meusTreinos: existingTreinos })
    );

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(upsertTreinoAction).toHaveBeenCalledWith(expect.objectContaining({ diaSemana: null }));
  });

  it('sets isGenerating to false even on error', async () => {
    vi.mocked(streamWorkoutPlan).mockRejectedValue(new Error('Boom'));

    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('logs info messages during generation', async () => {
    const { result } = renderHook(() => useWorkoutGeneration(baseOptions));

    await act(async () => {
      await result.current.handleGenerate({
        objetivo: 'Hipertrofia',
        nivelExperiencia: 'Iniciante',
        diasPorSemana: 3,
      });
    });

    expect(Logger.info).toHaveBeenCalledWith('Chamando a IA com dados:', expect.any(Object));
    expect(Logger.info).toHaveBeenCalledWith('Resultado da IA retornado:', expect.any(Object));
  });
});
