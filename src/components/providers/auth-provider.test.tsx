import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SupabaseAuthProvider, useAuth } from './auth-provider';
import * as Sentry from '@sentry/nextjs';

let authStateCallback: ((event: string, session: unknown) => void) | null = null;

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}));

vi.mock('@sentry/nextjs', () => ({
  setUser: vi.fn(),
}));

function TestConsumer() {
  const { user, isUserLoading, userError, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isUserLoading)}</span>
      <span data-testid="user">{user ? user.email : 'no-user'}</span>
      <span data-testid="error">{userError ? userError.message : 'no-error'}</span>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe('SupabaseAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      authStateCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  it('provides auth context to children', async () => {
    await act(async () => {
      render(
        <SupabaseAuthProvider>
          <TestConsumer />
        </SupabaseAuthProvider>
      );
    });
    expect(screen.getByTestId('loading')).toBeTruthy();
  });

  it('starts with loading state', async () => {
    mockGetUser.mockImplementation(() => new Promise(() => {}));
    await act(async () => {
      render(
        <SupabaseAuthProvider>
          <TestConsumer />
        </SupabaseAuthProvider>
      );
    });
    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('resolves to no user when getUser returns null', async () => {
    await act(async () => {
      render(
        <SupabaseAuthProvider>
          <TestConsumer />
        </SupabaseAuthProvider>
      );
    });
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });

  it('provides user when getUser returns one', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: '1', email: 'test@test.com' } },
      error: null,
    });
    await act(async () => {
      render(
        <SupabaseAuthProvider>
          <TestConsumer />
        </SupabaseAuthProvider>
      );
    });
    expect(screen.getByTestId('user').textContent).toBe('test@test.com');
  });

  it('calls signOut correctly', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await act(async () => {
      render(
        <SupabaseAuthProvider>
          <TestConsumer />
        </SupabaseAuthProvider>
      );
    });
    await act(async () => {
      screen.getByText('Sign Out').click();
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('registers onAuthStateChange listener', async () => {
    await act(async () => {
      render(
        <SupabaseAuthProvider>
          <TestConsumer />
        </SupabaseAuthProvider>
      );
    });
    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it('calls Sentry.setUser on auth state change with user', async () => {
    await act(async () => {
      render(
        <SupabaseAuthProvider>
          <TestConsumer />
        </SupabaseAuthProvider>
      );
    });

    await act(async () => {
      authStateCallback?.('SIGNED_IN', {
        user: { id: 'u1', email: 'user@test.com' },
      });
    });

    expect(Sentry.setUser).toHaveBeenCalledWith({
      id: 'u1',
      email: 'user@test.com',
    });
  });

  it('calls Sentry.setUser(null) on auth state change without session', async () => {
    await act(async () => {
      render(
        <SupabaseAuthProvider>
          <TestConsumer />
        </SupabaseAuthProvider>
      );
    });

    await act(async () => {
      authStateCallback?.('SIGNED_OUT', null);
    });

    expect(Sentry.setUser).toHaveBeenCalledWith(null);
  });
});

describe('useAuth', () => {
  it('throws when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function BadConsumer() {
      useAuth();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useAuth must be used within a SupabaseAuthProvider.'
    );
    spy.mockRestore();
  });
});
