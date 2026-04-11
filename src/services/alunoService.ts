import { db } from '@/lib/dummyDb';
import { randomUUID } from 'crypto';

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  matricula: string;
}

export async function createAluno(alunoData: Omit<Aluno, 'id'>): Promise<Aluno> {
  const id = randomUUID();
  const newAluno: Aluno = { ...alunoData, id };
  const result = await db.insert('alunos', newAluno);
  return result as Aluno;
}

export async function getAluno(id: string): Promise<Aluno | null> {
  const result = await db.findById('alunos', id);
  return result as Aluno | null;
}

export async function updateAluno(
  id: string,
  updateData: Partial<Omit<Aluno, 'id'>>
): Promise<Aluno> {
  const result = await db.update('alunos', id, updateData);
  return result as Aluno;
}

export async function deleteAluno(id: string): Promise<boolean> {
  const success = await db.delete('alunos', id);
  return success;
}
