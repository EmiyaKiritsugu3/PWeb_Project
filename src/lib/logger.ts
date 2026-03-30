const isProduction = process.env.NODE_ENV === 'production';

/**
 * A simple structured logger utility.
 * In production, it outputs JSON strings for better log aggregation.
 * In development, it outputs human-readable logs.
 */
export const logger = {
  info: (message: string, data?: unknown) => {
    if (isProduction) {
      console.info(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        data,
      }));
    } else {
      console.info(`[INFO] ${message}`, data ?? '');
    }
  },

  warn: (message: string, data?: unknown) => {
    if (isProduction) {
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        data,
      }));
    } else {
      console.warn(`[WARN] ${message}`, data ?? '');
    }
  },

  error: (message: string, error?: unknown) => {
    if (isProduction) {
      const errorData = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        ...error
      } : error;

      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        error: errorData,
      }));
    } else {
      console.error(`[ERROR] ${message}`, error ?? '');
    }
  },
};
