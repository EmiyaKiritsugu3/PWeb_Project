import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLoading from './loading';
describe('DashboardLoading', () => {
  it('renders overview skeleton', () => {
    render(<DashboardLoading />);
    expect(screen.getByTestId('overview-skeleton')).toBeTruthy();
  });
});
