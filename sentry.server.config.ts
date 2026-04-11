import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Prisma instrumentation is automatic in Sentry v10+ for Prisma v6/v7
  // No additional integration required here.

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Scrub potentially sensitive data from server logs
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['cookie'];
      delete event.request.headers['authorization'];
    }
    return event;
  },
});
