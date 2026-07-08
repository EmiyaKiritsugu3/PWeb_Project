import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingClient from './onboarding-client';

vi.mock('@/lib/actions/onboarding', () => ({
  completeOnboardingAction: vi.fn(),
}));

vi.mock('@/hooks/use-app-notification', () => ({
  useAppNotification: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const viacepResponse = (overrides: Record<string, unknown> = {}) => ({
  json: async () => ({
    logradouro: 'Rua das Flores',
    bairro: 'Centro',
    localidade: 'Natal',
    uf: 'RN',
    ...overrides,
  }),
});

describe('OnboardingClient — ViaCEP lookup', () => {
  const originalFetch = global.fetch;
  const fetchMock = vi.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('fills endereco/bairro/cidade/estado from ViaCEP on valid CEP blur', async () => {
    fetchMock.mockResolvedValue(viacepResponse());
    render(<OnboardingClient />);

    const cepInput = screen.getByPlaceholderText('xxxxx-xxx');
    fireEvent.change(cepInput, { target: { value: '59000000' } });
    fireEvent.blur(cepInput);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rua / Avenida')).toHaveValue('Rua das Flores');
      expect(screen.getByPlaceholderText('Bairro')).toHaveValue('Centro');
      expect(screen.getByPlaceholderText('Cidade')).toHaveValue('Natal');
      expect(screen.getByPlaceholderText('SP')).toHaveValue('RN');
    });
    expect(fetchMock).toHaveBeenCalledWith('https://viacep.com.br/ws/59000000/json/');
  });

  it('leaves fields empty when ViaCEP returns erro (fallback: user types manually)', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ erro: true }),
    });
    render(<OnboardingClient />);

    const cepInput = screen.getByPlaceholderText('xxxxx-xxx');
    fireEvent.change(cepInput, { target: { value: '99999-999' } });
    fireEvent.blur(cepInput);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByPlaceholderText('Rua / Avenida')).toHaveValue('');
    expect(screen.getByPlaceholderText('Cidade')).toHaveValue('');
  });
});
