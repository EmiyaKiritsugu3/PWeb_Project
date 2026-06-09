import { useState, useCallback } from 'react';
import type { Exercicio } from '@/lib/definitions';
import { DEFAULT_EXERCISE, exercicioDescriptionsMap } from '@/lib/exercise-options';

export function useWorkoutExercises(
  initialObjetivo?: string,
  initialExercicios?: Partial<Exercicio>[]
) {
  const [objetivo, setObjetivo] = useState(initialObjetivo || '');
  const [exercicios, setExercicios] = useState<Partial<Exercicio>[]>(initialExercicios || []);

  const addObjective = useCallback(() => {
    setExercicios((prev) => [...prev, { ...DEFAULT_EXERCISE, id: `${Date.now()}` }]);
  }, []);

  const removeExercise = useCallback((id: string) => {
    setExercicios((prev) => prev.filter((ex) => ex.id !== id));
  }, []);

  const updateExercise = useCallback(
    (id: string, field: keyof Exercicio, value: string | number) => {
      setExercicios((prev) =>
        prev.map((ex) => {
          if (ex.id !== id) return ex;
          if (field === 'nomeExercicio' && typeof value === 'string') {
            return {
              ...ex,
              nomeExercicio: value,
              descricao: exercicioDescriptionsMap.get(value) || '',
            };
          }
          if (field === 'series') {
            const parsed = Number.parseInt(String(value), 10);
            return { ...ex, series: Number.isFinite(parsed) ? parsed : ex.series };
          }
          return { ...ex, [field]: value };
        })
      );
    },
    []
  );

  const hasValidationErrors = useCallback(() => {
    return !objetivo || exercicios.length === 0 || exercicios.some((e) => !e.nomeExercicio);
  }, [objetivo, exercicios]);

  const reset = useCallback(() => {
    setObjetivo('');
    setExercicios([]);
  }, []);

  return {
    objetivo,
    setObjetivo,
    exercicios,
    addObjective,
    removeExercise,
    updateExercise,
    hasValidationErrors,
    reset,
  };
}
