import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from './page';
import type { ReactNode } from 'react';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    variant,
    className,
    ...props
  }: {
    children: ReactNode;
    asChild?: boolean;
    variant?: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button className={className} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Dumbbell: () => <span>DumbbellIcon</span>,
}));

describe('LandingPage', () => {
  it('renders the academy name', () => {
    render(<LandingPage />);
    expect(screen.getByText('Academia')).toBeTruthy();
    expect(screen.getByText('Five Star')).toBeTruthy();
  });

  it('renders the hero description', () => {
    render(<LandingPage />);
    expect(
      screen.getByText(/O ambiente definitivo para alcançar seu potencial máximo/)
    ).toBeTruthy();
  });

  it('renders the "Uma Nova Era de Gestão" heading', () => {
    render(<LandingPage />);
    expect(screen.getByText('Uma Nova Era de Gestão')).toBeTruthy();
  });

  it('renders the management description', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Trazemos inteligência artificial e tecnologia de ponta/)).toBeTruthy();
  });

  it('renders the "Acessar Painel" button linking to /login', () => {
    render(<LandingPage />);
    const link = screen.getByText('Acessar Painel').closest('a');
    expect(link?.getAttribute('href')).toBe('/login');
  });

  it('renders the "Portal do Aluno" button linking to /aluno/login', () => {
    render(<LandingPage />);
    const link = screen.getByText('Portal do Aluno').closest('a');
    expect(link?.getAttribute('href')).toBe('/aluno/login');
  });

  it('renders the footer copyright', () => {
    render(<LandingPage />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText((content) => content.includes(year))).toBeTruthy();
    expect(screen.getByText((content) => content.includes('Five Star Gym System'))).toBeTruthy();
  });

  it('renders the dumbbell icon', () => {
    render(<LandingPage />);
    expect(screen.getByText('DumbbellIcon')).toBeTruthy();
  });
});
