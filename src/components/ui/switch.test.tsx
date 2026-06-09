import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-switch', () => {
  const Root = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<'button'> & {
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
    }
  >(({ children, checked: initialChecked, onCheckedChange, ...props }, ref) => {
    const [checked, setChecked] = React.useState(initialChecked ?? false);
    return (
      <button
        ref={ref}
        role="switch"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={() => {
          const next = !checked;
          setChecked(next);
          onCheckedChange?.(next);
        }}
        {...props}
      >
        {children}
      </button>
    );
  });
  Root.displayName = 'SwitchRoot';

  const Thumb = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ ...props }, ref) => <span ref={ref} data-testid="switch-thumb" {...props} />
  );
  Thumb.displayName = 'SwitchThumb';

  return { Root, Thumb };
});

import { Switch } from './switch';

describe('Switch', () => {
  it('renders without crashing', () => {
    render(<Switch data-testid="sw" />);
    expect(screen.getByTestId('sw')).toBeTruthy();
  });

  it('has switch role', () => {
    render(<Switch data-testid="sw" />);
    expect(screen.getByRole('switch')).toBeTruthy();
  });

  it('toggles on click', () => {
    render(<Switch data-testid="sw" />);
    const sw = screen.getByTestId('sw');
    expect(sw.getAttribute('data-state')).toBe('unchecked');

    fireEvent.click(sw);
    expect(sw.getAttribute('data-state')).toBe('checked');
  });

  it('renders thumb', () => {
    render(<Switch />);
    expect(screen.getByTestId('switch-thumb')).toBeTruthy();
  });

  it('passes custom className', () => {
    render(<Switch className="custom-switch" data-testid="sw" />);
    expect(screen.getByTestId('sw').className).toContain('custom-switch');
  });
});
