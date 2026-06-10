import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateBrowserClient = vi.fn().mockReturnValue({ auth: {} });

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: (...args: unknown[]) => mockCreateBrowserClient(...args),
}));

describe('supabase client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports createClient function', async () => {
    const mod = await import('@/utils/supabase/client');
    expect(typeof mod.createClient).toBe('function');
  });

  it('createClient calls createBrowserClient', async () => {
    const { createClient } = await import('@/utils/supabase/client');
    createClient();
    expect(mockCreateBrowserClient).toHaveBeenCalled();
  });
});
