import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardMatricula } from './card-matricula';
import type { Aluno } from '@/lib/definitions';
import type { ReactNode } from 'react';

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

const baseAluno: Aluno = {
  id: '1',
  nomeCompleto: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao@example.com',
  telefone: '(11) 99999-9999',
  dataNascimento: null,
  dataCadastro: '2024-01-01',
  fotoUrl: null,
  statusMatricula: 'ATIVA',
  nivel: 1,
  exp: 0,
  streakDiasSeguidos: 0,
  treinosNoMes: 0,
  ultimoTreinoData: null,
  dataVencimento: '2026-06-15',
};

describe('CardMatricula', () => {
  it('renders null when aluno is null', () => {
    const { container } = render(<CardMatricula aluno={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders ATIVA status correctly', () => {
    render(<CardMatricula aluno={baseAluno} />);
    expect(screen.getByText('Matrícula Ativa')).toBeTruthy();
    expect(screen.getByText('Status do Plano')).toBeTruthy();
  });

  it('renders INADIMPLENTE status correctly', () => {
    const aluno = { ...baseAluno, statusMatricula: 'INADIMPLENTE' as const };
    render(<CardMatricula aluno={aluno} />);
    expect(screen.getByText('Pagamento Pendente')).toBeTruthy();
  });

  it('renders INATIVA status correctly', () => {
    const aluno = { ...baseAluno, statusMatricula: 'INATIVA' as const };
    render(<CardMatricula aluno={aluno} />);
    expect(screen.getByText('Matrícula Inativa')).toBeTruthy();
  });

  it('displays formatted expiration date', () => {
    render(<CardMatricula aluno={baseAluno} />);
    expect(screen.getByText('Vencimento')).toBeTruthy();
    const dateEl = screen.getByText((content) => content.includes('2026'));
    expect(dateEl).toBeTruthy();
  });

  it('displays fallback date when dataVencimento is null', () => {
    const aluno = { ...baseAluno, dataVencimento: null };
    render(<CardMatricula aluno={aluno} />);
    expect(screen.getByText('--/--/----')).toBeTruthy();
  });
});
