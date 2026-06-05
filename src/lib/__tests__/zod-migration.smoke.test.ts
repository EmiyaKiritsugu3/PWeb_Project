import { describe, it, expect } from 'vitest';
import {
  AlunoSchema,
  PlanoSchema,
  TreinoSchema,
  PagamentoSchema,
  MatriculaSchema,
} from '../definitions';

/**
 * Zod migration smoke harness.
 *
 * Purpose: lock in observable schema behavior so that the upcoming
 * zod v3 -> v4 migration can be validated by running this same suite
 * on both versions. Tests assert behavior only (parsed shape / success
 * flag) — they intentionally do NOT import from 'zod' or rely on any
 * version-specific API surface.
 */

const VALID_UUID = '11111111-1111-4111-8111-111111111111';
const OTHER_UUID = '22222222-2222-4222-8222-222222222222';

describe('AlunoSchema — zod migration smoke', () => {
  it('accepts a valid aluno payload with defaults applied', () => {
    const payload = {
      id: VALID_UUID,
      nomeCompleto: 'Maria da Silva',
      cpf: '12345678901',
      email: 'maria@example.com',
      telefone: '11999998888',
    };

    const result = AlunoSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.statusMatricula).toBe('ATIVA');
      expect(result.data.nivel).toBe(1);
      expect(result.data.exp).toBe(0);
      expect(result.data.streakDiasSeguidos).toBe(0);
      expect(result.data.treinosNoMes).toBe(0);
    }
  });

  it('rejects an aluno with an invalid email', () => {
    const payload = {
      id: VALID_UUID,
      nomeCompleto: 'Joao Souza',
      cpf: '12345678901',
      email: 'not-an-email',
      telefone: '11999998888',
    };

    const result = AlunoSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });

  it('rejects an aluno with a non-UUID id', () => {
    const payload = {
      id: 'not-a-uuid',
      nomeCompleto: 'Ana Pereira',
      cpf: '12345678901',
      email: 'ana@example.com',
      telefone: '11999998888',
    };

    const result = AlunoSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });
});

describe('PlanoSchema — zod migration smoke', () => {
  it('accepts a valid plano payload', () => {
    const payload = {
      id: VALID_UUID,
      nome: 'Plano Trimestral',
      preco: 299.9,
      duracaoDias: 90,
    };

    const result = PlanoSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(payload);
    }
  });

  it('coerces preco from string and accepts it', () => {
    const payload = {
      id: VALID_UUID,
      nome: 'Plano Mensal',
      preco: '149.5',
      duracaoDias: 30,
    };

    const result = PlanoSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preco).toBe(149.5);
      expect(typeof result.data.preco).toBe('number');
    }
  });

  it('rejects a plano with a non-positive duracaoDias', () => {
    const payload = {
      id: VALID_UUID,
      nome: 'Plano Invalido',
      preco: 100,
      duracaoDias: 0,
    };

    const result = PlanoSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });
});

describe('TreinoSchema — zod migration smoke', () => {
  it('accepts a valid treino with a nested exercicio', () => {
    const payload = {
      id: VALID_UUID,
      alunoId: OTHER_UUID,
      objetivo: 'Hipertrofia',
      diaSemana: 1,
      exercicios: [
        {
          id: '33333333-3333-4333-8333-333333333333',
          nomeExercicio: 'Supino Reto',
          series: 4,
          repeticoes: '10-12',
        },
      ],
    };

    const result = TreinoSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exercicios).toHaveLength(1);
      expect(result.data.exercicios[0]?.nomeExercicio).toBe('Supino Reto');
    }
  });

  it('rejects a treino with an empty exercicios array', () => {
    const payload = {
      id: VALID_UUID,
      alunoId: OTHER_UUID,
      objetivo: 'Resistencia',
      diaSemana: 2,
      exercicios: [],
    };

    const result = TreinoSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });

  it('rejects a treino with diaSemana out of range', () => {
    const payload = {
      id: VALID_UUID,
      alunoId: OTHER_UUID,
      objetivo: 'Forca',
      diaSemana: 7,
      exercicios: [
        {
          id: '44444444-4444-4444-8444-444444444444',
          nomeExercicio: 'Agachamento Livre',
          series: 5,
          repeticoes: '5',
        },
      ],
    };

    const result = TreinoSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });
});

describe('PagamentoSchema — zod migration smoke', () => {
  it('accepts a valid pagamento with PIX method', () => {
    const payload = {
      id: VALID_UUID,
      matriculaId: OTHER_UUID,
      alunoId: '55555555-5555-4555-8555-555555555555',
      valor: 199.9,
      dataPagamento: '2026-06-04T10:00:00.000Z',
      metodo: 'PIX',
    };

    const result = PagamentoSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metodo).toBe('PIX');
      expect(result.data.valor).toBe(199.9);
    }
  });

  it('rejects a pagamento with an unknown metodo', () => {
    const payload = {
      id: VALID_UUID,
      matriculaId: OTHER_UUID,
      alunoId: '55555555-5555-4555-8555-555555555555',
      valor: 199.9,
      dataPagamento: '2026-06-04T10:00:00.000Z',
      metodo: 'Criptomoeda',
    };

    const result = PagamentoSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });

  it('rejects a pagamento with a negative valor', () => {
    const payload = {
      id: VALID_UUID,
      matriculaId: OTHER_UUID,
      alunoId: '55555555-5555-4555-8555-555555555555',
      valor: -1,
      dataPagamento: '2026-06-04T10:00:00.000Z',
      metodo: 'Dinheiro',
    };

    const result = PagamentoSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });
});

describe('MatriculaSchema — zod migration smoke (5th entity)', () => {
  // The task spec mentions "Auth" alongside the four other major schemas,
  // but src/lib/definitions.ts does not currently export an Auth schema.
  // MatriculaSchema is the next most-significant financial entity
  // (1:1 with Pagamento via matriculaId) and is used here to satisfy
  // the 5-schemas x 3-payloads coverage requirement.

  it('accepts a valid matricula payload with default status', () => {
    const payload = {
      id: VALID_UUID,
      alunoId: OTHER_UUID,
      planoId: '66666666-6666-4666-8666-666666666666',
      dataInicio: '2026-06-01',
      dataVencimento: '2026-07-01',
    };

    const result = MatriculaSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ATIVA');
    }
  });

  it('accepts a matricula explicitly set to VENCIDA', () => {
    const payload = {
      id: VALID_UUID,
      alunoId: OTHER_UUID,
      planoId: '66666666-6666-4666-8666-666666666666',
      dataInicio: '2026-01-01',
      dataVencimento: '2026-02-01',
      status: 'VENCIDA',
    };

    const result = MatriculaSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('VENCIDA');
    }
  });

  it('rejects a matricula with a non-UUID alunoId', () => {
    const payload = {
      id: VALID_UUID,
      alunoId: 'abc',
      planoId: '66666666-6666-4666-8666-666666666666',
      dataInicio: '2026-06-01',
      dataVencimento: '2026-07-01',
    };

    const result = MatriculaSchema.safeParse(payload);

    expect(result.success).toBe(false);
  });
});
