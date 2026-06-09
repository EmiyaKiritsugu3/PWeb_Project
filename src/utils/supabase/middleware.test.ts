import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    })),
  })),
}));

vi.mock('next/server', () => {
  const actual = vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(({ request } = {}) => ({
        cookies: { set: vi.fn() },
        headers: request?.headers ?? new Headers(),
      })),
      redirect: vi.fn((url: URL) => ({
        redirectUrl: url.toString(),
        status: 307,
      })),
    },
  };
});

vi.mock('@/lib/constants', () => ({
  FINANCIAL_ROUTES: ['/dashboard/financeiro', '/dashboard/planos'],
}));

function createMockRequest(pathname: string) {
  const url = new URL(`http://localhost:3000${pathname}`);
  const {
    pathname: _pn,
    search: _s,
    hash: _h,
    ...urlRest
  } = {
    href: url.href,
    origin: url.origin,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
  return {
    nextUrl: {
      pathname,
      clone: () => ({ ...urlRest, pathname, search: '', hash: '' }),
      ...urlRest,
    },
    headers: new Headers(),
    cookies: {
      getAll: vi.fn(() => []),
    },
  } as unknown as NextRequest;
}

import { updateSession } from './middleware';
import { createServerClient } from '@supabase/ssr';

describe('updateSession middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupAuthMock(options: {
    user?: { id: string } | null;
    funcionario?: { role: string | null } | null;
  }) {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: options.user ?? null },
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: options.funcionario ?? null,
        }),
      })),
    };
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as never);
    return mockSupabase;
  }

  describe('non-protected routes', () => {
    it('returns next response for public routes without auth check', async () => {
      setupAuthMock({ user: null });
      const request = createMockRequest('/');
      const response = await updateSession(request);
      expect(response).toBeDefined();
    });

    it('returns next response for /login', async () => {
      setupAuthMock({ user: null });
      const request = createMockRequest('/login');
      const response = await updateSession(request);
      expect(response).toBeDefined();
    });

    it('returns next response for /aluno/login', async () => {
      setupAuthMock({ user: null });
      const request = createMockRequest('/aluno/login');
      const response = await updateSession(request);
      expect(response).toBeDefined();
    });
  });

  describe('unauthenticated users on protected routes', () => {
    it('redirects to /login when accessing /dashboard', async () => {
      setupAuthMock({ user: null });
      const request = createMockRequest('/dashboard');
      const response = await updateSession(request);
      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(response).toBeDefined();
    });

    it('redirects to /login when accessing /aluno', async () => {
      setupAuthMock({ user: null });
      const request = createMockRequest('/aluno');
      const response = await updateSession(request);
      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(response).toBeDefined();
    });
  });

  describe('funcionario accessing aluno routes', () => {
    it('redirects funcionario from /aluno to /dashboard', async () => {
      setupAuthMock({
        user: { id: 'func-1' },
        funcionario: { role: 'INSTRUTOR' },
      });
      const request = createMockRequest('/aluno/meus-treinos');
      const response = await updateSession(request);
      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(response).toBeDefined();
    });
  });

  describe('non-funcionario accessing dashboard routes', () => {
    it('redirects aluno from /dashboard to /aluno', async () => {
      setupAuthMock({
        user: { id: 'aluno-1' },
        funcionario: null,
      });
      const request = createMockRequest('/dashboard');
      const response = await updateSession(request);
      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(response).toBeDefined();
    });
  });

  describe('financial route access control', () => {
    it('redirects non-GERENTE funcionario from /dashboard/financeiro', async () => {
      setupAuthMock({
        user: { id: 'func-1' },
        funcionario: { role: 'INSTRUTOR' },
      });
      const request = createMockRequest('/dashboard/financeiro');
      const response = await updateSession(request);
      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(response).toBeDefined();
    });

    it('redirects non-GERENTE funcionario from /dashboard/planos', async () => {
      setupAuthMock({
        user: { id: 'func-1' },
        funcionario: { role: 'RECEPCIONISTA' },
      });
      const request = createMockRequest('/dashboard/planos');
      const response = await updateSession(request);
      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(response).toBeDefined();
    });

    it('allows GERENTE access to financial routes', async () => {
      setupAuthMock({
        user: { id: 'gerente-1' },
        funcionario: { role: 'GERENTE' },
      });
      const request = createMockRequest('/dashboard/financeiro');
      const response = await updateSession(request);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(response).toBeDefined();
    });
  });

  describe('authorized access', () => {
    it('allows funcionario to access /dashboard', async () => {
      setupAuthMock({
        user: { id: 'func-1' },
        funcionario: { role: 'INSTRUTOR' },
      });
      const request = createMockRequest('/dashboard');
      const response = await updateSession(request);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(response).toBeDefined();
    });

    it('allows aluno to access /aluno', async () => {
      setupAuthMock({
        user: { id: 'aluno-1' },
        funcionario: null,
      });
      const request = createMockRequest('/aluno/meus-treinos');
      const response = await updateSession(request);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(response).toBeDefined();
    });
  });

  describe('supabase client creation', () => {
    it('creates supabase client with cookie handlers', async () => {
      setupAuthMock({ user: null });
      const request = createMockRequest('/dashboard');
      await updateSession(request);
      expect(createServerClient).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(createServerClient).mock.calls[0];
      expect(callArgs[2]).toEqual(
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );
    });
  });
});
