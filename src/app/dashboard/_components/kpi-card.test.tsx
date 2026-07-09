import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from './kpi-card';
import { Users } from 'lucide-react';

describe('KpiCard', () => {
  it('renders value + delta text, not color-only', () => {
    render(<KpiCard title="Total de Alunos" value="150" delta={0.12} icon={<Users />} />);
    expect(screen.getByTestId('kpi-Total de Alunos')).toBeTruthy();
    expect(screen.getByText('150')).toBeTruthy();
    expect(screen.getByText('+12%')).toBeTruthy();
  });

  it('renders negative delta', () => {
    render(<KpiCard title="Faturamento" value="R$ 1.000" delta={-0.05} icon={<Users />} />);
    expect(screen.getByText('-5%')).toBeTruthy();
  });

  it('omits delta badge when undefined', () => {
    render(<KpiCard title="X" value="1" icon={<Users />} />);
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
