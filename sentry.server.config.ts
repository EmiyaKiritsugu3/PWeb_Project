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
    // Specialists: Security Auditor (Lexicon) + Senior Architect (Logic)
    const sensitiveKeys = [
      'cpf',
      'rg',
      'email',
      'password',
      'biometria',
      'biometriaHash',
      'fotoUrl',
      'telefone',
      'matricula',
      'token',
      'secret',
    ];

    const scrub = (obj: unknown, cache = new WeakSet()): unknown => {
      // Specialist Guard: Primitive/Null early exit
      if (!obj || typeof obj !== 'object') return obj;

      // Specialist Guard: Circular reference detection
      if (cache.has(obj)) return '[CIRCULAR]';
      cache.add(obj);

      if (Array.isArray(obj)) {
        return obj.map((item) => scrub(item, cache));
      }

      const newObj = { ...(obj as Record<string, unknown>) };
      for (const key in newObj) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          newObj[key] = '[SCRUBBED]';
        } else {
          newObj[key] = scrub(newObj[key], cache);
        }
      }
      return newObj;
    };

    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
        ...breadcrumb,
        // Boundary Cast: Sentry expects Record<string, any>
        data: scrub(breadcrumb.data) as Record<string, any>,
      }));
    }

    if (event.extra) {
      // Boundary Cast: Sentry expects Extras (Record<string, any>)
      event.extra = scrub(event.extra) as Record<string, any>;
    }

    return event;
  },
});
