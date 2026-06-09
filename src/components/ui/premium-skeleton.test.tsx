import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PremiumSkeleton } from './premium-skeleton';

describe('PremiumSkeleton', () => {
  it('renders a div', () => {
    render(<PremiumSkeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton').tagName).toBe('DIV');
  });

  it('has animate-pulse class', () => {
    render(<PremiumSkeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton').className).toContain('animate-pulse');
  });

  it('passes custom className', () => {
    render(<PremiumSkeleton className="h-10 w-50" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.className).toContain('h-10');
    expect(el.className).toContain('w-50');
  });

  it('passes extra props', () => {
    render(<PremiumSkeleton data-testid="skeleton" role="img" />);
    expect(screen.getByTestId('skeleton').getAttribute('role')).toBe('img');
  });
});
