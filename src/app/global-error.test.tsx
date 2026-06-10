import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import GlobalError from './global-error';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('GlobalError', () => {
  const mockReset = vi.fn();
  const testError = new Error('Test error');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the error content', () => {
    const { container } = render(<GlobalError error={testError} reset={mockReset} />);
    expect(container.textContent).toContain('Algo deu errado no sistema!');
    expect(container.textContent).toContain('Tentar novamente');
  });

  it('has a button that calls reset', () => {
    const { container } = render(<GlobalError error={testError} reset={mockReset} />);
    const buttons = container.querySelectorAll('button');
    const resetBtn = Array.from(buttons).find((b) => b.textContent?.includes('Tentar novamente'));
    resetBtn?.click();
    expect(mockReset).toHaveBeenCalled();
  });

  it('renders error UI structure', () => {
    const { container } = render(<GlobalError error={testError} reset={mockReset} />);
    expect(container.textContent).toContain('Algo deu errado');
    expect(container.textContent).toContain('Tentar novamente');
  });
});
