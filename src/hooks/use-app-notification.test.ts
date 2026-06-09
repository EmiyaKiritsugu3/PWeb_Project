import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppNotification } from './use-app-notification';

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    toasts: [],
    dismiss: vi.fn(),
  }),
}));

vi.mock('@/lib/logger', () => ({
  Logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import { Logger } from '@/lib/logger';

describe('useAppNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success, error, and warn functions', () => {
    const { result } = renderHook(() => useAppNotification());
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.warn).toBe('function');
  });

  describe('success', () => {
    it('should call toast with title and variant default', () => {
      const { result } = renderHook(() => useAppNotification());

      act(() => result.current.success('Operation successful', 'Details here'));

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Operation successful',
        description: 'Details here',
        variant: 'default',
      });
    });

    it('should call toast with only title when no description', () => {
      const { result } = renderHook(() => useAppNotification());

      act(() => result.current.success('Done'));

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Done',
        description: undefined,
        variant: 'default',
      });
    });
  });

  describe('error', () => {
    it('should call toast with variant destructive', () => {
      const { result } = renderHook(() => useAppNotification());

      act(() => result.current.error('Something broke', 'Network error'));

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Something broke',
        description: 'Network error',
        variant: 'destructive',
      });
    });

    it('should use default description when none provided', () => {
      const { result } = renderHook(() => useAppNotification());

      act(() => result.current.error('Error'));

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    });

    it('should log original error when provided', () => {
      const { result } = renderHook(() => useAppNotification());
      const originalError = new Error('network timeout');

      act(() => result.current.error('Fail', 'Desc', originalError));

      expect(Logger.error).toHaveBeenCalledWith('[Notification] Fail: Desc', originalError);
    });

    it('should not log when originalError is not provided', () => {
      const { result } = renderHook(() => useAppNotification());

      act(() => result.current.error('Fail'));

      expect(Logger.error).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should behave the same as success (alias)', () => {
      const { result } = renderHook(() => useAppNotification());

      act(() => result.current.warn('Warning message', 'Warning details'));

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Warning message',
        description: 'Warning details',
        variant: 'default',
      });
    });
  });
});
