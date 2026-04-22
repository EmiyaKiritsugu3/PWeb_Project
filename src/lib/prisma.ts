import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Connection pooling governance
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Handle pool errors to prevent process crashes
  pool.on('error', (err) => {
    Logger.error('Unexpected error on idle database client', err);
  });

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter }).$extends({
    result: {
      aluno: {
        xpToNextLevel: {
          needs: { nivel: true },
          compute(aluno) {
            return (aluno.nivel ?? 1) * 1500;
          },
        },
        progressPerc: {
          needs: { exp: true, nivel: true },
          compute(aluno) {
            const nivel = aluno.nivel ?? 1;
            const exp = aluno.exp ?? 0;
            const xpReq = nivel * 1500;
            return Math.min(Math.round((exp / xpReq) * 100), 100);
          },
        },
      },
    },
  });

  return client;
}

export type PrismaClientExtended = ReturnType<typeof createPrismaClient>;

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
