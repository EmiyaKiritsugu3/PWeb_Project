import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
  });

  it('renders description when provided', () => {
    render(<PageHeader title="Alunos" description="Gerencie seus alunos" />);
    expect(screen.getByText('Gerencie seus alunos')).toBeTruthy();
  });

  it('does not render description when not provided', () => {
    render(<PageHeader title="Treinos" />);
    expect(screen.queryByRole('paragraph')).toBeNull();
  });

  it('renders actions when provided', () => {
    render(<PageHeader title="Planos" actions={<button>Novo Plano</button>} />);
    expect(screen.getByText('Novo Plano')).toBeTruthy();
  });

  it('does not render actions section when not provided', () => {
    const { container } = render(<PageHeader title="Dashboard" />);
    expect(container.querySelector('.flex-shrink-0')).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(<PageHeader title="Test" className="custom-class" />);
    expect(container.firstChild).toBeTruthy();
  });
});
