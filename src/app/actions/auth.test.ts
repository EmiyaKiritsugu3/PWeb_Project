import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirect to ${url}`);
  }),
}));

vi.mock('next/dist/client/components/redirect-error', () => ({
  isRedirectError: vi.fn((err: unknown) => {
    if (err instanceof Error && err.message.startsWith('Redirect to')) return true;
    return false;
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('zod/v4', () => {
  const actual = vi.importActual('zod/v4');
  return actual;
});

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

function mockSupabase(
  overrides: {
    signInError?: string;
    profileRole?: string | null;
    profileError?: { code: string } | null;
  } = {}
) {
  const mockSignIn = vi.fn().mockResolvedValue({
    data: overrides.signInError
      ? { user: null }
      : { user: { id: 'user-1', email: 'test@test.com' } },
    error: overrides.signInError ? { message: overrides.signInError } : null,
  });

  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({
    data: overrides.profileError ? null : { role: overrides.profileRole ?? null },
    error: overrides.profileError ?? null,
  });

  const mockSignOut = vi.fn().mockResolvedValue({ error: null });
  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: overrides.signInError ? null : { id: 'user-1', email: 'test@test.com' } },
    error: null,
  });

  const mockSupabaseClient = {
    auth: {
      signInWithPassword: mockSignIn, // ggignore
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })),
  };

  vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);
  return mockSupabaseClient;
}

describe('auth server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns error for invalid email format', async () => {
      mockSupabase();
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'invalid-email');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({
        error: 'Dados inválidos. Verifique o e-mail e a senha.',
      });
    });

    it('returns error for short password', async () => {
      mockSupabase();
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '123');

      const result = await login(undefined, formData);
      expect(result).toEqual({
        error: 'Dados inválidos. Verifique o e-mail e a senha.',
      });
    });

    it('returns error when Supabase auth fails', async () => {
      mockSupabase({ signInError: 'Invalid login credentials' });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({
        error: 'E-mail ou senha inválidos. Por favor, tente novamente.',
      });
    });

    it('returns redirectTo /dashboard for funcionario profile', async () => {
      mockSupabase({ profileRole: 'INSTRUTOR' });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({ redirectTo: '/dashboard' });
    });

    it('returns redirectTo /aluno/dashboard for aluno profile (no funcionario row)', async () => {
      mockSupabase({ profileError: { code: 'PGRST116' } });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'aluno@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({ redirectTo: '/aluno/dashboard' });
    });

    it('returns error when profile query has a real DB error', async () => {
      mockSupabase({ profileError: { code: '50000' } });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({
        error: 'Erro ao verificar perfil. Por favor, tente novamente.',
      });
    });

    it('returns redirectTo /aluno/dashboard for PGRST116 (no funcionario row)', async () => {
      mockSupabase({ profileError: { code: 'PGRST116' } });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'aluno@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({ redirectTo: '/aluno/dashboard' });
    });

    it('returns redirectTo /dashboard for successful GERENTE login', async () => {
      mockSupabase({ profileRole: 'GERENTE' });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'gerente@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({ redirectTo: '/dashboard' });
    });

    it('returns error for unexpected non-redirect exceptions', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockRejectedValue(new Error('DB connection lost'));

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            // ggignore
            data: { user: { id: 'user-1', email: 'test@test.com' } },
            error: null,
          }),
          signOut: vi.fn(),
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1', email: 'test@test.com' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        })),
      } as never);

      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({
        error: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      });
    });
  });

  describe('logout', () => {
    it('calls signOut and redirects to /login', async () => {
      const mockSupabaseClient = mockSupabase();
      const { logout } = await import('./auth');

      await expect(logout()).rejects.toThrow('Redirect to /login');
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });
});
