import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-separator', () => {
  const Root = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<'div'> & {
      orientation?: 'horizontal' | 'vertical';
      decorative?: boolean;
    }
  >(({ orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      data-orientation={orientation}
      data-decorative={decorative ? 'true' : undefined}
      {...props}
    />
  ));
  Root.displayName = 'Separator';
  return { Root };
});

import { Separator } from './separator';

describe('Separator', () => {
  it('renders horizontal separator by default', () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('renders vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-orientation')).toBe('vertical');
  });

  it('passes decorative attribute', () => {
    const { container } = render(<Separator decorative={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-decorative')).toBeNull();
  });

  it('passes custom className', () => {
    const { container } = render(<Separator className="my-separator" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('my-separator');
  });

  it('passes data attributes', () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toBeTruthy();
  });
});
