import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlanosPage from './page';

vi.mock('@/lib/auth', () => ({
  requireRole: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/definitions', () => ({
  Role: { GERENTE: 'GERENTE' },
}));

vi.mock('@/lib/data', () => ({
  getPlanos: vi.fn().mockResolvedValue([]),
}));

vi.mock('./planos-client', () => ({
  PlanosClient: () => <div data-testid="planos-client" />,
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className} data-testid="skeleton" />
  ),
}));

describe('PlanosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page with skeletons as Suspense fallback', async () => {
    render(await PlanosPage());
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls requireRole on render', async () => {
    render(await PlanosPage());
    const { requireRole } = await import('@/lib/auth');
    expect(requireRole).toHaveBeenCalled();
  });
});
