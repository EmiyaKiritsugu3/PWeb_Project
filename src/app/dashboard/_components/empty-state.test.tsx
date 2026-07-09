import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';
import { CalendarOff } from 'lucide-react';

describe('EmptyState', () => {
  it('renders honest copy for empty dataset', () => {
    render(
      <EmptyState
        icon={<CalendarOff />}
        title="Sem histórico ainda"
        description="Sem dados para exibir."
        testId="chart-empty"
      />
    );
    expect(screen.getByTestId('chart-empty')).toBeTruthy();
    expect(screen.getByText('Sem histórico ainda')).toBeTruthy();
  });
});
