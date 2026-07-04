import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardFeedback } from './card-feedback';
import type { ReactNode } from 'react';

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children, className }: { children: ReactNode; className?: string }) => (
    <h3 className={className}>{children}</h3>
  ),
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe('CardFeedback', () => {
  it('returns null when feedback is null and not loading', () => {
    const { container } = render(<CardFeedback feedback={null} isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading skeletons when isLoading is true', () => {
    render(<CardFeedback feedback={null} isLoading={true} />);
    expect(screen.getByText(/Pulsando Bio-Dados/i)).toBeTruthy();
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('renders feedback title and message when provided', () => {
    const feedback = {
      title: 'Excelente treino!',
      message: 'Você está evoluindo bem, continue assim.',
    };
    render(<CardFeedback feedback={feedback} isLoading={false} />);
    expect(screen.getByText('Excelente treino!')).toBeTruthy();
    expect(screen.getByText(/Você está evoluindo bem/)).toBeTruthy();
  });

  it('does not render loading state when feedback is provided', () => {
    const feedback = { title: 'Bom', message: 'OK' };
    render(<CardFeedback feedback={feedback} isLoading={false} />);
    expect(screen.queryByText(/Pulsando Bio-Dados/i)).toBeNull();
  });
});
