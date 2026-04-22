import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock createClient
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { requireRole, requireAnyRole } from './auth';
import { createClient } from '@/utils/supabase/server';

const mockCreateClient = vi.mocked(createClient);
const mockRedirect = vi.mocked(redirect);

function buildSupabaseMock({
  userId,
  role,
  authError = false,
  dbError = false,
}: {
  userId?: string;
  role?: string;
  authError?: boolean;
  dbError?: boolean;
}) {
  return {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue(
          authError
            ? { data: { user: null }, error: new Error('auth error') }
            : { data: { user: userId ? { id: userId } : null }, error: null }
        ),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi
            .fn()
            .mockResolvedValue(
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
    const supabase = buildSupabaseMock({ userId: 'user-1', role: 'GERENTE' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireRole('GERENTE');

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to /dashboard when user has wrong role', async () => {
    const supabase = buildSupabaseMock({ userId: 'user-1', role: 'RECEPCIONISTA' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /login when no authenticated user', async () => {
    const supabase = buildSupabaseMock({ userId: undefined });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to /login when Supabase auth returns an error', async () => {
    const supabase = buildSupabaseMock({ userId: undefined, authError: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to /dashboard (fail-closed) when DB query errors', async () => {
    const supabase = buildSupabaseMock({ userId: 'user-1', dbError: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /dashboard when role is null (no funcionario record)', async () => {
    const supabase = buildSupabaseMock({ userId: 'user-1', role: undefined });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireRole('GERENTE');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});

describe('requireAnyRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves without redirect when user role is in the allowed list', async () => {
    const supabase = buildSupabaseMock({ userId: 'user-1', role: 'INSTRUTOR' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to /dashboard when user role is not in the allowed list', async () => {
    const supabase = buildSupabaseMock({ userId: 'user-1', role: 'RECEPCIONISTA' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /login when no authenticated user', async () => {
    const supabase = buildSupabaseMock({ userId: undefined });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to /dashboard (fail-closed) when DB query errors', async () => {
    const supabase = buildSupabaseMock({ userId: 'user-1', dbError: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /dashboard when role is null (ALUNO — no funcionario record)', async () => {
    const supabase = buildSupabaseMock({ userId: 'user-1', role: undefined });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase mock does not match full client type
    mockCreateClient.mockResolvedValue(supabase as any);

    await requireAnyRole(['INSTRUTOR', 'GERENTE']);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});
