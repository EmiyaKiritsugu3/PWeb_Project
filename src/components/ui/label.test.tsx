import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-label', () => {
  const Root = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<'label'>>(
    ({ children, ...props }, ref) => (
      <label ref={ref} {...props}>
        {children}
      </label>
    )
  );
  Root.displayName = 'Label';
  return { Root };
});

import { Label } from './label';

describe('Label', () => {
  it('renders label element', () => {
    render(<Label data-testid="label">Email</Label>);
    expect(screen.getByTestId('label').tagName).toBe('LABEL');
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('passes custom className', () => {
    render(
      <Label className="custom-label" data-testid="label">
        Name
      </Label>
    );
    expect(screen.getByTestId('label').className).toContain('custom-label');
  });

  it('has font-medium in default class', () => {
    render(<Label data-testid="label">X</Label>);
    expect(screen.getByTestId('label').className).toContain('font-medium');
  });
});
