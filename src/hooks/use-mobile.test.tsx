import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const listeners: Array<() => void> = [];
const mockMatchMedia = vi.fn(() => ({
  matches: false,
  addEventListener: vi.fn((_event: string, cb: () => void) => {
    listeners.push(cb);
  }),
  removeEventListener: vi.fn((_event: string, cb: () => void) => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  }),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
  media: '',
  onchange: null,
}));

import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  beforeEach(() => {
    listeners.length = 0;
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    globalThis.matchMedia = mockMatchMedia as unknown as typeof globalThis.matchMedia;
    vi.clearAllMocks();
  });

  afterEach(() => {
    listeners.length = 0;
  });

  it('returns false when viewport > 768', () => {
    Object.defineProperty(globalThis, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true when viewport < 768', () => {
    Object.defineProperty(globalThis, 'innerWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('calls matchMedia with correct breakpoint', () => {
    renderHook(() => useIsMobile());
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('updates on media query change', () => {
    Object.defineProperty(globalThis, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(globalThis, 'innerWidth', {
        value: 400,
        writable: true,
        configurable: true,
      });
      listeners.forEach((cb) => cb());
    });

    expect(result.current).toBe(true);
  });

  it('initializes as undefined (false via !!)', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe('boolean');
  });
});
