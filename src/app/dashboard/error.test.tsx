import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardError from './error';
describe('DashboardError', () => {
  it('shows retry button calling reset()', () => {
    const reset = vi.fn();
    render(<DashboardError error={new Error('x')} reset={reset} />);
    screen.getByRole('button', { name: /tentar novamente/i }).click();
    expect(reset).toHaveBeenCalled();
  });
});
