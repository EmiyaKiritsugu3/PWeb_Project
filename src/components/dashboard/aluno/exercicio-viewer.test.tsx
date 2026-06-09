import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExercicioViewer } from './exercicio-viewer';
import type { Exercicio } from '@/lib/definitions';
import type { ReactNode } from 'react';

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="alert-dialog" data-on-open-change={onOpenChange}>
        {children}
      </div>
    ) : null,
  AlertDialogContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  AlertDialogFooter: ({ children }: { children: ReactNode }) => <footer>{children}</footer>,
  AlertDialogCancel: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button data-testid="alert-cancel" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const mockExercicio: Exercicio = {
  id: 'ex-1',
  nomeExercicio: 'Supino Reto',
  series: 4,
  repeticoes: '12',
  observacoes: 'Manter cotovelos firmes',
  descricao: 'Deite-se em um banco reto e empurre a barra para cima.',
};

describe('ExercicioViewer', () => {
  it('returns null when exercicio is null', () => {
    const { container } = render(
      <ExercicioViewer exercicio={null} isOpen={true} onOpenChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <ExercicioViewer exercicio={mockExercicio} isOpen={false} onOpenChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders exercise name when open with exercise', () => {
    render(<ExercicioViewer exercicio={mockExercicio} isOpen={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText('Supino Reto')).toBeTruthy();
  });

  it('renders exercise description', () => {
    render(<ExercicioViewer exercicio={mockExercicio} isOpen={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText(/Deite-se em um banco reto/)).toBeTruthy();
  });

  it('shows fallback when description is empty', () => {
    const exercicio = { ...mockExercicio, descricao: '' };
    render(<ExercicioViewer exercicio={exercicio} isOpen={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText(/Nenhuma descrição disponível/)).toBeTruthy();
  });

  it('renders close button', () => {
    render(<ExercicioViewer exercicio={mockExercicio} isOpen={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText('Fechar')).toBeTruthy();
  });
});
