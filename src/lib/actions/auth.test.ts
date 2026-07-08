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
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
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

  it('signInWithGoogle returns redirect URL via `url` field', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url }, error: null });
    const result = await signInWithGoogle();
    expect(result.url).toBe(url);
    expect(result.error).toBeUndefined();
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    );
  });

  it('signInWithGitHub returns redirect URL via `url` field', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url }, error: null });
    const result = await signInWithGitHub();
    expect(result.url).toBe(url);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'github' })
    );
  });

  it('signInWithApple returns redirect URL via `url` field', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url }, error: null });
    const result = await signInWithApple();
    expect(result.url).toBe(url);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'apple' })
    );
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
