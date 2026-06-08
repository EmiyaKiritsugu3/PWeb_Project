import { EXERCICIOS_POR_GRUPO } from '@/lib/constants';
import type { Exercicio } from '@/lib/definitions';

// Grouped combobox options from EXERCICIOS_POR_GRUPO
export const exerciciosOptions = EXERCICIOS_POR_GRUPO.map((grupo) => ({
  label: grupo.grupo,
  options: grupo.exercicios.map((ex) => ({
    value: ex.nomeExercicio,
    label: ex.nomeExercicio,
    keywords: [grupo.grupo],
  })),
}));

// Flat combobox options with description
export const flatExerciciosOptions = EXERCICIOS_POR_GRUPO.flatMap((g) =>
  g.exercicios.map((ex) => ({
    value: ex.nomeExercicio,
    label: ex.nomeExercicio,
    description: ex.descricao,
  }))
);

// Map for O(1) description lookup
export const exercicioDescriptionsMap = new Map(
  flatExerciciosOptions.map((opt) => [opt.value, opt.description])
);

// Default exercise object
export const DEFAULT_EXERCISE: Omit<Exercicio, 'id'> = {
  nomeExercicio: '',
  series: 3,
  repeticoes: '10-12',
  observacoes: '',
  descricao: '',
};
