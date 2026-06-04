import { describe, it, expect } from 'vitest';
import { WorkoutGeneratorAIOutputSchema } from '@/ai/schemas';

describe('WorkoutGeneratorAIOutputSchema validation', () => {
  it('rejects invalid data (missing required fields)', () => {
    const invalid = { planName: 'Test' }; // Missing workouts array
    const result = WorkoutGeneratorAIOutputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts valid workout plan data', () => {
    const valid = {
      planName: 'Plano de Teste',
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
    };
    const result = WorkoutGeneratorAIOutputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects diaSugerido below min (0)', () => {
    const belowMin = {
      planName: 'Test',
      workouts: [
        {
          nome: 'A',
          objetivo: 'Força',
          diaSugerido: -1,
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
    };
    const result = WorkoutGeneratorAIOutputSchema.safeParse(belowMin);
    expect(result.success).toBe(false);
  });

  it('rejects diaSugerido above max (6)', () => {
    const aboveMax = {
      planName: 'Test',
      workouts: [
        {
          nome: 'A',
          objetivo: 'Força',
          diaSugerido: 7,
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
    };
    const result = WorkoutGeneratorAIOutputSchema.safeParse(aboveMax);
    expect(result.success).toBe(false);
  });
});
