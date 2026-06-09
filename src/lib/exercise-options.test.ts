import { describe, it, expect } from 'vitest';
import {
  exerciciosOptions,
  flatExerciciosOptions,
  exercicioDescriptionsMap,
  DEFAULT_EXERCISE,
} from './exercise-options';
import { EXERCICIOS_POR_GRUPO } from './constants';

describe('exerciciosOptions', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(exerciciosOptions)).toBe(true);
    expect(exerciciosOptions.length).toBeGreaterThan(0);
  });

  it('has the same number of groups as EXERCICIOS_POR_GRUPO', () => {
    expect(exerciciosOptions.length).toBe(EXERCICIOS_POR_GRUPO.length);
  });

  it('each entry has a label matching the group name and a non-empty options array', () => {
    for (let i = 0; i < EXERCICIOS_POR_GRUPO.length; i++) {
      const option = exerciciosOptions[i];
      expect(option.label).toBe(EXERCICIOS_POR_GRUPO[i].grupo);
      expect(Array.isArray(option.options)).toBe(true);
      expect(option.options.length).toBe(EXERCICIOS_POR_GRUPO[i].exercicios.length);
    }
  });

  it('each sub-option has value, label, and keywords', () => {
    for (const group of exerciciosOptions) {
      for (const opt of group.options) {
        expect(typeof opt.value).toBe('string');
        expect(opt.value.length).toBeGreaterThan(0);
        expect(typeof opt.label).toBe('string');
        expect(opt.label.length).toBeGreaterThan(0);
        expect(Array.isArray(opt.keywords)).toBe(true);
        expect(opt.keywords.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('flatExerciciosOptions', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(flatExerciciosOptions)).toBe(true);
    expect(flatExerciciosOptions.length).toBeGreaterThan(0);
  });

  it('contains the total count of all exercises across groups', () => {
    const totalExercises = EXERCICIOS_POR_GRUPO.reduce((sum, g) => sum + g.exercicios.length, 0);
    expect(flatExerciciosOptions.length).toBe(totalExercises);
  });

  it('each entry has value, label, and description', () => {
    for (const opt of flatExerciciosOptions) {
      expect(typeof opt.value).toBe('string');
      expect(typeof opt.label).toBe('string');
      expect(typeof opt.description).toBe('string');
    }
  });

  it('value and label are identical for each entry', () => {
    for (const opt of flatExerciciosOptions) {
      expect(opt.value).toBe(opt.label);
    }
  });
});

describe('exercicioDescriptionsMap', () => {
  it('is a Map instance', () => {
    expect(exercicioDescriptionsMap).toBeInstanceOf(Map);
  });

  it('has entries for all exercises in flatExerciciosOptions', () => {
    expect(exercicioDescriptionsMap.size).toBe(flatExerciciosOptions.length);
  });

  it('maps each exercise name to its description', () => {
    for (const opt of flatExerciciosOptions) {
      expect(exercicioDescriptionsMap.has(opt.value)).toBe(true);
      expect(exercicioDescriptionsMap.get(opt.value)).toBe(opt.description);
    }
  });
});

describe('DEFAULT_EXERCISE', () => {
  it('has the expected default structure', () => {
    expect(DEFAULT_EXERCISE).toEqual({
      nomeExercicio: '',
      series: 3,
      repeticoes: '10-12',
      observacoes: '',
      descricao: '',
    });
  });

  it('has series as a positive number', () => {
    expect(typeof DEFAULT_EXERCISE.series).toBe('number');
    expect(DEFAULT_EXERCISE.series).toBeGreaterThanOrEqual(1);
  });

  it('has nomeExercicio as a string', () => {
    expect(typeof DEFAULT_EXERCISE.nomeExercicio).toBe('string');
  });

  it('has repeticoes as a non-empty string', () => {
    expect(typeof DEFAULT_EXERCISE.repeticoes).toBe('string');
    expect(DEFAULT_EXERCISE.repeticoes.length).toBeGreaterThan(0);
  });
});

describe('cross-reference: flatExerciciosOptions ↔ EXERCICIOS_POR_GRUPO', () => {
  it('every flat option value exists as nomeExercicio in EXERCICIOS_POR_GRUPO', () => {
    const allNames = EXERCICIOS_POR_GRUPO.flatMap((g) =>
      g.exercicios.map((ex) => ex.nomeExercicio)
    );
    for (const opt of flatExerciciosOptions) {
      expect(allNames).toContain(opt.value);
    }
  });

  it('every EXERCICIOS_POR_GRUPO exercise appears in flatExerciciosOptions', () => {
    const flatValues = new Set(flatExerciciosOptions.map((o) => o.value));
    for (const group of EXERCICIOS_POR_GRUPO) {
      for (const ex of group.exercicios) {
        expect(flatValues.has(ex.nomeExercicio)).toBe(true);
      }
    }
  });
});
