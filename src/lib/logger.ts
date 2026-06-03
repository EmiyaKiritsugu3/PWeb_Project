import * as Sentry from '@sentry/nextjs';

/**
 * Sovereign Logger Utility
 * Centralizes all system logs and integrates with Sentry for error tracking.
 */
export class Logger {
  private static readonly isProduction = process.env.NODE_ENV === 'production';

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
      data:
        typeof context === 'object' && context !== null ? (context as Record<string, unknown>) : {},
    });
  }

  static warn(message: string, context?: unknown) {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, context || '');
    Sentry.addBreadcrumb({
      category: 'log',
      message,
      level: 'warning',
      data:
        typeof context === 'object' && context !== null ? (context as Record<string, unknown>) : {},
    });
  }

  static error(message: string, error?: unknown) {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, error || '');

    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: {
          logMessage: message,
          ...(typeof error === 'object' && error !== null
            ? (error as Record<string, unknown>)
            : {}),
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
