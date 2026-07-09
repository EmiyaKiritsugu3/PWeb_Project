import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardCharts } from './dashboard-charts';
import type { ReactNode } from 'react';

// jsdom lacks ResizeObserver and SVG layout — stub recharts to pure DOM output
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

const mockData = [
  { mes: '2026-01', total: 10 },
  { mes: '2026-02', total: 15 },
  { mes: '2026-03', total: 8 },
];

describe('DashboardCharts', () => {
  it('renders without throwing', () => {
    const { container } = render(<DashboardCharts data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('renders the chart title', () => {
    render(<DashboardCharts data={mockData} />);
    expect(screen.getByText(/Crescimento de Alunos/i)).toBeTruthy();
  });

  it('renders with empty data without throwing', () => {
    const { container } = render(<DashboardCharts data={[]} />);
    expect(container).toBeTruthy();
  });
});
