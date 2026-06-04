import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAlunoAction, updateAlunoAction, deleteAlunoAction } from './alunos';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Mocking dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/utils/supabase/server', () => ({
  getUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('alunos actions (CRUD Unit Tests)', () => {
  const mockAdmin = { user: { email: 'admin@nextgym.com' }, error: null };
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUser).mockResolvedValue(
      mockAdmin as unknown as Awaited<ReturnType<typeof getUser>>
    );
  });

  describe('createAlunoAction', () => {
    it('should create an aluno successfully when data is valid', async () => {
      const inputData = {
        nomeCompleto: 'José Inamar',
        cpf: '12345678900',
        email: 'jose.inamar@ufrn.edu.br',
        telefone: '84999999999',
        statusMatricula: 'ATIVA' as const,
      };

      const mockCreatedAluno = {
        id: validId,
        ...inputData,
        dataCadastro: new Date(),
        nivel: 1,
        exp: 0,
        streakDiasSeguidos: 0,
        treinosNoMes: 0,
      };

      vi.mocked(prisma.aluno.create).mockResolvedValue(
        mockCreatedAluno as unknown as Awaited<ReturnType<typeof prisma.aluno.create>>
      );

      const result = await createAlunoAction(inputData);

      expect(result).toMatchObject({ success: true, data: { id: validId } });
      expect(prisma.aluno.create).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/alunos');
    });

    it('should return error if unauthorized', async () => {
      vi.mocked(getUser).mockResolvedValue({ user: null, error: null } as unknown as Awaited<
        ReturnType<typeof getUser>
      >);
      const result = await createAlunoAction({} as Parameters<typeof createAlunoAction>[0]);
      expect(result).toEqual({ success: false, error: 'Usuário não autenticado' });
    });
  });

  describe('updateAlunoAction', () => {
    it('should update an aluno successfully', async () => {
      const updateData = { nomeCompleto: 'José Inamar Silva' };
      const mockUpdatedAluno = {
        id: validId,
        nomeCompleto: 'José Inamar Silva',
        cpf: '12345678900',
        email: 'jose.inamar@ufrn.edu.br',
        telefone: '84999999999',
        statusMatricula: 'ATIVA' as const,
        dataCadastro: new Date(),
      };

      vi.mocked(prisma.aluno.update).mockResolvedValue(
        mockUpdatedAluno as unknown as Awaited<ReturnType<typeof prisma.aluno.update>>
      );

      const result = await updateAlunoAction(validId, updateData);

      expect(result).toMatchObject({
        success: true,
        data: { nomeCompleto: 'José Inamar Silva' },
      });
      expect(prisma.aluno.update).toHaveBeenCalledWith({
        where: { id: validId },
        data: expect.objectContaining({ nomeCompleto: 'José Inamar Silva' }),
      });
    });

    it('should return error if unauthorized', async () => {
      vi.mocked(getUser).mockResolvedValue({ user: null, error: null } as unknown as Awaited<
        ReturnType<typeof getUser>
      >);
      const result = await updateAlunoAction(validId, { nomeCompleto: 'Novo Nome' });
      expect(result).toEqual({ success: false, error: 'Usuário não autenticado' });
      expect(prisma.aluno.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteAlunoAction', () => {
    it('should delete an aluno successfully', async () => {
      const result = await deleteAlunoAction(validId);

      expect(result).toEqual({ success: true });
      expect(prisma.aluno.delete).toHaveBeenCalledWith({
        where: { id: validId },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/alunos');
    });

    it('should return error if unauthorized', async () => {
      vi.mocked(getUser).mockResolvedValue({ user: null, error: null } as unknown as Awaited<
        ReturnType<typeof getUser>
      >);
      const result = await deleteAlunoAction(validId);
      expect(result).toEqual({ success: false, error: 'Usuário não autenticado' });
      expect(prisma.aluno.delete).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
