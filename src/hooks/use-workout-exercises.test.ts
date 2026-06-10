import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutExercises } from './use-workout-exercises';

vi.mock('@/lib/exercise-options', () => ({
  DEFAULT_EXERCISE: {
    nomeExercicio: '',
    series: 3,
    repeticoes: '10-12',
    observacoes: '',
    descricao: '',
  },
  exercicioDescriptionsMap: new Map([
    ['Supino Reto', 'Exercício para peito'],
    ['Agachamento', 'Exercício para pernas'],
  ]),
}));

let exerciseCounter = 0;
const addExercise = (result: { current: ReturnType<typeof useWorkoutExercises> }) => {
  exerciseCounter++;
  vi.spyOn(Date, 'now').mockReturnValue(exerciseCounter);
  act(() => result.current.addObjective());
};

const addTwoExercises = (result: { current: ReturnType<typeof useWorkoutExercises> }) => {
  addExercise(result);
  addExercise(result);
};

describe('useWorkoutExercises', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    exerciseCounter = 0;
  });

  describe('initial state', () => {
    it('should return empty objetivo and exercicios when no initial values', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      expect(result.current.objetivo).toBe('');
      expect(result.current.exercicios).toEqual([]);
    });

    it('should use initial values when provided', () => {
      const initial = {
        objetivo: 'Hipertrofia',
        exercicios: [{ id: '1', nomeExercicio: 'Supino' }],
      };
      const { result } = renderHook(() =>
        useWorkoutExercises(initial.objetivo, initial.exercicios)
      );
      expect(result.current.objetivo).toBe('Hipertrofia');
      expect(result.current.exercicios).toHaveLength(1);
    });
  });

  describe('setObjetivo', () => {
    it('should update the objetivo', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      act(() => result.current.setObjetivo('Perda de peso'));
      expect(result.current.objetivo).toBe('Perda de peso');
    });
  });

  describe('addObjective', () => {
    it('should add a new exercise with DEFAULT_EXERCISE fields', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addExercise(result);
      expect(result.current.exercicios).toHaveLength(1);
      expect(result.current.exercicios[0].nomeExercicio).toBe('');
      expect(result.current.exercicios[0].series).toBe(3);
      expect(result.current.exercicios[0].repeticoes).toBe('10-12');
      expect(result.current.exercicios[0].id).toBeDefined();
    });

    it('should add multiple exercises with unique ids', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addTwoExercises(result);
      expect(result.current.exercicios).toHaveLength(2);
      expect(result.current.exercicios[0].id).not.toBe(result.current.exercicios[1].id);
    });
  });

  describe('removeExercise', () => {
    it('should remove exercise by id', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addExercise(result);
      const firstId = result.current.exercicios[0].id!;
      act(() => result.current.removeExercise(firstId));
      expect(result.current.exercicios).toHaveLength(0);
    });

    it('should only remove the target exercise', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addTwoExercises(result);
      const firstId = result.current.exercicios[0].id!;
      act(() => result.current.removeExercise(firstId));
      expect(result.current.exercicios).toHaveLength(1);
    });

    it('should handle removing non-existent id gracefully', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addExercise(result);
      act(() => result.current.removeExercise('nonexistent'));
      expect(result.current.exercicios).toHaveLength(1);
    });
  });

  describe('updateExercise', () => {
    it('should update a specific field of an exercise', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addExercise(result);
      const id = result.current.exercicios[0].id!;
      act(() => result.current.updateExercise(id, 'repeticoes', '8-10'));
      expect(result.current.exercicios[0].repeticoes).toBe('8-10');
    });

    it('should update nomeExercicio and set descricao from map', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addExercise(result);
      const id = result.current.exercicios[0].id!;
      act(() => result.current.updateExercise(id, 'nomeExercicio', 'Supino Reto'));
      expect(result.current.exercicios[0].nomeExercicio).toBe('Supino Reto');
      expect(result.current.exercicios[0].descricao).toBe('Exercício para peito');
    });

    it('should set empty descricao when exercise name not in map', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addExercise(result);
      const id = result.current.exercicios[0].id!;
      act(() => result.current.updateExercise(id, 'nomeExercicio', 'Exercise Not Found'));
      expect(result.current.exercicios[0].descricao).toBe('');
    });

    it('should parse series as integer', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addExercise(result);
      const id = result.current.exercicios[0].id!;
      act(() => result.current.updateExercise(id, 'series', '5'));
      expect(result.current.exercicios[0].series).toBe(5);
    });

    it('should keep old series when value is not a finite number', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addExercise(result);
      const id = result.current.exercicios[0].id!;
      act(() => result.current.updateExercise(id, 'series', 'abc'));
      expect(result.current.exercicios[0].series).toBe(3);
    });

    it('should not modify other exercises', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      addTwoExercises(result);
      const firstId = result.current.exercicios[0].id!;
      act(() => result.current.updateExercise(firstId, 'repeticoes', '8-10'));
      expect(result.current.exercicios[1].repeticoes).toBe('10-12');
    });
  });

  describe('hasValidationErrors', () => {
    it('should return true when objetivo is empty', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      expect(result.current.hasValidationErrors()).toBe(true);
    });

    it('should return true when no exercises', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      act(() => result.current.setObjetivo('Hipertrofia'));
      expect(result.current.hasValidationErrors()).toBe(true);
    });

    it('should return true when an exercise has no nomeExercicio', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      act(() => result.current.setObjetivo('Hipertrofia'));
      addExercise(result);
      expect(result.current.hasValidationErrors()).toBe(true);
    });

    it('should return false when all fields are valid', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      act(() => result.current.setObjetivo('Hipertrofia'));
      addExercise(result);
      const id = result.current.exercicios[0].id!;
      act(() => result.current.updateExercise(id, 'nomeExercicio', 'Supino Reto'));
      expect(result.current.hasValidationErrors()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear objetivo and exercicios', () => {
      const { result } = renderHook(() => useWorkoutExercises());
      act(() => result.current.setObjetivo('Hipertrofia'));
      addTwoExercises(result);
      expect(result.current.objetivo).toBe('Hipertrofia');
      expect(result.current.exercicios).toHaveLength(2);

      act(() => result.current.reset());
      expect(result.current.objetivo).toBe('');
      expect(result.current.exercicios).toEqual([]);
    });
  });
});
