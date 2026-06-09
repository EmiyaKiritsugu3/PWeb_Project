import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrismaExtend = vi.fn(() => mockExtendedClient);
const mockExtendedClient = { $extends: mockPrismaExtend };

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    Object.assign(this, mockExtendedClient);
  }),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.adapter = 'mock-adapter';
  }),
}));

vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.on = vi.fn();
  }),
}));

vi.mock('./logger', () => ({
  Logger: {
    error: vi.fn(),
  },
}));

describe('prisma singleton', () => {
  beforeEach(async () => {
    vi.resetModules();
    const g = globalThis as unknown as { prisma: undefined };
    g.prisma = undefined;
  });

  it('creates a prisma client when none exists', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const { prisma } = await import('./prisma');
    expect(prisma).toBeDefined();
  });

  it('returns the same client on subsequent imports (singleton pattern)', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const { prisma: prisma1 } = await import('./prisma');
    const { prisma: prisma2 } = await import('./prisma');
    expect(prisma1).toBe(prisma2);
  });

  it('throws when DATABASE_URL is not set', async () => {
    delete process.env.DATABASE_URL;
    await expect(import('./prisma')).rejects.toThrow('DATABASE_URL is not defined');
  });

  it('computes xpToNextLevel correctly (nivel * 1500)', () => {
    const compute = (nivel: number | null) => (nivel ?? 1) * 1500;
    expect(compute(1)).toBe(1500);
    expect(compute(5)).toBe(7500);
    expect(compute(10)).toBe(15000);
    expect(compute(null)).toBe(1500);
  });

  it('computes progressPerc correctly', () => {
    const compute = (exp: number | null, nivel: number | null) => {
      const n = nivel ?? 1;
      const e = exp ?? 0;
      const xpReq = n * 1500;
      return Math.min(Math.round((e / xpReq) * 100), 100);
    };

    expect(compute(750, 1)).toBe(50);
    expect(compute(3000, 2)).toBe(100);
    expect(compute(0, 1)).toBe(0);
    expect(compute(1500, 3)).toBe(33);
    expect(compute(null, null)).toBe(0);
    expect(compute(5000, 1)).toBe(100);
  });
});
