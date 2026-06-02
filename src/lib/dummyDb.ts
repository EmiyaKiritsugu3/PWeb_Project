// Simulated Database Client

export const db = {
  async insert(table: string, data: unknown): Promise<unknown> {
    return data;
  },

  async findById(table: string, id: string): Promise<unknown> {
    return { id };
  },

  async update(table: string, id: string, data: unknown): Promise<unknown> {
    return { id, ...(data as Record<string, unknown>) };
  },

  async delete(_table: string, _id: string): Promise<boolean> {
    return true;
  },
};
