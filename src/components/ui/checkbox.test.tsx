import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-checkbox', () => {
  const Root = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<'button'> & {
      checked?: boolean;
      onCheckedChange?: (checked: boolean | 'indeterminate') => void;
    }
  >(({ children, checked: initialChecked, onCheckedChange, ...props }, ref) => {
    const [checked, setChecked] = React.useState(initialChecked ?? false);
    return (
      <button
        ref={ref}
        role="checkbox"
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
  Root.displayName = 'CheckboxRoot';

  const Indicator = ({ children }: { children: React.ReactNode }) => (
    <span data-testid="indicator">{children}</span>
  );
  Indicator.displayName = 'CheckboxIndicator';

  return { Root, Indicator };
});

import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('renders without crashing', () => {
    render(<Checkbox data-testid="cb" />);
    expect(screen.getByTestId('cb')).toBeTruthy();
  });

  it('has checkbox role', () => {
    render(<Checkbox data-testid="cb" />);
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('can be checked and unchecked', () => {
    render(<Checkbox data-testid="cb" />);
    const cb = screen.getByTestId('cb');
    expect(cb.getAttribute('data-state')).toBe('unchecked');

    fireEvent.click(cb);
    expect(cb.getAttribute('data-state')).toBe('checked');
  });

  it('passes custom className', () => {
    render(<Checkbox className="my-cb" data-testid="cb" />);
    expect(screen.getByTestId('cb').className).toContain('my-cb');
  });
});
