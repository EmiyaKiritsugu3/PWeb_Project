import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlunosPage from './page';

vi.mock('@/lib/data', () => ({
  getAlunos: vi.fn().mockResolvedValue([]),
  getPlanos: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/components/ui/dashboard-skeletons', () => ({
  TableSkeleton: () => <div data-testid="table-skeleton" />,
}));

vi.mock('./alunos-client', () => ({
  AlunosClient: () => <div data-testid="alunos-client" />,
}));

describe('AlunosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a container with min-h-screen', () => {
    const { container } = render(<AlunosPage />);
    expect(container.querySelector('.min-h-screen')).toBeTruthy();
  });

  it('renders the page structure with Suspense fallback', () => {
    render(<AlunosPage />);
    expect(screen.getByTestId('table-skeleton')).toBeTruthy();
  });
});
