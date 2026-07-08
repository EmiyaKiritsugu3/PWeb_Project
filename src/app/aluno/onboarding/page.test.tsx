import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getUser } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import OnboardingPage from './page';

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock('next/navigation', () => ({
  redirect: (...args: [string]) => mockRedirect(...args),
}));

vi.mock('@/utils/supabase/server', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: { aluno: { findUnique: vi.fn() } },
}));

vi.mock('./onboarding-client', () => ({
  __esModule: true,
  default: () => <div data-testid="onboarding-client" />,
}));

const mockGetUser = vi.mocked(getUser);
const mockFindUnique = vi.mocked(prisma.aluno.findUnique);

describe('OnboardingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects to /aluno/login when there is no session', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: 'no session' } as never);
    await expect(OnboardingPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/aluno/login');
  });

  it('redirects to /aluno/dashboard when an aluno row already exists', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: '1', email: 'a@b.com' },
      error: null,
    } as never);
    mockFindUnique.mockResolvedValue({ id: 'existing-id' } as never);
    await expect(OnboardingPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/aluno/dashboard');
  });

  it('renders the onboarding form when no aluno row exists', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: '1', email: 'a@b.com', user_metadata: { full_name: 'A B' } },
      error: null,
    } as never);
    mockFindUnique.mockResolvedValue(null as never);
    render(await OnboardingPage());
    expect(screen.getByTestId('onboarding-client')).toBeTruthy();
  });
});
