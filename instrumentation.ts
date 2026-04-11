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
      // Surgical heartbeat to verify connectivity without heavy I/O
      await prisma.$queryRaw`SELECT 1`;
      // eslint-disable-next-line no-console
      console.log('✅ Database connection established successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Database connection heartbeat failed during startup:', error);
      // We don't throw here to allow the app to boot,
      // but Sentry will capture this if it's already initialized.
      Sentry.captureException(error);
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
