import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-progress', () => {
  const Root = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} role="progressbar" {...props}>
        {children}
      </div>
    )
  );
  Root.displayName = 'ProgressRoot';

  const Indicator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="indicator" {...props} />
  );
  Indicator.displayName = 'ProgressIndicator';

  return { Root, Indicator };
});

import { Progress } from './progress';

describe('Progress', () => {
  it('renders with progressbar role', () => {
    render(<Progress value={50} data-testid="progress" />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('renders indicator', () => {
    render(<Progress value={30} />);
    expect(screen.getByTestId('indicator')).toBeTruthy();
  });

  it('applies transform style based on value', () => {
    render(<Progress value={75} data-testid="progress" />);
    const indicator = screen.getByTestId('indicator');
    expect(indicator.style.transform).toBe('translateX(-25%)');
  });

  it('handles null value (defaults to 0)', () => {
    render(<Progress data-testid="progress" />);
    const indicator = screen.getByTestId('indicator');
    expect(indicator.style.transform).toBe('translateX(-100%)');
  });

  it('passes custom className', () => {
    render(<Progress value={50} className="my-progress" data-testid="progress" />);
    expect(screen.getByTestId('progress').className).toContain('my-progress');
  });
});
