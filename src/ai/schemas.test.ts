import { describe, it, expect } from 'vitest';
import { WorkoutGeneratorInputSchema, WorkoutGeneratorAIOutputSchema } from './schemas';

describe('WorkoutGeneratorInputSchema', () => {
  const validInput = {
    objetivo: 'Hipertrofia' as const,
    nivelExperiencia: 'Iniciante' as const,
    diasPorSemana: 3,
  };

  describe('valid input', () => {
    it('accepts minimal valid input', () => {
      const result = WorkoutGeneratorInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('accepts input with optional observacoesAdicionais', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({
        ...validInput,
        observacoesAdicionais: 'Lesão no joelho esquerdo',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.observacoesAdicionais).toBe('Lesão no joelho esquerdo');
      }
    });

    it('accepts all objetivo values', () => {
      for (const objetivo of ['Hipertrofia', 'Perda de Peso', 'Força'] as const) {
        const result = WorkoutGeneratorInputSchema.safeParse({ ...validInput, objetivo });
        expect(result.success).toBe(true);
      }
    });

    it('accepts all nivelExperiencia values', () => {
      for (const nivel of ['Iniciante', 'Intermediário', 'Avançado'] as const) {
        const result = WorkoutGeneratorInputSchema.safeParse({
          ...validInput,
          nivelExperiencia: nivel,
        });
        expect(result.success).toBe(true);
      }
    });

    it('accepts diasPorSemana at boundary 1', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({ ...validInput, diasPorSemana: 1 });
      expect(result.success).toBe(true);
    });

    it('accepts diasPorSemana at boundary 7', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({ ...validInput, diasPorSemana: 7 });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid input', () => {
    it('rejects invalid objetivo', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({
        ...validInput,
        objetivo: 'Cardio',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid nivelExperiencia', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({
        ...validInput,
        nivelExperiencia: 'Expert',
      });
      expect(result.success).toBe(false);
    });

    it('rejects diasPorSemana below minimum (0)', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({ ...validInput, diasPorSemana: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects diasPorSemana above maximum (8)', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({ ...validInput, diasPorSemana: 8 });
      expect(result.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects non-number diasPorSemana', () => {
      const result = WorkoutGeneratorInputSchema.safeParse({
        ...validInput,
        diasPorSemana: 'three',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('WorkoutGeneratorAIOutputSchema', () => {
  const validOutput = {
    planName: 'Plano Hipertrofia 4x',
    workouts: [
      {
        nome: 'Treino A - Peito e Tríceps',
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

  describe('valid output', () => {
    it('accepts a complete valid output', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it('accepts empty workouts array', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        planName: 'Plano vazio',
        workouts: [],
      });
      expect(result.success).toBe(true);
    });

    it('accepts diaSugerido at boundary 0 (Sunday)', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        ...validOutput,
        workouts: [{ ...validOutput.workouts[0], diaSugerido: 0 }],
      });
      expect(result.success).toBe(true);
    });

    it('accepts diaSugerido at boundary 6 (Saturday)', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        ...validOutput,
        workouts: [{ ...validOutput.workouts[0], diaSugerido: 6 }],
      });
      expect(result.success).toBe(true);
    });

    it('accepts multiple workouts', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        planName: 'Split Full',
        workouts: [
          { ...validOutput.workouts[0], nome: 'Treino A', diaSugerido: 1 },
          { ...validOutput.workouts[0], nome: 'Treino B', diaSugerido: 3 },
          { ...validOutput.workouts[0], nome: 'Treino C', diaSugerido: 5 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty observacoes string', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        ...validOutput,
        workouts: [
          {
            ...validOutput.workouts[0],
            exercicios: [{ ...validOutput.workouts[0].exercicios[0], observacoes: '' }],
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid output', () => {
    it('rejects missing planName', () => {
      const { planName: _removed, ...rest } = validOutput;
      const result = WorkoutGeneratorAIOutputSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects missing workouts', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        planName: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects diaSugerido below 0', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        ...validOutput,
        workouts: [{ ...validOutput.workouts[0], diaSugerido: -1 }],
      });
      expect(result.success).toBe(false);
    });

    it('rejects diaSugerido above 6', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        ...validOutput,
        workouts: [{ ...validOutput.workouts[0], diaSugerido: 7 }],
      });
      expect(result.success).toBe(false);
    });

    it('rejects workout with missing exercise fields', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        ...validOutput,
        workouts: [
          {
            ...validOutput.workouts[0],
            exercicios: [{ nomeExercicio: 'Supino' }],
          },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('rejects workout with non-array exercicios', () => {
      const result = WorkoutGeneratorAIOutputSchema.safeParse({
        ...validOutput,
        workouts: [
          {
            ...validOutput.workouts[0],
            exercicios: 'not-an-array',
          },
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});
