import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

import * as Sentry from '@sentry/nextjs';
import { Logger } from './logger';

const mockAddBreadcrumb = vi.mocked(Sentry.addBreadcrumb);
const mockCaptureException = vi.mocked(Sentry.captureException);
const mockCaptureMessage = vi.mocked(Sentry.captureMessage);

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  describe('info', () => {
    it('logs to console and creates Sentry breadcrumb', () => {
      Logger.info('Server started');

      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('[INFO] Server started', '');
      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: 'log',
        message: 'Server started',
        level: 'info',
        data: {},
      });
    });

    it('passes context to Sentry breadcrumb when provided', () => {
      Logger.info('Action performed', { userId: '123', action: 'login' });

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: 'log',
        message: 'Action performed',
        level: 'info',
        data: { userId: '123', action: 'login' },
      });
    });

    it('skips console.log in production', () => {
      Object.defineProperty(Logger, 'isProduction', { value: true, configurable: true });

      Logger.info('Production message');

      // eslint-disable-next-line no-console
      expect(console.log).not.toHaveBeenCalled();
      expect(mockAddBreadcrumb).toHaveBeenCalled();

      Object.defineProperty(Logger, 'isProduction', {
        value: process.env.NODE_ENV === 'production',
        configurable: true,
      });
    });
  });

  describe('warn', () => {
    it('logs to console.warn and creates Sentry breadcrumb', () => {
      Logger.warn('Disk space low');

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith('[WARN] Disk space low', '');
      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: 'log',
        message: 'Disk space low',
        level: 'warning',
        data: {},
      });
    });

    it('includes context in breadcrumb', () => {
      Logger.warn('Memory high', { usage: '85%' });

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: 'log',
        message: 'Memory high',
        level: 'warning',
        data: { usage: '85%' },
      });
    });

    it('always logs to console (even in production)', () => {
      vi.stubEnv('NODE_ENV', 'production');

      Logger.warn('Always visible');

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalled();
      vi.unstubAllEnvs();
    });
  });

  describe('error', () => {
    it('logs to console.error', () => {
      Logger.error('Something failed');

      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalledWith('[ERROR] Something failed', '');
    });

    it('captures Error instance via Sentry.captureException', () => {
      const err = new Error('DB connection failed');
      Logger.error('DB error', err);

      expect(mockCaptureException).toHaveBeenCalledWith(err, {
        extra: {
          logMessage: 'DB error',
          message: 'DB connection failed',
          name: 'Error',
          stack: err.stack,
        },
      });
    });

    it('captures non-Error via Sentry.captureMessage', () => {
      Logger.error('String error', 'unknown failure');

      expect(mockCaptureMessage).toHaveBeenCalledWith('String error', {
        level: 'error',
        extra: { error: 'unknown failure' },
      });
    });

    it('captures when no error is provided', () => {
      Logger.error('Just a message');

      expect(mockCaptureMessage).toHaveBeenCalledWith('Just a message', {
        level: 'error',
        extra: { error: undefined },
      });
    });

    it('captures plain object errors via captureMessage', () => {
      const objError = { code: 'E001', details: 'timeout' };
      Logger.error('Obj error', objError);

      expect(mockCaptureMessage).toHaveBeenCalledWith('Obj error', {
        level: 'error',
        extra: { error: objError },
      });
    });
  });

  describe('debug', () => {
    it('logs to console.debug', () => {
      Logger.debug('Variable state', { x: 1 });

      // eslint-disable-next-line no-console
      expect(console.debug).toHaveBeenCalledWith('[DEBUG] Variable state', { x: 1 });
    });

    it('does not call Sentry', () => {
      Logger.debug('Internal trace');

      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
      expect(mockCaptureException).not.toHaveBeenCalled();
      expect(mockCaptureMessage).not.toHaveBeenCalled();
    });

    it('skips console.debug in production', () => {
      Object.defineProperty(Logger, 'isProduction', { value: true, configurable: true });

      Logger.debug('Hidden in prod');

      // eslint-disable-next-line no-console
      expect(console.debug).not.toHaveBeenCalled();

      Object.defineProperty(Logger, 'isProduction', {
        value: process.env.NODE_ENV === 'production',
        configurable: true,
      });
    });
  });
});
