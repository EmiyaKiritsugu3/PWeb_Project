import { describe, it, expect } from 'vitest';
import { FINANCIAL_ROUTES, DIAS_DA_SEMANA, EXERCICIOS_POR_GRUPO } from './constants';

describe('FINANCIAL_ROUTES', () => {
  it('contains the expected routes', () => {
    expect(FINANCIAL_ROUTES).toContain('/dashboard/financeiro');
    expect(FINANCIAL_ROUTES).toContain('/dashboard/planos');
  });

  it('is a readonly tuple with exactly 2 entries', () => {
    expect(FINANCIAL_ROUTES).toHaveLength(2);
  });

  it('contains only non-empty string paths', () => {
    for (const route of FINANCIAL_ROUTES) {
      expect(typeof route).toBe('string');
      expect(route.length).toBeGreaterThan(0);
      expect(route).toMatch(/^\//);
    }
  });
});

describe('DIAS_DA_SEMANA', () => {
  it('contains exactly 7 entries', () => {
    expect(DIAS_DA_SEMANA).toHaveLength(7);
  });

  it('covers all day values 0–6', () => {
    const values = DIAS_DA_SEMANA.map((d) => d.value);
    for (let i = 0; i <= 6; i++) {
      expect(values).toContain(i);
    }
  });

  it('each entry has a numeric value and a non-empty string label', () => {
    for (const dia of DIAS_DA_SEMANA) {
      expect(typeof dia.value).toBe('number');
      expect(typeof dia.label).toBe('string');
      expect(dia.label.length).toBeGreaterThan(0);
    }
  });

  it('maps value 0 to Domingo', () => {
    const domingo = DIAS_DA_SEMANA.find((d) => d.value === 0);
    expect(domingo?.label).toBe('Domingo');
  });

  it('maps value 6 to Sábado', () => {
    const sabado = DIAS_DA_SEMANA.find((d) => d.value === 6);
    expect(sabado?.label).toBe('Sábado');
  });
});

describe('EXERCICIOS_POR_GRUPO', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(EXERCICIOS_POR_GRUPO)).toBe(true);
    expect(EXERCICIOS_POR_GRUPO.length).toBeGreaterThan(0);
  });

  it('each group has a non-empty grupo name', () => {
    for (const group of EXERCICIOS_POR_GRUPO) {
      expect(typeof group.grupo).toBe('string');
      expect(group.grupo.length).toBeGreaterThan(0);
    }
  });

  it('each group has at least one exercise', () => {
    for (const group of EXERCICIOS_POR_GRUPO) {
      expect(Array.isArray(group.exercicios)).toBe(true);
      expect(group.exercicios.length).toBeGreaterThan(0);
    }
  });

  it('each exercise has a non-empty nomeExercicio and descricao', () => {
    for (const group of EXERCICIOS_POR_GRUPO) {
      for (const ex of group.exercicios) {
        expect(typeof ex.nomeExercicio).toBe('string');
        expect(ex.nomeExercicio.length).toBeGreaterThan(0);
        expect(typeof ex.descricao).toBe('string');
        expect(ex.descricao.length).toBeGreaterThan(0);
      }
    }
  });

  it('has no duplicate exercise names within each group', () => {
    for (const group of EXERCICIOS_POR_GRUPO) {
      const names = group.exercicios.map((ex) => ex.nomeExercicio);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    }
  });

  it('includes expected muscle groups', () => {
    const groupNames = EXERCICIOS_POR_GRUPO.map((g) => g.grupo);
    expect(groupNames).toContain('Peito');
    expect(groupNames).toContain('Costas');
    expect(groupNames).toContain('Ombros');
    expect(groupNames).toContain('Panturrilhas');
    expect(groupNames).toContain('Abdômen');
  });
});
