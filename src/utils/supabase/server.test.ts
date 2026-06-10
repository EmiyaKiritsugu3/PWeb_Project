import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetAll = vi.fn();
const mockCookieStore = { getAll: mockGetAll, set: vi.fn() };
const mockGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
  }),
  createBrowserClient: vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

vi.mock('@sentry/nextjs', () => ({
  setUser: vi.fn(),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

describe('supabase server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClient', () => {
    it('creates a server client with cookies', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const client = await createClient();
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
    });

    it('handles setAll with valid cookies', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      await createClient();

      const { createServerClient } = await import('@supabase/ssr');
      const config = vi.mocked(createServerClient).mock.calls[0][2] as {
        cookies: {
          getAll: () => unknown[];
          setAll: (cookies: { name: string; value: string; options: unknown }[]) => void;
        };
      };

      config.cookies.setAll([{ name: 'token', value: 'abc', options: { path: '/' } }]);

      expect(mockCookieStore.set).toHaveBeenCalledWith('token', 'abc', { path: '/' });
    });

    it('handles setAll errors silently', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      await createClient();

      const { createServerClient } = await import('@supabase/ssr');
      const config = vi.mocked(createServerClient).mock.calls[0][2] as unknown as {
        cookies: {
          setAll: (cookies: { name: string; value: string; options: unknown }[]) => void;
        };
      };

      vi.mocked(mockCookieStore.set).mockImplementation(() => {
        throw new Error('Server Component');
      });

      expect(() => config.cookies.setAll([{ name: 'x', value: 'y', options: {} }])).not.toThrow();
    });
  });

  describe('getUser', () => {
    it('returns user and sets Sentry user', async () => {
      const mockUser = { id: 'u1', email: 'test@test.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const { getUser } = await import('@/utils/supabase/server');
      const result = await getUser();

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('clears Sentry user when no user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const { getUser } = await import('@/utils/supabase/server');
      const result = await getUser();

      expect(result.user).toBeNull();
    });

    it('returns error when getUser fails', async () => {
      const authError = { message: 'Auth error' };
      mockGetUser.mockResolvedValue({ data: { user: null }, error: authError });

      const { getUser } = await import('@/utils/supabase/server');
      const result = await getUser();

      expect(result.error).toEqual(authError);
      expect(result.user).toBeNull();
    });
  });
});
