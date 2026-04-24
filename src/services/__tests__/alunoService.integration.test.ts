import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('AlunoService Integration', () => {
  const testEmail = 'integracao@test.com';

  beforeEach(async () => {
    // Limpa o aluno de teste se ele já existir
    await prisma.aluno.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve criar um novo aluno com valores padrão de gamificação', async () => {
    const novoAluno = await prisma.aluno.create({
      data: {
        nomeCompleto: 'Aluno Integração',
        email: testEmail,
        cpf: '123.456.789-00',
        telefone: '11999999999',
      },
    });

    expect(novoAluno.email).toBe(testEmail);
    expect(novoAluno.nivel).toBe(1);
    expect(novoAluno.exp).toBe(0);
    expect(novoAluno.streakDiasSeguidos).toBe(0);
  });

  it('deve encontrar um aluno pelo email', async () => {
    await prisma.aluno.create({
      data: {
        nomeCompleto: 'Busca Teste',
        email: testEmail,
        cpf: '000.000.000-00',
      },
    });

    const aluno = await prisma.aluno.findUnique({
      where: { email: testEmail },
    });

    expect(aluno).toBeDefined();
    expect(aluno?.nomeCompleto).toBe('Busca Teste');
  });
});
