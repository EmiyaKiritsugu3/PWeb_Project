import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-toast', () => {
  const Provider = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  );
  Provider.displayName = 'ToastProvider';

  const Viewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="toast-viewport" {...props} />
  );
  Viewport.displayName = 'ToastViewport';

  const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} role="status" {...props}>
        {children}
      </div>
    )
  );
  Root.displayName = 'Toast';

  const Title = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  );
  Title.displayName = 'ToastTitle';

  const Description = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  );
  Description.displayName = 'ToastDescription';

  const Close = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children ?? '×'}
      </button>
    )
  );
  Close.displayName = 'ToastClose';

  const Action = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )
  );
  Action.displayName = 'ToastAction';

  return { Provider, Viewport, Root, Title, Description, Close, Action };
});

import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './toast';

describe('Toast components', () => {
  it('ToastProvider renders children', () => {
    render(
      <ToastProvider>
        <div>child</div>
      </ToastProvider>
    );
    expect(screen.getByText('child')).toBeTruthy();
  });

  it('ToastViewport renders', () => {
    const { container } = render(<ToastViewport />);
    expect(container.querySelector('[data-testid="toast-viewport"]')).toBeTruthy();
  });

  it('Toast renders with default variant', () => {
    render(<Toast data-testid="my-toast">Hello</Toast>);
    expect(screen.getByTestId('my-toast')).toBeTruthy();
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('ToastTitle renders text', () => {
    render(<ToastTitle>Title Text</ToastTitle>);
    expect(screen.getByText('Title Text')).toBeTruthy();
  });

  it('ToastDescription renders text', () => {
    render(<ToastDescription>Description Text</ToastDescription>);
    expect(screen.getByText('Description Text')).toBeTruthy();
  });

  it('ToastClose renders', () => {
    render(<ToastClose data-testid="close-btn" />);
    expect(screen.getByTestId('close-btn')).toBeTruthy();
  });

  it('ToastAction renders with children', () => {
    render(<ToastAction altText="Undo action">Undo</ToastAction>);
    expect(screen.getByText('Undo')).toBeTruthy();
  });

  it('Toast passes custom className', () => {
    render(
      <Toast className="custom-toast" data-testid="t">
        Hi
      </Toast>
    );
    expect(screen.getByTestId('t').className).toContain('custom-toast');
  });
});
