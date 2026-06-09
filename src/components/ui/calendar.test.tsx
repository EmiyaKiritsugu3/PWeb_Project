import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-day-picker', () => ({
  DayPicker: ({ onSelect, ...props }: Record<string, unknown>) => (
    <div data-slot="DayPicker" {...props}>
      <button
        onClick={() =>
          (onSelect as ((day: Date | undefined) => void) | undefined)?.(new Date(2025, 0, 15))
        }
      >
        Jan 15
      </button>
      <button
        onClick={() =>
          (onSelect as ((day: Date | undefined) => void) | undefined)?.(new Date(2025, 1, 1))
        }
      >
        Feb 1
      </button>
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  buttonVariants: (opts?: { variant?: string }) => `btn-variant-${opts?.variant || 'default'}`,
}));

import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders without throwing', () => {
    const { container } = render(<Calendar />);
    expect(container).toBeTruthy();
  });

  it('renders DayPicker', () => {
    render(<Calendar />);
    expect(screen.getByRole('button', { name: 'Jan 15' })).toBeTruthy();
  });

  it('passes onSelect callback', () => {
    const onSelect = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<Calendar {...({ onSelect } as any)} />);
    fireEvent.click(screen.getByText('Jan 15'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<Calendar className="my-calendar" data-testid="cal" />);
    expect(screen.getByTestId('cal')).toHaveClass('my-calendar');
  });

  it('passes showOutsideDays prop', () => {
    render(<Calendar showOutsideDays={false} />);
    expect(screen.getByRole('button', { name: 'Jan 15' })).toBeTruthy();
  });
});
