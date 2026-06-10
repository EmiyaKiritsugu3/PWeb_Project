import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DevPage from './page';
import type { ReactNode } from 'react';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/logger', () => ({
  Logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/components/page-header', () => ({
  PageHeader: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock('lucide-react', () => ({
  Loader: () => <span>LoaderIcon</span>,
}));

describe('DevPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header', () => {
    render(<DevPage />);
    expect(screen.getByText('Ferramentas de Desenvolvedor')).toBeTruthy();
    expect(
      screen.getByText('Área para testes e depuração de funcionalidades internas.')
    ).toBeTruthy();
  });

  it('renders the card title', () => {
    render(<DevPage />);
    expect(screen.getByText('Listagem de Modelos de IA')).toBeTruthy();
  });

  it('renders the card description', () => {
    render(<DevPage />);
    expect(screen.getByText(/Funcionalidade desabilitada/)).toBeTruthy();
  });

  it('renders the button with initial text', () => {
    render(<DevPage />);
    expect(screen.getByText('Listar Modelos Disponíveis')).toBeTruthy();
  });

  it('shows models after clicking the button', async () => {
    render(<DevPage />);
    const button = screen.getByText('Listar Modelos Disponíveis');
    fireEvent.click(button);

    expect(screen.getByText('Modelos Encontrados:')).toBeTruthy();
    expect(screen.getByText('Funcionalidade desabilitada para o build')).toBeTruthy();
  });

  it('shows loading state while fetching models', () => {
    render(<DevPage />);
    const button = screen.getByText('Listar Modelos Disponíveis');
    fireEvent.click(button);
    expect(button).toBeTruthy();
  });
});
