import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  AlunoStatusEnum,
  AlunoBaseSchema,
  AlunoSchema,
  ExercicioBaseSchema,
  ExercicioSchema,
  TreinoBaseSchema,
  TreinoSchema,
  SerieExecutadaBaseSchema,
  SerieExecutadaSchema,
  HistoricoTreinoBaseSchema,
  HistoricoTreinoSchema,
  PlanoBaseSchema,
  PlanoSchema,
  MatriculaBaseSchema,
  MatriculaSchema,
  PagamentoBaseSchema,
  PagamentoSchema,
  DashboardStatsSchema,
  V_FrequenciaAlunosSchema,
} from './definitions';

import type {
  AlunoBase,
  Aluno,
  ExercicioBase,
  Exercicio,
  TreinoBase,
  Treino,
  SerieExecutadaBase,
  SerieExecutada,
  HistoricoTreinoBase,
  HistoricoTreino,
  PlanoBase,
  Plano,
  MatriculaBase,
  Matricula,
  PagamentoBase,
  Pagamento,
} from './definitions';

// --- Test Helpers ---

const UUID = '550e8400-e29b-41d4-a716-446655440000';
const UUID2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const UUID3 = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const UUID4 = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';

function validAlunoBase() {
  return {
    nomeCompleto: 'João Silva',
    cpf: '12345678901',
    email: 'joao@email.com',
    telefone: '11999998888',
  };
}

function validAluno() {
  return { ...validAlunoBase(), id: UUID };
}

function validExercicioBase() {
  return {
    nomeExercicio: 'Supino Reto',
    series: 4,
    repeticoes: '12',
  };
}

function validExercicio() {
  return { ...validExercicioBase(), id: UUID };
}

function validTreinoBase() {
  return {
    alunoId: UUID,
    objetivo: 'Hipertrofia',
    diaSemana: 1,
    exercicios: [validExercicioBase()],
    dataCriacao: '2024-01-01',
  };
}

function validTreino() {
  return { ...validTreinoBase(), id: UUID2, exercicios: [validExercicio()] };
}

function validSerieExecutadaBase() {
  return {
    serieNumero: 1,
    peso: 60,
    repeticoesFeitas: 12,
    concluido: true,
  };
}

function validSerieExecutada() {
  return { ...validSerieExecutadaBase(), id: UUID };
}

function validHistoricoTreinoBase() {
  return {
    alunoId: UUID,
    treinoId: UUID2,
    dataExecucao: '2025-01-15T10:00:00Z',
    duracaoMinutos: 45,
    exercicios: [
      {
        exercicioId: UUID3,
        nomeExercicio: 'Supino Reto',
        seriesExecutadas: [validSerieExecutadaBase()],
      },
    ],
  };
}

function validHistoricoTreino() {
  return {
    ...validHistoricoTreinoBase(),
    id: UUID4,
    exercicios: [
      {
        exercicioId: UUID3,
        nomeExercicio: 'Supino Reto',
        seriesExecutadas: [validSerieExecutada()],
      },
    ],
  };
}

function validPlanoBase() {
  return {
    nome: 'Plano Anual',
    preco: 199.9,
    duracaoDias: 365,
  };
}

function validPlano() {
  return { ...validPlanoBase(), id: UUID };
}

function validMatriculaBase() {
  return {
    alunoId: UUID,
    planoId: UUID2,
    dataInicio: '2025-01-01',
    dataVencimento: '2025-12-31',
  };
}

function validMatricula() {
  return { ...validMatriculaBase(), id: UUID3 };
}

function validPagamentoBase() {
  return {
    matriculaId: UUID,
    alunoId: UUID2,
    valor: 199.9,
    dataPagamento: '2025-01-10',
    metodo: 'PIX' as const,
  };
}

function validPagamento() {
  return { ...validPagamentoBase(), id: UUID3 };
}

// --- AlunoStatusEnum ---

