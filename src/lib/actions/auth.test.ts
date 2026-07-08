import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

describe('callbackUrl tier resolution', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
  });

  it('tier 1: uses NEXT_PUBLIC_APP_URL when set and non-empty', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com';
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    mockSignInWithOtp.mockResolvedValue({ error: null });
    const fd = new FormData();
    fd.append('email', 'test@example.com');
    await signInWithMagicLink(fd);
    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining('https://myapp.com/auth/callback'),
        }),
      })
    );
  });

  it('tier 1: trims whitespace from NEXT_PUBLIC_APP_URL', async () => {
    process.env.NEXT_PUBLIC_APP_URL = '  https://myapp.com  ';
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    mockSignInWithOtp.mockResolvedValue({ error: null });
    const fd = new FormData();
    fd.append('email', 'test@example.com');
    await signInWithMagicLink(fd);
    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining('https://myapp.com/auth/callback'),
        }),
      })
    );
  });

  it('tier 1: empty NEXT_PUBLIC_APP_URL="" falls to NEXT_PUBLIC_VERCEL_URL (explicit||null → null)', async () => {
    process.env.NEXT_PUBLIC_APP_URL = '';
    process.env.NEXT_PUBLIC_VERCEL_URL = 'preview.vercel.app';
    mockSignInWithOtp.mockResolvedValue({ error: null });
    const fd = new FormData();
    fd.append('email', 'test@example.com');
    await signInWithMagicLink(fd);
    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining('https://preview.vercel.app/auth/callback'),
        }),
      })
    );
  });

  it('tier 2: uses NEXT_PUBLIC_VERCEL_URL when NEXT_PUBLIC_APP_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_VERCEL_URL = 'preview.vercel.app';
    mockSignInWithOtp.mockResolvedValue({ error: null });
    const fd = new FormData();
    fd.append('email', 'test@example.com');
    await signInWithMagicLink(fd);
    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining('https://preview.vercel.app/auth/callback'),
        }),
      })
    );
  });

  it('tier 3: falls to localhost:3000 when both unset', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    mockSignInWithOtp.mockResolvedValue({ error: null });
    const fd = new FormData();
    fd.append('email', 'test@example.com');
    await signInWithMagicLink(fd);
    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining('http://localhost:3000/auth/callback'),
        }),
      })
    );
  });
});
