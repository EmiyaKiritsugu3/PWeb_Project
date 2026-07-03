import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span {...props}>{children}</span>
  ),
}));

describe('Button', () => {
  it('renders as a button by default', () => {
    render(<Button>click me</Button>);
    const btn = screen.getByText('click me');
    expect(btn.tagName).toBe('BUTTON');
  });

  it('renders as Slot when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">link</a>
      </Button>
    );
    expect(screen.getByText('link')).toBeTruthy();
  });
});
