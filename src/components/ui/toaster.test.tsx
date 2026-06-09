import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toasts: [
      {
        id: '1',
        title: 'Success',
        description: 'Saved!',
        open: true,
        onOpenChange: vi.fn(),
      },
      {
        id: '2',
        title: 'Error',
        open: true,
        onOpenChange: vi.fn(),
      },
      {
        id: '3',
        open: true,
        onOpenChange: vi.fn(),
      },
    ],
  })),
}));

vi.mock('@/components/ui/toast', () => {
  return {
    ToastProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="toast-provider">{children}</div>
    ),
    ToastViewport: () => <div data-testid="toast-viewport" />,
    Toast: ({ children, ...props }: React.ComponentPropsWithRef<'div'>) => (
      <div data-testid="toast" {...props}>
        {children}
      </div>
    ),
    ToastTitle: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="toast-title">{children}</div>
    ),
    ToastDescription: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="toast-desc">{children}</div>
    ),
    ToastClose: () => <button data-testid="toast-close">Close</button>,
  };
});

import { Toaster } from './toaster';

describe('Toaster', () => {
  it('renders provider and viewport', () => {
    render(<Toaster />);
    expect(screen.getByTestId('toast-provider')).toBeTruthy();
    expect(screen.getByTestId('toast-viewport')).toBeTruthy();
  });

  it('renders toast for each item in toasts array', () => {
    render(<Toaster />);
    const toasts = screen.getAllByTestId('toast');
    expect(toasts).toHaveLength(3);
  });

  it('renders title when provided', () => {
    render(<Toaster />);
    const titles = screen.getAllByTestId('toast-title');
    expect(titles.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Success')).toBeTruthy();
    expect(screen.getByText('Error')).toBeTruthy();
  });

  it('renders description when provided', () => {
    render(<Toaster />);
    expect(screen.getByText('Saved!')).toBeTruthy();
  });

  it('renders close button on each toast', () => {
    render(<Toaster />);
    const closeButtons = screen.getAllByTestId('toast-close');
    expect(closeButtons).toHaveLength(3);
  });
});
