import { describe, it, expect, vi } from 'vitest';
import { createAluno, updateAluno, deleteAluno, getAluno } from './alunoService';
import { db } from '@/lib/dummyDb';

vi.mock('@/lib/dummyDb', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
  },
}));

describe('alunoService', () => {
  it('creates an aluno', async () => {
    const data = { nome: 'Test', email: 'test@test.com', matricula: '123' };
    vi.mocked(db.insert).mockResolvedValue({ id: 'new-id', ...data });

    const result = await createAluno(data);
    expect(result.id).toBe('new-id');
    expect(db.insert).toHaveBeenCalledWith('alunos', expect.objectContaining(data));
  });

  it('updates an aluno', async () => {
    const data = { nome: 'Updated' };
    vi.mocked(db.update).mockResolvedValue({ id: '1', ...data });

    const result = await updateAluno('1', data);
    expect(result.nome).toBe('Updated');
    expect(db.update).toHaveBeenCalledWith('alunos', '1', data);
  });

  it('gets an aluno', async () => {
    const mockAluno = { id: '1', nome: 'Test' };
    vi.mocked(db.findById).mockResolvedValue(mockAluno);

    const result = await getAluno('1');
    expect(result).toEqual(mockAluno);
    expect(db.findById).toHaveBeenCalledWith('alunos', '1');
  });

  it('deletes an aluno', async () => {
    vi.mocked(db.delete).mockResolvedValue(true);
    const result = await deleteAluno('1');
    expect(result).toBe(true);
    expect(db.delete).toHaveBeenCalledWith('alunos', '1');
  });
});
