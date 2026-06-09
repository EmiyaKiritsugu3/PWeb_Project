import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@/components/ui/premium-skeleton', () => {
  const PremiumSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="premium-skeleton" className={className} {...props} />
  );
  return { PremiumSkeleton };
});

import { TableSkeleton, FinanceiroSkeleton } from './dashboard-skeletons';

describe('TableSkeleton', () => {
  it('renders without crashing', () => {
    render(<TableSkeleton />);
    expect(screen.getAllByTestId('premium-skeleton').length).toBeGreaterThan(0);
  });

  it('renders multiple skeleton rows', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.querySelectorAll('[data-testid="premium-skeleton"]').length).toBeGreaterThan(
      10
    );
  });
});

describe('FinanceiroSkeleton', () => {
  it('renders without crashing', () => {
    render(<FinanceiroSkeleton />);
    expect(screen.getAllByTestId('premium-skeleton').length).toBeGreaterThan(0);
  });

  it('renders 3 skeletons (title, subtitle, chart)', () => {
    render(<FinanceiroSkeleton />);
    expect(screen.getAllByTestId('premium-skeleton')).toHaveLength(3);
  });
});
