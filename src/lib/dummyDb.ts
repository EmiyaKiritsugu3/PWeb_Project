// Simulated Database Client

export const db = {
  async insert<T = unknown>(_table: string, data: T): Promise<T> {
    return data;
  },

  async findById<T = unknown>(_table: string, id: string): Promise<T | null> {
    return { id } as T | null;
  },

  async update<T = unknown>(_table: string, id: string, data: Partial<T>): Promise<T> {
    return { id, ...data } as T;
  },

  async delete(_table: string, _id: string): Promise<boolean> {
    return true;
  },
};
