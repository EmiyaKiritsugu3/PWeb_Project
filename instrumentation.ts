import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Initialize Sentry
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }

  // Database Connection Heartbeat
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { prisma } = await import('./src/lib/prisma');
      // [DE] Timeout Wrapper: Ensure boot doesn't hang indefinitely
      const heartbeat = prisma.$queryRaw`SELECT 1`;
      const timeout = (ms: number) =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Database heartbeat timed out after ${ms}ms`)), ms)
        );

      await Promise.race([heartbeat, timeout(5000)]);

      // eslint-disable-next-line no-console
      console.log('✅ Database connection established successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Database connection heartbeat failed during startup:', error);
      Sentry.captureException(error);
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