describe('AlunoStatusEnum', () => {
  it('accepts ATIVA', () => {
    expect(AlunoStatusEnum.parse('ATIVA')).toBe('ATIVA');
  });

  it('accepts INADIMPLENTE', () => {
    expect(AlunoStatusEnum.parse('INADIMPLENTE')).toBe('INADIMPLENTE');
  });

  it('accepts INATIVA', () => {
    expect(AlunoStatusEnum.parse('INATIVA')).toBe('INATIVA');
  });

  it('rejects invalid status', () => {
    expect(() => AlunoStatusEnum.parse('ATIVO')).toThrow();
  });

  it('rejects empty string', () => {
    expect(() => AlunoStatusEnum.parse('')).toThrow();
  });

  it('rejects null', () => {
    expect(() => AlunoStatusEnum.parse(null)).toThrow();
  });
});

// --- AlunoBaseSchema ---

describe('AlunoBaseSchema', () => {
  it('accepts valid data with all optional fields omitted', () => {
    const result = AlunoBaseSchema.parse(validAlunoBase());
    expect(result.nomeCompleto).toBe('João Silva');
    expect(result.statusMatricula).toBe('ATIVA');
    expect(result.nivel).toBe(1);
    expect(result.exp).toBe(0);
    expect(result.streakDiasSeguidos).toBe(0);
    expect(result.treinosNoMes).toBe(0);
  });

  it('accepts all optional fields', () => {
    const data = {
      ...validAlunoBase(),
      dataNascimento: '1990-05-15',
      dataCadastro: '2025-01-01',
      fotoUrl: 'https://example.com/photo.jpg',
      biometriaHash: 'abc123',
      statusMatricula: 'INADIMPLENTE',
      nivel: 5,
      exp: 1200,
      streakDiasSeguidos: 10,
      treinosNoMes: 15,
      ultimoTreinoData: '2025-01-14',
      xpToNextLevel: 500,
      progressPerc: 75.5,
      dataVencimento: '2025-06-01',
    };
    const result = AlunoBaseSchema.parse(data);
    expect(result.fotoUrl).toBe('https://example.com/photo.jpg');
    expect(result.nivel).toBe(5);
  });

  it('accepts Date objects for date fields', () => {
    const data = {
      ...validAlunoBase(),
      dataNascimento: new Date('1990-05-15'),
      dataCadastro: new Date('2025-01-01'),
    };
    const result = AlunoBaseSchema.parse(data);
    expect(result.dataNascimento).toBeInstanceOf(Date);
  });

  it('accepts null for nullable optional fields', () => {
    const data = {
      ...validAlunoBase(),
      dataNascimento: null,
      fotoUrl: null,
      biometriaHash: null,
      ultimoTreinoData: null,
      dataVencimento: null,
    };
    const result = AlunoBaseSchema.parse(data);
    expect(result.dataNascimento).toBeNull();
    expect(result.fotoUrl).toBeNull();
  });

  it('rejects missing nomeCompleto', () => {
    const { nomeCompleto, ...rest } = validAlunoBase();
    expect(() => AlunoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects nomeCompleto shorter than 3 chars', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), nomeCompleto: 'Jo' })).toThrow();
  });

  it('rejects missing cpf', () => {
    const { cpf, ...rest } = validAlunoBase();
    expect(() => AlunoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects cpf shorter than 11 chars', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), cpf: '1234567890' })).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), email: 'not-an-email' })).toThrow();
  });

  it('rejects missing email', () => {
    const { email, ...rest } = validAlunoBase();
    expect(() => AlunoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects missing telefone', () => {
    const { telefone, ...rest } = validAlunoBase();
    expect(() => AlunoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects telefone shorter than 10 chars', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), telefone: '1199999' })).toThrow();
  });

  it('rejects invalid fotoUrl', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), fotoUrl: 'not-a-url' })).toThrow();
  });

  it('rejects invalid statusMatricula value', () => {
    expect(() =>
      AlunoBaseSchema.parse({ ...validAlunoBase(), statusMatricula: 'CANCELADA' })
    ).toThrow();
  });

  it('rejects nivel below minimum (1)', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), nivel: 0 })).toThrow();
  });

  it('rejects non-integer nivel', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), nivel: 1.5 })).toThrow();
  });

  it('rejects negative exp', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), exp: -1 })).toThrow();
  });

  it('rejects negative streakDiasSeguidos', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), streakDiasSeguidos: -1 })).toThrow();
  });

  it('rejects negative treinosNoMes', () => {
    expect(() => AlunoBaseSchema.parse({ ...validAlunoBase(), treinosNoMes: -1 })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<AlunoBase>().toHaveProperty('nomeCompleto');
    expectTypeOf<AlunoBase>().toHaveProperty('cpf');
    expectTypeOf<AlunoBase>().toHaveProperty('email');
    expectTypeOf<AlunoBase>().toHaveProperty('statusMatricula');
    expectTypeOf<AlunoBase>().toHaveProperty('nivel');
  });
});

