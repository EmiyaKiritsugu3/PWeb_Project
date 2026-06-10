import { useState, useEffect } from 'react';
import type { Treino } from '@/lib/definitions';

export function useWorkoutTracker(treino: Treino | null) {
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!treino) return;
    const storageKey = `checkedExercises-${new Date().toISOString().split('T')[0]}-${treino.id}`;
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      setCheckedExercises(JSON.parse(savedState));
    }
  }, [treino]);

  const handleCheckChange = (exerciseId: string) => {
    if (!treino) return;
    const storageKey = `checkedExercises-${new Date().toISOString().split('T')[0]}-${treino.id}`;
    const newState = { ...checkedExercises, [exerciseId]: !checkedExercises[exerciseId] };
    setCheckedExercises(newState);
    localStorage.setItem(storageKey, JSON.stringify(newState));
  };

  return {
    checkedExercises,
    handleCheckChange,
  };
}
