import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  dataCollection: {
    userInfo: false,
    httpHeaders: { request: false, response: false },
    cookies: false,
  },
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['cookie'];
      delete event.request.headers['authorization'];
    }
    const sensitiveKeys = ['cpf', 'rg', 'email', 'password', 'token', 'secret'];
    const scrub = (obj: unknown): unknown => {
      if (!obj || typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map((item) => scrub(item));
      const newObj: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
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
      event.breadcrumbs = event.breadcrumbs.map((b) => ({
        ...b,
        data: scrub(b.data) as Record<string, unknown>,
      }));
    }
    if (event.extra) {
      event.extra = scrub(event.extra) as Record<string, unknown>;
    }
    return event;
  },
});
