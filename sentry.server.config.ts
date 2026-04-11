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

    // Deep sanitize breadcrumbs and extra data for PII
    const sensitiveKeys = ['cpf', 'password', 'biometriaHash', 'fotoUrl', 'telefone'];
    const scrub = (obj: unknown): unknown => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(scrub);

      const newObj = { ...(obj as Record<string, unknown>) };
      for (const key in newObj) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          newObj[key] = '[SCRUBBED]';
        } else {
          newObj[key] = scrub(newObj[key]);
        }
      }
      return newObj;
    };

    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
        ...breadcrumb,
        data: scrub(breadcrumb.data),
      }));
    }

    if (event.extra) {
      event.extra = scrub(event.extra);
    }

    return event;
  },
});