// --- AlunoSchema ---

describe('AlunoSchema', () => {
  it('accepts valid data with id', () => {
    const result = AlunoSchema.parse(validAluno());
    expect(result.id).toBe(UUID);
    expect(result.nomeCompleto).toBe('João Silva');
  });

  it('rejects missing id', () => {
    expect(() => AlunoSchema.parse(validAlunoBase())).toThrow();
  });

  it('rejects invalid UUID for id', () => {
    expect(() => AlunoSchema.parse({ ...validAluno(), id: 'not-a-uuid' })).toThrow();
  });

  it('rejects empty id', () => {
    expect(() => AlunoSchema.parse({ ...validAluno(), id: '' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<Aluno>().toHaveProperty('id');
    expectTypeOf<Aluno>().toHaveProperty('nomeCompleto');
  });
});

// --- ExercicioBaseSchema ---

describe('ExercicioBaseSchema', () => {
  it('accepts valid data', () => {
    const result = ExercicioBaseSchema.parse(validExercicioBase());
    expect(result.nomeExercicio).toBe('Supino Reto');
    expect(result.series).toBe(4);
    expect(result.repeticoes).toBe('12');
  });

  it('accepts optional fields', () => {
    const data = {
      ...validExercicioBase(),
      observacoes: 'Foco na excêntrica',
      descricao: 'Supino com halteres',
    };
    const result = ExercicioBaseSchema.parse(data);
    expect(result.observacoes).toBe('Foco na excêntrica');
  });

  it('accepts null for nullable fields', () => {
    const data = { ...validExercicioBase(), observacoes: null, descricao: null };
    const result = ExercicioBaseSchema.parse(data);
    expect(result.observacoes).toBeNull();
  });

  it('coerces series from string to number', () => {
    const result = ExercicioBaseSchema.parse({ ...validExercicioBase(), series: '3' });
    expect(result.series).toBe(3);
  });

  it('rejects missing nomeExercicio', () => {
    const { nomeExercicio, ...rest } = validExercicioBase();
    expect(() => ExercicioBaseSchema.parse(rest)).toThrow();
  });

  it('rejects nomeExercicio shorter than 2 chars', () => {
    expect(() =>
      ExercicioBaseSchema.parse({ ...validExercicioBase(), nomeExercicio: 'A' })
    ).toThrow();
  });

  it('rejects missing series', () => {
    const { series, ...rest } = validExercicioBase();
    expect(() => ExercicioBaseSchema.parse(rest)).toThrow();
  });

  it('rejects series below 1', () => {
    expect(() => ExercicioBaseSchema.parse({ ...validExercicioBase(), series: 0 })).toThrow();
  });

  it('rejects missing repeticoes', () => {
    const { repeticoes, ...rest } = validExercicioBase();
    expect(() => ExercicioBaseSchema.parse(rest)).toThrow();
  });

  it('rejects empty repeticoes', () => {
    expect(() => ExercicioBaseSchema.parse({ ...validExercicioBase(), repeticoes: '' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<ExercicioBase>().toHaveProperty('nomeExercicio');
    expectTypeOf<ExercicioBase>().toHaveProperty('series');
    expectTypeOf<ExercicioBase>().toHaveProperty('repeticoes');
  });
});

// --- ExercicioSchema ---

describe('ExercicioSchema', () => {
  it('accepts valid data with id', () => {
    const result = ExercicioSchema.parse(validExercicio());
    expect(result.id).toBe(UUID);
  });

  it('rejects missing id', () => {
    expect(() => ExercicioSchema.parse(validExercicioBase())).toThrow();
  });

  it('rejects invalid UUID', () => {
    expect(() => ExercicioSchema.parse({ ...validExercicio(), id: 'bad-uuid' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<Exercicio>().toHaveProperty('id');
    expectTypeOf<Exercicio>().toHaveProperty('nomeExercicio');
  });
});

// --- TreinoBaseSchema ---

describe('TreinoBaseSchema', () => {
  it('accepts valid data', () => {
    const result = TreinoBaseSchema.parse(validTreinoBase());
    expect(result.alunoId).toBe(UUID);
    expect(result.objetivo).toBe('Hipertrofia');
    expect(result.exercicios).toHaveLength(1);
  });

  it('accepts data without optional fields', () => {
    const { dataCriacao, ...rest } = validTreinoBase();
    const result = TreinoBaseSchema.parse(rest);
    expect(result.alunoId).toBe(UUID);
  });

  it('accepts Date for dataCriacao', () => {
    const data = { ...validTreinoBase(), dataCriacao: new Date() };
    expect(() => TreinoBaseSchema.parse(data)).not.toThrow();
  });

  it('accepts diaSemana at boundary 0 (Domingo)', () => {
    const result = TreinoBaseSchema.parse({ ...validTreinoBase(), diaSemana: 0 });
    expect(result.diaSemana).toBe(0);
  });

  it('accepts diaSemana at boundary 6 (Sábado)', () => {
    const result = TreinoBaseSchema.parse({ ...validTreinoBase(), diaSemana: 6 });
    expect(result.diaSemana).toBe(6);
  });

  it('accepts null for diaSemana', () => {
    const result = TreinoBaseSchema.parse({ ...validTreinoBase(), diaSemana: null });
    expect(result.diaSemana).toBeNull();
  });

  it('rejects diaSemana > 6', () => {
    expect(() => TreinoBaseSchema.parse({ ...validTreinoBase(), diaSemana: 7 })).toThrow();
  });

  it('rejects diaSemana < 0', () => {
    expect(() => TreinoBaseSchema.parse({ ...validTreinoBase(), diaSemana: -1 })).toThrow();
  });

  it('rejects empty exercicios array', () => {
    expect(() => TreinoBaseSchema.parse({ ...validTreinoBase(), exercicios: [] })).toThrow();
  });

  it('rejects missing alunoId', () => {
    const { alunoId, ...rest } = validTreinoBase();
    expect(() => TreinoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects invalid alunoId UUID', () => {
    expect(() => TreinoBaseSchema.parse({ ...validTreinoBase(), alunoId: 'bad' })).toThrow();
  });

  it('rejects missing objetivo', () => {
    const { objetivo, ...rest } = validTreinoBase();
    expect(() => TreinoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects objetivo shorter than 3 chars', () => {
    expect(() => TreinoBaseSchema.parse({ ...validTreinoBase(), objetivo: 'Hi' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<TreinoBase>().toHaveProperty('alunoId');
    expectTypeOf<TreinoBase>().toHaveProperty('exercicios');
  });
});

// --- TreinoSchema ---

describe('TreinoSchema', () => {
  it('accepts valid data with id', () => {
    const result = TreinoSchema.parse(validTreino());
    expect(result.id).toBe(UUID2);
    expect(result.exercicios).toHaveLength(1);
    expect(result.exercicios[0].id).toBe(UUID);
  });

  it('accepts optional instrutorId', () => {
    const data = { ...validTreino(), instrutorId: UUID3 };
    const result = TreinoSchema.parse(data);
    expect(result.instrutorId).toBe(UUID3);
  });

  it('accepts null instrutorId', () => {
    const data = { ...validTreino(), instrutorId: null };
    const result = TreinoSchema.parse(data);
    expect(result.instrutorId).toBeNull();
  });

  it('rejects missing id', () => {
    const { id, ...rest } = validTreino();
    expect(() => TreinoSchema.parse(rest)).toThrow();
  });

  it('rejects invalid instrutorId UUID', () => {
    expect(() => TreinoSchema.parse({ ...validTreino(), instrutorId: 'bad' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<Treino>().toHaveProperty('id');
    expectTypeOf<Treino>().toHaveProperty('instrutorId');
  });
});

// --- SerieExecutadaBaseSchema ---

describe('SerieExecutadaBaseSchema', () => {
  it('accepts valid data', () => {
    const result = SerieExecutadaBaseSchema.parse(validSerieExecutadaBase());
    expect(result.serieNumero).toBe(1);
    expect(result.concluido).toBe(true);
  });

  it('applies default concluido as false', () => {
    const { concluido, ...rest } = validSerieExecutadaBase();
    const result = SerieExecutadaBaseSchema.parse(rest);
    expect(result.concluido).toBe(false);
  });

  it('accepts null peso', () => {
    const data = { ...validSerieExecutadaBase(), peso: null };
    const result = SerieExecutadaBaseSchema.parse(data);
    expect(result.peso).toBeNull();
  });

  it('accepts null repeticoesFeitas', () => {
    const data = { ...validSerieExecutadaBase(), repeticoesFeitas: null };
    const result = SerieExecutadaBaseSchema.parse(data);
    expect(result.repeticoesFeitas).toBeNull();
  });

  it('coerces peso from string', () => {
    const result = SerieExecutadaBaseSchema.parse({ ...validSerieExecutadaBase(), peso: '55.5' });
    expect(result.peso).toBe(55.5);
  });

  it('coerces repeticoesFeitas from string', () => {
    const result = SerieExecutadaBaseSchema.parse({
      ...validSerieExecutadaBase(),
      repeticoesFeitas: '10',
    });
    expect(result.repeticoesFeitas).toBe(10);
  });

  it('rejects serieNumero below 1', () => {
    expect(() =>
      SerieExecutadaBaseSchema.parse({ ...validSerieExecutadaBase(), serieNumero: 0 })
    ).toThrow();
  });

  it('rejects missing serieNumero', () => {
    const { serieNumero, ...rest } = validSerieExecutadaBase();
    expect(() => SerieExecutadaBaseSchema.parse(rest)).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<SerieExecutadaBase>().toHaveProperty('serieNumero');
    expectTypeOf<SerieExecutadaBase>().toHaveProperty('concluido');
  });
});

// --- SerieExecutadaSchema ---

describe('SerieExecutadaSchema', () => {
  it('accepts valid data with id', () => {
    const result = SerieExecutadaSchema.parse(validSerieExecutada());
    expect(result.id).toBe(UUID);
  });

  it('rejects missing id', () => {
    expect(() => SerieExecutadaSchema.parse(validSerieExecutadaBase())).toThrow();
  });

  it('rejects invalid UUID', () => {
    expect(() => SerieExecutadaSchema.parse({ ...validSerieExecutada(), id: 'bad' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<SerieExecutada>().toHaveProperty('id');
    expectTypeOf<SerieExecutada>().toHaveProperty('serieNumero');
  });
});

// --- HistoricoTreinoBaseSchema ---

describe('HistoricoTreinoBaseSchema', () => {
  it('accepts valid data', () => {
    const result = HistoricoTreinoBaseSchema.parse(validHistoricoTreinoBase());
    expect(result.alunoId).toBe(UUID);
    expect(result.duracaoMinutos).toBe(45);
    expect(result.exercicios).toHaveLength(1);
  });

  it('accepts Date for dataExecucao', () => {
    const data = { ...validHistoricoTreinoBase(), dataExecucao: new Date() };
    expect(() => HistoricoTreinoBaseSchema.parse(data)).not.toThrow();
  });

  it('rejects missing alunoId', () => {
    const { alunoId, ...rest } = validHistoricoTreinoBase();
    expect(() => HistoricoTreinoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects invalid alunoId UUID', () => {
    expect(() =>
      HistoricoTreinoBaseSchema.parse({ ...validHistoricoTreinoBase(), alunoId: 'bad' })
    ).toThrow();
  });

  it('rejects missing treinoId', () => {
    const { treinoId, ...rest } = validHistoricoTreinoBase();
    expect(() => HistoricoTreinoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects missing dataExecucao', () => {
    const { dataExecucao, ...rest } = validHistoricoTreinoBase();
    expect(() => HistoricoTreinoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects duracaoMinutos below 1', () => {
    expect(() =>
      HistoricoTreinoBaseSchema.parse({ ...validHistoricoTreinoBase(), duracaoMinutos: 0 })
    ).toThrow();
  });

  it('rejects missing exercicios', () => {
    const { exercicios, ...rest } = validHistoricoTreinoBase();
    expect(() => HistoricoTreinoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects invalid exercise UUID in nested object', () => {
    const data = {
      ...validHistoricoTreinoBase(),
      exercicios: [
        {
          exercicioId: 'bad-uuid',
          nomeExercicio: 'Supino',
          seriesExecutadas: [],
        },
      ],
    };
    expect(() => HistoricoTreinoBaseSchema.parse(data)).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<HistoricoTreinoBase>().toHaveProperty('alunoId');
    expectTypeOf<HistoricoTreinoBase>().toHaveProperty('exercicios');
  });
});

// --- HistoricoTreinoSchema ---

describe('HistoricoTreinoSchema', () => {
  it('accepts valid data with id', () => {
    const result = HistoricoTreinoSchema.parse(validHistoricoTreino());
    expect(result.id).toBe(UUID4);
    expect(result.exercicios[0].seriesExecutadas[0].id).toBe(UUID);
  });

  it('rejects missing id', () => {
    expect(() => HistoricoTreinoSchema.parse(validHistoricoTreinoBase())).toThrow();
  });

  it('rejects invalid UUID', () => {
    expect(() => HistoricoTreinoSchema.parse({ ...validHistoricoTreino(), id: 'bad' })).toThrow();
  });

  it('rejects invalid nested serie id', () => {
    const data = {
      ...validHistoricoTreino(),
      exercicios: [
        {
          exercicioId: UUID3,
          nomeExercicio: 'Supino',
          seriesExecutadas: [{ ...validSerieExecutada(), id: 'bad-uuid' }],
        },
      ],
    };
    expect(() => HistoricoTreinoSchema.parse(data)).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<HistoricoTreino>().toHaveProperty('id');
    expectTypeOf<HistoricoTreino>().toHaveProperty('exercicios');
  });
});

// --- PlanoBaseSchema ---

describe('PlanoBaseSchema', () => {
  it('accepts valid data', () => {
    const result = PlanoBaseSchema.parse(validPlanoBase());
    expect(result.nome).toBe('Plano Anual');
    expect(result.preco).toBe(199.9);
    expect(result.duracaoDias).toBe(365);
  });

  it('accepts zero preco', () => {
    const result = PlanoBaseSchema.parse({ ...validPlanoBase(), preco: 0 });
    expect(result.preco).toBe(0);
  });

  it('coerces string values to numbers', () => {
    const data = { nome: 'Plano', preco: '99.9', duracaoDias: '30' };
    const result = PlanoBaseSchema.parse(data);
    expect(result.preco).toBe(99.9);
    expect(result.duracaoDias).toBe(30);
  });

  it('rejects missing nome', () => {
    const { nome, ...rest } = validPlanoBase();
    expect(() => PlanoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects nome shorter than 2 chars', () => {
    expect(() => PlanoBaseSchema.parse({ ...validPlanoBase(), nome: 'A' })).toThrow();
  });

  it('rejects missing preco', () => {
    const { preco, ...rest } = validPlanoBase();
    expect(() => PlanoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects negative preco', () => {
    expect(() => PlanoBaseSchema.parse({ ...validPlanoBase(), preco: -10 })).toThrow();
  });

  it('rejects missing duracaoDias', () => {
    const { duracaoDias, ...rest } = validPlanoBase();
    expect(() => PlanoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects zero duracaoDias', () => {
    expect(() => PlanoBaseSchema.parse({ ...validPlanoBase(), duracaoDias: 0 })).toThrow();
  });

  it('rejects negative duracaoDias', () => {
    expect(() => PlanoBaseSchema.parse({ ...validPlanoBase(), duracaoDias: -1 })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<PlanoBase>().toHaveProperty('nome');
    expectTypeOf<PlanoBase>().toHaveProperty('preco');
    expectTypeOf<PlanoBase>().toHaveProperty('duracaoDias');
  });
});

// --- PlanoSchema ---

describe('PlanoSchema', () => {
  it('accepts valid data with id', () => {
    const result = PlanoSchema.parse(validPlano());
    expect(result.id).toBe(UUID);
  });

  it('rejects missing id', () => {
    expect(() => PlanoSchema.parse(validPlanoBase())).toThrow();
  });

  it('rejects invalid UUID', () => {
    expect(() => PlanoSchema.parse({ ...validPlano(), id: 'bad' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<Plano>().toHaveProperty('id');
    expectTypeOf<Plano>().toHaveProperty('nome');
  });
});

// --- MatriculaBaseSchema ---

describe('MatriculaBaseSchema', () => {
  it('accepts valid data with default status', () => {
    const result = MatriculaBaseSchema.parse(validMatriculaBase());
    expect(result.status).toBe('ATIVA');
  });

  it('accepts explicit status ATIVA', () => {
    const data = { ...validMatriculaBase(), status: 'ATIVA' as const };
    const result = MatriculaBaseSchema.parse(data);
    expect(result.status).toBe('ATIVA');
  });

  it('accepts explicit status VENCIDA', () => {
    const data = { ...validMatriculaBase(), status: 'VENCIDA' as const };
    const result = MatriculaBaseSchema.parse(data);
    expect(result.status).toBe('VENCIDA');
  });

  it('accepts Date objects for dates', () => {
    const data = {
      ...validMatriculaBase(),
      dataInicio: new Date('2025-01-01'),
      dataVencimento: new Date('2025-12-31'),
    };
    const result = MatriculaBaseSchema.parse(data);
    expect(result.dataInicio).toBeInstanceOf(Date);
  });

  it('rejects invalid status value', () => {
    expect(() =>
      MatriculaBaseSchema.parse({ ...validMatriculaBase(), status: 'CANCELADA' })
    ).toThrow();
  });

  it('rejects missing alunoId', () => {
    const { alunoId, ...rest } = validMatriculaBase();
    expect(() => MatriculaBaseSchema.parse(rest)).toThrow();
  });

  it('rejects missing planoId', () => {
    const { planoId, ...rest } = validMatriculaBase();
    expect(() => MatriculaBaseSchema.parse(rest)).toThrow();
  });

  it('rejects missing dataInicio', () => {
    const { dataInicio, ...rest } = validMatriculaBase();
    expect(() => MatriculaBaseSchema.parse(rest)).toThrow();
  });

  it('rejects missing dataVencimento', () => {
    const { dataVencimento, ...rest } = validMatriculaBase();
    expect(() => MatriculaBaseSchema.parse(rest)).toThrow();
  });

  it('rejects invalid UUID for alunoId', () => {
    expect(() => MatriculaBaseSchema.parse({ ...validMatriculaBase(), alunoId: 'bad' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<MatriculaBase>().toHaveProperty('alunoId');
    expectTypeOf<MatriculaBase>().toHaveProperty('status');
  });
});

// --- MatriculaSchema ---

describe('MatriculaSchema', () => {
  it('accepts valid data with id', () => {
    const result = MatriculaSchema.parse(validMatricula());
    expect(result.id).toBe(UUID3);
  });

  it('rejects missing id', () => {
    expect(() => MatriculaSchema.parse(validMatriculaBase())).toThrow();
  });

  it('rejects invalid UUID', () => {
    expect(() => MatriculaSchema.parse({ ...validMatricula(), id: 'bad' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<Matricula>().toHaveProperty('id');
    expectTypeOf<Matricula>().toHaveProperty('alunoId');
  });
});

// --- PagamentoBaseSchema ---

describe('PagamentoBaseSchema', () => {
  it('accepts valid data with metodo PIX', () => {
    const result = PagamentoBaseSchema.parse(validPagamentoBase());
    expect(result.metodo).toBe('PIX');
    expect(result.valor).toBe(199.9);
  });

  it('accepts metodo Dinheiro', () => {
    const data = { ...validPagamentoBase(), metodo: 'Dinheiro' as const };
    expect(PagamentoBaseSchema.parse(data).metodo).toBe('Dinheiro');
  });

  it('accepts metodo Cartão', () => {
    const data = { ...validPagamentoBase(), metodo: 'Cartão' as const };
    expect(PagamentoBaseSchema.parse(data).metodo).toBe('Cartão');
  });

  it('accepts zero valor', () => {
    const result = PagamentoBaseSchema.parse({ ...validPagamentoBase(), valor: 0 });
    expect(result.valor).toBe(0);
  });

  it('coerces valor from string', () => {
    const result = PagamentoBaseSchema.parse({ ...validPagamentoBase(), valor: '150' });
    expect(result.valor).toBe(150);
  });

  it('accepts Date for dataPagamento', () => {
    const data = { ...validPagamentoBase(), dataPagamento: new Date() };
    expect(() => PagamentoBaseSchema.parse(data)).not.toThrow();
  });

  it('rejects invalid metodo', () => {
    expect(() =>
      PagamentoBaseSchema.parse({ ...validPagamentoBase(), metodo: 'Boleto' })
    ).toThrow();
  });

  it('rejects negative valor', () => {
    expect(() => PagamentoBaseSchema.parse({ ...validPagamentoBase(), valor: -1 })).toThrow();
  });

  it('rejects missing matriculaId', () => {
    const { matriculaId, ...rest } = validPagamentoBase();
    expect(() => PagamentoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects missing alunoId', () => {
    const { alunoId, ...rest } = validPagamentoBase();
    expect(() => PagamentoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects missing dataPagamento', () => {
    const { dataPagamento, ...rest } = validPagamentoBase();
    expect(() => PagamentoBaseSchema.parse(rest)).toThrow();
  });

  it('rejects missing metodo', () => {
    const { metodo, ...rest } = validPagamentoBase();
    expect(() => PagamentoBaseSchema.parse(rest)).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<PagamentoBase>().toHaveProperty('metodo');
    expectTypeOf<PagamentoBase>().toHaveProperty('valor');
  });
});

// --- PagamentoSchema ---

describe('PagamentoSchema', () => {
  it('accepts valid data with id', () => {
    const result = PagamentoSchema.parse(validPagamento());
    expect(result.id).toBe(UUID3);
  });

  it('rejects missing id', () => {
    expect(() => PagamentoSchema.parse(validPagamentoBase())).toThrow();
  });

  it('rejects invalid UUID', () => {
    expect(() => PagamentoSchema.parse({ ...validPagamento(), id: 'bad' })).toThrow();
  });

  it('infers correct type', () => {
    expectTypeOf<Pagamento>().toHaveProperty('id');
    expectTypeOf<Pagamento>().toHaveProperty('metodo');
  });
});

// --- DashboardStatsSchema ---

describe('DashboardStatsSchema', () => {
  it('accepts real series + deltas, rejects synthetic crescimentoAnual', () => {
    const stats = DashboardStatsSchema.parse({
      totalAlunos: 10,
      matriculasAtivas: 8,
      alunosInadimplentes: 1,
      faturamentoMensal: 1000,
      matriculasPorMes: [{ mes: '2026-01', total: 5 }],
      receitaPorMes: [{ mes: '2026-01', total: 500 }],
      matriculasPorPlano: [{ plano: 'Bronze', total: 3 }],
      deltas: { alunos: 0.1, receita: -0.05, inadimplentes: 0, novos: 0.2 },
    });
    expect(stats.matriculasPorMes).toHaveLength(1);
    const withFake = DashboardStatsSchema.safeParse({
      crescimentoAnual: [{ mes: 'Jan', alunos: 1 }],
    });
    expect(withFake.success).toBe(false);
  });
});

// --- V_FrequenciaAlunosSchema ---

describe('V_FrequenciaAlunosSchema', () => {
  it('accepts valid data', () => {
    const result = V_FrequenciaAlunosSchema.parse({
      nomeCompleto: 'Maria Santos',
      TotalTreinos: 20,
    });
    expect(result.nomeCompleto).toBe('Maria Santos');
    expect(result.TotalTreinos).toBe(20);
  });

  it('coerces TotalTreinos from string', () => {
    const result = V_FrequenciaAlunosSchema.parse({
      nomeCompleto: 'Maria Santos',
      TotalTreinos: '20',
    });
    expect(result.TotalTreinos).toBe(20);
  });

  it('rejects missing nomeCompleto', () => {
    expect(() => V_FrequenciaAlunosSchema.parse({ TotalTreinos: 20 })).toThrow();
  });

  it('rejects missing TotalTreinos', () => {
    expect(() => V_FrequenciaAlunosSchema.parse({ nomeCompleto: 'Maria Santos' })).toThrow();
  });

  it('rejects non-numeric TotalTreinos', () => {
    expect(() =>
      V_FrequenciaAlunosSchema.parse({ nomeCompleto: 'Maria Santos', TotalTreinos: 'abc' })
    ).toThrow();
  });
});
