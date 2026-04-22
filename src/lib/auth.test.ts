import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock createClient and getUser
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
}));

import { requireRole, requireAnyRole } from './auth';
import { createClient, getUser } from '@/utils/supabase/server';
import { Logger } from '@/lib/logger';

const mockCreateClient = vi.mocked(createClient);
const mockGetUser = vi.mocked(getUser);
const mockRedirect = vi.mocked(redirect);

function buildSupabaseMock({ role, dbError = false }: { role?: string; dbError?: boolean }) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue(
            dbError
              ? { data: null, error: new Error('db error') }
              : { data: role ? { role } : null, error: null }
          ),
        }),
      }),
    }),
  };
}

describe('requireRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves without redirect when user has the correct role', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      error: null,
    });
    const supabase = buildSupabaseMock({ role: 'GERENTE' });
    mockCreateClient.mockResolvedValue(supabase as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    await requireRole('GERENTE');

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to /dashboard when user has wrong role', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      error: null,
    });
    const supabase = buildSupabaseMock({ role: 'RECEPCIONISTA' });
    mockCreateClient.mockResolvedValue(supabase as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /login when no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: null });

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to /login when Supabase auth returns an error and logs it', async () => {
    const loggerSpy = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
    const authError = new Error('auth error');
    mockGetUser.mockResolvedValue({ user: null, error: authError as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ });

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
    expect(loggerSpy).toHaveBeenCalledWith('[auth] Supabase getUser error: auth error', authError);
  });

  it('redirects to /dashboard (fail-closed) when DB query errors', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      error: null,
    });
    const supabase = buildSupabaseMock({ dbError: true });
    mockCreateClient.mockResolvedValue(supabase as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /dashboard when role is null (no funcionario record)', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      error: null,
    });
    const supabase = buildSupabaseMock({ role: undefined });
    mockCreateClient.mockResolvedValue(supabase as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});

describe('requireAnyRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves without redirect when user role is in the allowed list', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      error: null,
    });
    const supabase = buildSupabaseMock({ role: 'INSTRUTOR' });
    mockCreateClient.mockResolvedValue(supabase as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to /dashboard when user role is not in the allowed list', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      error: null,
    });
    const supabase = buildSupabaseMock({ role: 'RECEPCIONISTA' });
    mockCreateClient.mockResolvedValue(supabase as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /login when no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: null });

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to /dashboard (fail-closed) when DB query errors', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      error: null,
    });
    const supabase = buildSupabaseMock({ dbError: true });
    mockCreateClient.mockResolvedValue(supabase as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /dashboard when role is null (ALUNO — no funcionario record)', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      error: null,
    });
    const supabase = buildSupabaseMock({ role: undefined });
    mockCreateClient.mockResolvedValue(supabase as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});
