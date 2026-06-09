import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenkit = vi.fn(() => ({ name: 'mocked-ai' }));

vi.mock('genkit', () => ({
  genkit: mockGenkit,
}));

vi.mock('@genkit-ai/google-genai', () => ({
  googleAI: vi.fn(() => 'google-ai-plugin'),
}));

describe('genkit initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('initializes genkit with googleAI plugin', async () => {
    const { ai } = await import('./genkit');
    expect(mockGenkit).toHaveBeenCalledTimes(1);
    expect(mockGenkit).toHaveBeenCalledWith(
      expect.objectContaining({
        plugins: expect.arrayContaining(['google-ai-plugin']),
      })
    );
    expect(ai).toEqual({ name: 'mocked-ai' });
  });

  it('passes GOOGLE_GENAI_API_KEY to googleAI plugin', async () => {
    process.env.GOOGLE_GENAI_API_KEY = 'test-key';
    const { googleAI } = await import('@genkit-ai/google-genai');
    await import('./genkit');

    expect(googleAI).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'test-key' }));

    delete process.env.GOOGLE_GENAI_API_KEY;
  });

  it('falls back to GEMINI_API_KEY when GOOGLE_GENAI_API_KEY is not set', async () => {
    delete process.env.GOOGLE_GENAI_API_KEY;
    process.env.GEMINI_API_KEY = 'fallback-key';
    const { googleAI } = await import('@genkit-ai/google-genai');
    await import('./genkit');

    expect(googleAI).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'fallback-key' }));

    delete process.env.GEMINI_API_KEY;
  });
});
