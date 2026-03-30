import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAluno, getAluno, updateAluno, deleteAluno, Aluno } from './alunoService';
import { db } from '@/lib/dummyDb';

// Mock the simulated database module
vi.mock('@/lib/dummyDb', () => ({
  db: {
    insert: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Aluno Service CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an Aluno (Insert)', async () => {
    const inputData = { nome: 'João Silva', email: 'joao@example.com', matricula: '2023001' };
    const mockReturnData: Aluno = { ...inputData, id: 'mocked-123' };
    
    // Mock the db.insert to return the predicted data setup above
    vi.mocked(db.insert).mockResolvedValue(mockReturnData);

    const result = await createAluno(inputData);

    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(db.insert).toHaveBeenCalledWith('alunos', expect.objectContaining({
      nome: 'João Silva',
      email: 'joao@example.com',
      matricula: '2023001',
      id: expect.any(String)
    }));
    expect(result).toEqual(mockReturnData);
  });

  it('should get an Aluno (Read)', async () => {
    const mockAluno: Aluno = { id: 'mocked-123', nome: 'João Silva', email: 'joao@example.com', matricula: '2023001' };
    
    vi.mocked(db.findById).mockResolvedValue(mockAluno);

    const result = await getAluno('mocked-123');

    expect(db.findById).toHaveBeenCalledTimes(1);
    expect(db.findById).toHaveBeenCalledWith('alunos', 'mocked-123');
    expect(result).toEqual(mockAluno);
  });

  it('should update an Aluno (Update)', async () => {
    const updateData = { nome: 'João Pedro Silva' };
    const mockUpdatedAluno: Aluno = { id: 'mocked-123', nome: 'João Pedro Silva', email: 'joao@example.com', matricula: '2023001' };
    
    vi.mocked(db.update).mockResolvedValue(mockUpdatedAluno);

    const result = await updateAluno('mocked-123', updateData);

    expect(db.update).toHaveBeenCalledTimes(1);
    expect(db.update).toHaveBeenCalledWith('alunos', 'mocked-123', updateData);
    expect(result).toEqual(mockUpdatedAluno);
  });

  it('should delete an Aluno (Delete)', async () => {
    vi.mocked(db.delete).mockResolvedValue(true);

    const success = await deleteAluno('mocked-123');

    expect(db.delete).toHaveBeenCalledTimes(1);
    expect(db.delete).toHaveBeenCalledWith('alunos', 'mocked-123');
    expect(success).toBe(true);
  });
});
