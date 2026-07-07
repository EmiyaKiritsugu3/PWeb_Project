import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSignInWithOtp = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { signInWithOtp: mockSignInWithOtp, signInWithOAuth: mockSignInWithOAuth },
    })
  ),
}));

import { signInWithMagicLink, signInWithGoogle, signInWithGitHub, signInWithApple } from './auth';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3001';
});

describe('signInWithMagicLink', () => {
  it('rejects empty email', async () => {
    const result = await signInWithMagicLink(new FormData());
    expect(result.error).toBe('Email is required');
  });

  it('calls signInWithOtp with callback URL', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    const fd = new FormData();
    fd.append('email', 'test@example.com');
    const result = await signInWithMagicLink(fd);
    expect(result.error).toBeUndefined();
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: expect.objectContaining({
        shouldCreateUser: true,
        emailRedirectTo: expect.stringContaining('/auth/callback'),
      }),
    });
  });

  it('returns error from Supabase', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: { message: 'Rate limited' } });
    const fd = new FormData();
    fd.append('email', 'x@x.com');
    expect((await signInWithMagicLink(fd)).error).toBe('Rate limited');
  });
});

describe('OAuth providers', () => {
  const url = 'https://provider/oauth';

  it('signInWithGoogle returns redirect URL', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url }, error: null });
    expect((await signInWithGoogle()).error).toBe(url);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    );
  });

  it('signInWithGitHub returns redirect URL', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url }, error: null });
    expect((await signInWithGitHub()).error).toBe(url);
  });

  it('signInWithApple returns redirect URL', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url }, error: null });
    expect((await signInWithApple()).error).toBe(url);
  });

  it('returns Supabase error on failure', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: { message: 'Not configured' } });
    expect((await signInWithGoogle()).error).toBe('Not configured');
  });

  it('validates next param in callback URL', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url }, error: null });
    await signInWithGoogle('/dashboard');
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('%2Fdashboard'),
        }),
      })
    );
  });

  it('rejects malicious next param', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url }, error: null });
    await signInWithGoogle('https://evil.com');
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('%2Flogin'),
        }),
      })
    );
  });
});
