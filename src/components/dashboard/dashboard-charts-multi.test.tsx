import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardChartsMulti } from './dashboard-charts-multi';

vi.mock('@/app/dashboard/_components/empty-state', () => ({
  EmptyState: ({ title, testId }: { title: string; testId?: string }) => (
    <div data-testid={testId}>{title}</div>
  ),
}));

describe('DashboardChartsMulti', () => {
  it('renders empty-state when all series empty', () => {
    render(
      <DashboardChartsMulti matriculasPorMes={[]} receitaPorMes={[]} matriculasPorPlano={[]} />
    );
    expect(screen.getByTestId('charts-empty')).toBeTruthy();
  });

  it('renders charts with role=img when data present', () => {
    render(
      <DashboardChartsMulti
        matriculasPorMes={[{ mes: '2026-01', total: 5 }]}
        receitaPorMes={[{ mes: '2026-01', total: 500 }]}
        matriculasPorPlano={[{ plano: 'Bronze', total: 3 }]}
      />
    );
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(1);
  });
});
