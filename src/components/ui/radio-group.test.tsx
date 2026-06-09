import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-radio-group', () => {
  const Root = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<'div'> & { onValueChange?: (value: string) => void }
  >(({ children, onValueChange, ...props }, ref) => (
    <div ref={ref} role="radiogroup" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ onValueChange?: (v: string) => void }>,
            {
              onValueChange,
            }
          );
        }
        return child;
      })}
    </div>
  ));
  Root.displayName = 'RadioGroupRoot';

  const Item = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<'button'> & {
      value?: string;
      onValueChange?: (v: string) => void;
    }
  >(({ children, value: itemValue, onValueChange: parentOnChange, ...props }, ref) => (
    <button
      ref={ref}
      role="radio"
      aria-checked="false"
      data-value={itemValue}
      onClick={() => parentOnChange?.(itemValue ?? '')}
      {...props}
    >
      {children}
    </button>
  ));
  Item.displayName = 'RadioGroupItem';

  const Indicator = ({ children }: { children: React.ReactNode }) => (
    <span data-testid="indicator">{children}</span>
  );
  Indicator.displayName = 'RadioGroupIndicator';

  return { Root, Item, Indicator };
});

import { RadioGroup, RadioGroupItem } from './radio-group';

describe('RadioGroup components', () => {
  it('RadioGroup renders with radiogroup role', () => {
    render(
      <RadioGroup data-testid="rg">
        <RadioGroupItem value="a" />
      </RadioGroup>
    );
    expect(screen.getByTestId('rg').getAttribute('role')).toBe('radiogroup');
  });

  it('RadioGroupItem renders with radio role', () => {
    render(
      <RadioGroup defaultValue="x">
        <RadioGroupItem value="x" data-testid="ri" />
      </RadioGroup>
    );
    expect(screen.getByTestId('ri').getAttribute('role')).toBe('radio');
  });

  it('RadioGroup passes className', () => {
    render(
      <RadioGroup className="my-rg" data-testid="rg">
        <RadioGroupItem value="a" />
      </RadioGroup>
    );
    expect(screen.getByTestId('rg').className).toContain('my-rg');
  });

  it('RadioGroupItem passes className', () => {
    render(
      <RadioGroup defaultValue="b">
        <RadioGroupItem value="b" className="my-ri" data-testid="ri" />
      </RadioGroup>
    );
    expect(screen.getByTestId('ri').className).toContain('my-ri');
  });

  it('renders multiple items', () => {
    render(
      <RadioGroup defaultValue="1">
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" />
        <RadioGroupItem value="3" />
      </RadioGroup>
    );
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });
});
