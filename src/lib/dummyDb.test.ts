import { describe, it, expect } from 'vitest';
import { db } from './dummyDb';

describe('dummyDb', () => {
  describe('insert', () => {
    it('returns the inserted data', async () => {
      const data = { name: 'Test User', email: 'test@test.com' };
      const result = await db.insert('users', data);
      expect(result).toEqual(data);
    });

    it('works with string data', async () => {
      const result = await db.insert('logs', 'log entry');
      expect(result).toBe('log entry');
    });

    it('works with number data', async () => {
      const result = await db.insert('counters', 42);
      expect(result).toBe(42);
    });

    it('works with array data', async () => {
      const data = [1, 2, 3];
      const result = await db.insert('lists', data);
      expect(result).toEqual([1, 2, 3]);
    });

    it('works with empty object', async () => {
      const result = await db.insert('empty', {});
      expect(result).toEqual({});
    });
  });

  describe('findById', () => {
    it('returns object with id field', async () => {
      const result = await db.findById<{ id: string }>('users', 'abc-123');
      expect(result).toEqual({ id: 'abc-123' });
    });

    it('returns object with string id', async () => {
      const result = await db.findById<{ id: string }>('users', 'user-42');
      expect(result?.id).toBe('user-42');
    });

    it('works with any table name', async () => {
      const result = await db.findById<{ id: string }>('any_table', 'id-1');
      expect(result).toEqual({ id: 'id-1' });
    });
  });

  describe('update', () => {
    it('merges id with partial data', async () => {
      const result = await db.update<{ id: string; name: string }>('users', 'abc-123', {
        name: 'Updated',
      });
      expect(result).toEqual({ id: 'abc-123', name: 'Updated' });
    });

    it('overwrites existing fields', async () => {
      const result = await db.update<{ id: string; name: string }>('users', 'abc-123', {
        id: 'different-id',
        name: 'Test',
      });
      expect(result.id).toBe('different-id');
      expect(result.name).toBe('Test');
    });

    it('returns just id when data is empty', async () => {
      const result = await db.update('users', 'abc-123', {});
      expect(result).toEqual({ id: 'abc-123' });
    });

    it('handles partial updates with multiple fields', async () => {
      const result = await db.update<{ id: string; a: number; b: number }>('t', '1', {
        a: 10,
        b: 20,
      });
      expect(result).toEqual({ id: '1', a: 10, b: 20 });
    });
  });

  describe('delete', () => {
    it('returns true on delete', async () => {
      const result = await db.delete('users', 'abc-123');
      expect(result).toBe(true);
    });

    it('returns true for any id', async () => {
      const result = await db.delete('users', 'any-id');
      expect(result).toBe(true);
    });

    it('returns true for any table', async () => {
      const result = await db.delete('any_table', 'any-id');
      expect(result).toBe(true);
    });
  });
});
