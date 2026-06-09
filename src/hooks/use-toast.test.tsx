import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from './use-toast';

vi.mock('@/components/ui/toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ToastViewport: () => null,
  Toast: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ToastTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ToastDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ToastClose: () => null,
  ToastAction: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty toasts initially', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('should have toast function', () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.toast).toBe('function');
  });

  it('should have dismiss function', () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.dismiss).toBe('function');
  });

  describe('toast function', () => {
    it('should add a toast when called', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Test Toast' });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Test Toast');
      expect(result.current.toasts[0].open).toBe(true);
    });

    it('should return an object with id, dismiss, and update', () => {
      let toastReturn: {
        id: string;
        dismiss: () => void;
        update: (props: { id: string; [key: string]: unknown }) => void;
      };

      act(() => {
        toastReturn = toast({ title: 'Return Test' }) as typeof toastReturn;
      });

      expect(toastReturn!.id).toBeDefined();
      expect(typeof toastReturn!.dismiss).toBe('function');
      expect(typeof toastReturn!.update).toBe('function');
    });

    it('should respect TOAST_LIMIT of 1', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'First Toast' });
        result.current.toast({ title: 'Second Toast' });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Second Toast');
    });

    it('should set open to true by default', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Open Toast' });
      });

      expect(result.current.toasts[0].open).toBe(true);
    });

    it('should set variant when provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Destructive', variant: 'destructive' });
      });

      expect(result.current.toasts[0].variant).toBe('destructive');
    });
  });

  describe('update', () => {
    it('should update an existing toast', () => {
      const { result } = renderHook(() => useToast());

      let toastReturn: ReturnType<typeof toast>;
      act(() => {
        toastReturn = result.current.toast({ title: 'Original' });
      });

      act(() => {
        toastReturn!.update({ id: toastReturn!.id, title: 'Updated' });
      });

      expect(result.current.toasts[0].title).toBe('Updated');
    });
  });

  describe('dismiss', () => {
    it('should set open to false when dismissing a specific toast', () => {
      const { result } = renderHook(() => useToast());

      let toastReturn: ReturnType<typeof toast>;
      act(() => {
        toastReturn = result.current.toast({ title: 'Dismiss Me' });
      });

      act(() => {
        result.current.dismiss(toastReturn!.id);
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it('should dismiss all toasts when no id is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Toast 1' });
      });

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.toasts.every((t) => t.open === false)).toBe(true);
    });
  });

  describe('toast().dismiss()', () => {
    it('should dismiss via returned dismiss function', () => {
      const { result } = renderHook(() => useToast());

      let toastReturn: ReturnType<typeof toast>;
      act(() => {
        toastReturn = result.current.toast({ title: 'Auto Dismiss' });
      });

      act(() => {
        toastReturn!.dismiss();
      });

      expect(result.current.toasts[0].open).toBe(false);
    });
  });

  describe('REMOVE_TOAST', () => {
    it('should remove a specific toast', () => {
      const { result } = renderHook(() => useToast());

      let toastReturn: ReturnType<typeof toast>;
      act(() => {
        toastReturn = result.current.toast({ title: 'Remove Me' });
      });

      act(() => {
        result.current.dismiss(toastReturn!.id);
        vi.advanceTimersByTime(1_000_001);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('onOpenChange', () => {
    it('should dismiss toast when onOpenChange is called with false', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'Close Test' });
      });

      const currentToast = result.current.toasts[0];
      act(() => {
        currentToast.onOpenChange?.(false);
      });

      expect(result.current.toasts[0].open).toBe(false);
    });
  });
});
