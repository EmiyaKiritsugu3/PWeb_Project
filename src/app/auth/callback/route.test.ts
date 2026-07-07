import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExchangeCodeForSession = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  })),
}));

let capturedRedirectUrl: string | null = null;

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn((url: string | URL) => {
        capturedRedirectUrl = typeof url === 'string' ? url : url.toString();
        return { cookies: { set: vi.fn() }, headers: { set: vi.fn() } };
      }),
    },
  };
});

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
  capturedRedirectUrl = null;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = 'pk_test';
});

function req(url: string) {
  const u = new URL(url);
  const nextUrl = {
    clone: () => new URL(u.toString()),
    pathname: u.pathname,
    searchParams: u.searchParams,
    search: u.search,
  };
  return { nextUrl, cookies: { getAll: vi.fn().mockReturnValue([]) } } as unknown as Request;
}

describe('GET /auth/callback', () => {
  it('redirects to login when no code present', async () => {
    await GET(req('http://localhost:3001/auth/callback'));
    expect(capturedRedirectUrl).toContain('/login');
    expect(capturedRedirectUrl).toContain('error=auth_callback_failed');
  });

  it('exchanges code and redirects to validated next path', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    await GET(req('http://localhost:3001/auth/callback?code=valid&next=/aluno/dashboard'));
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid');
    expect(capturedRedirectUrl).toContain('/aluno/dashboard');
  });

  it('redirects to login on exchange failure', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: new Error('bad') });
    await GET(req('http://localhost:3001/auth/callback?code=bad&next=/dashboard'));
    expect(capturedRedirectUrl).toContain('/login');
    expect(capturedRedirectUrl).toContain('error=auth_callback_failed');
  });

  it('prevents open redirect to external URL', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    await GET(req('http://localhost:3001/auth/callback?code=ok&next=https://evil.com'));
    expect(capturedRedirectUrl).not.toContain('evil.com');
    expect(capturedRedirectUrl).toContain('/login');
  });

  it('defaults to /login when next is missing', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    await GET(req('http://localhost:3001/auth/callback?code=ok'));
    expect(capturedRedirectUrl).toContain('/login');
  });
});
