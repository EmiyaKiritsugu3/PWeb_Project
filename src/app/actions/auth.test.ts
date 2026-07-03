import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('zod/v4', () => {
  const actual = vi.importActual('zod/v4');
  return actual;
});

import { createClient } from '@/utils/supabase/server';

function mockSupabase(
  overrides: {
    signInError?: string;
    profileRole?: string | null;
    profileError?: { code: string } | null;
  } = {}
) {
  const mockSignIn = vi.fn().mockResolvedValue({
    data: overrides.signInError
      ? { user: null, session: null }
      : {
          user: { id: 'user-1', email: 'test@test.com' },
          session: { user: { id: 'user-1', email: 'test@test.com' } },
        },
    error: overrides.signInError ? { message: overrides.signInError } : null,
  });

  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({
    data: overrides.profileError ? null : { role: overrides.profileRole ?? null },
    error: overrides.profileError ?? null,
  });

  const mockSignOut = vi.fn().mockResolvedValue({ error: null });

  const mockSupabaseClient = {
    auth: {
      signInWithPassword: mockSignIn, // ggignore
      signOut: mockSignOut,
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
      formData.set('password', 'Test1234!');

      const result = await login(undefined, formData);
      expect(result).toEqual({ error: 'Dados inválidos. Verifique o e-mail e a senha.' });
    });

    it('returns error for short password', async () => {
      mockSupabase();
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', 'short');

      const result = await login(undefined, formData);
      expect(result).toEqual({ error: 'Dados inválidos. Verifique o e-mail e a senha.' });
    });

    it('returns error for invalid login credentials', async () => {
      mockSupabase({ signInError: 'Invalid login credentials' });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({ error: 'E-mail ou senha inválidos. Por favor, tente novamente.' });
    });

    it('returns error when session is not established', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: {
              user: { id: 'user-1', email: 'test@test.com' },
              session: null,
            },
            error: null,
          }),
          signOut: vi.fn(),
        },
      } as never);

      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({
        error: 'Erro ao estabelecer sessão. Por favor, tente novamente.',
      });
    });

    it('returns error for profile lookup failure (non-PGRST116)', async () => {
      mockSupabase({ profileError: { code: 'PGRST999' } });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({ error: 'Erro ao verificar perfil. Por favor, tente novamente.' });
    });

    it('handles PGRST116 error (no rows) for aluno gracefully', async () => {
      mockSupabase({ profileError: { code: 'PGRST116' } });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({ success: true, redirectTo: '/aluno/dashboard' });
    });

    it('returns success with redirect to /dashboard for funcionario', async () => {
      mockSupabase({ profileRole: 'GERENTE' });
      const { login } = await import('./auth');
      const formData = new FormData();
      formData.set('email', 'test@test.com');
      formData.set('password', '__TEST_PASSWORD__');

      const result = await login(undefined, formData);
      expect(result).toEqual({ success: true, redirectTo: '/dashboard' });
    });

    it('returns error for unexpected exceptions', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: {
              user: { id: 'user-1', email: 'test@test.com' },
              session: { user: { id: 'user-1', email: 'test@test.com' } },
            },
            error: null,
          }),
          signOut: vi.fn(),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockRejectedValue(new Error('Unexpected error')),
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
    it('calls signOut', async () => {
      const mockSupabaseClient = mockSupabase();
      const { logout } = await import('./auth');

      await logout();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });
  });
});
