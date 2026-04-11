import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PrismaPg adapter has a type mismatch with pg@8 Pool; upstream issue
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({ adapter }).$extends({
    result: {
      aluno: {
        xpToNextLevel: {
          needs: { nivel: true },
          compute(aluno) {
            return aluno.nivel * 1500;
          },
        },
        progressPerc: {
          needs: { exp: true, nivel: true },
          compute(aluno) {
            const xpReq = aluno.nivel * 1500;
            return Math.min(Math.round((aluno.exp / xpReq) * 100), 100);
          },
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
