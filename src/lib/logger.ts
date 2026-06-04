import * as Sentry from '@sentry/nextjs';

/**
 * Sovereign Logger Utility
 * Centralizes all system logs and integrates with Sentry for error tracking.
 */
export class Logger {
  private static readonly isProduction = process.env.NODE_ENV === 'production';

  private static toRecord(value: unknown): Record<string, unknown> {
    if (typeof value !== 'object' || value === null) return {};
    // Handle Error objects whose non-enumerable properties (message, name, stack)
    // would be lost with Object.entries alone
    if (value instanceof Error) {
      return {
        message: value.message,
        name: value.name,
        stack: value.stack,
        ...Object.fromEntries(
          Object.entries(value).filter(([k]) => k !== 'message' && k !== 'name' && k !== 'stack')
        ),
      };
    }
    // Use structuredClone for plain objects, with fallback chain
    try {
      return structuredClone(value) as Record<string, unknown>;
    } catch {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([k, v]) => [
            k,
            typeof v === 'object' ? String(v) : v,
          ])
        );
      }
    }
  }

  static info(message: string, context?: unknown) {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, context || '');
    }
    // Optional: Send breadcrumb to Sentry
    Sentry.addBreadcrumb({
      category: 'log',
      message,
      level: 'info',
      data: typeof context === 'object' && context !== null ? this.toRecord(context) : {},
    });
  }

  static warn(message: string, context?: unknown) {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, context || '');
    Sentry.addBreadcrumb({
      category: 'log',
      message,
      level: 'warning',
      data: typeof context === 'object' && context !== null ? this.toRecord(context) : {},
    });
  }

  static error(message: string, error?: unknown) {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, error || '');

    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: {
          logMessage: message,
          ...(typeof error === 'object' && error !== null ? this.toRecord(error) : {}),
        },
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: { error },
      });
    }
  }

  static debug(message: string, context?: unknown) {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }
}
