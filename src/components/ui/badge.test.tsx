import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>default</Badge>);
    const badge = screen.getByText('default');
    expect(badge.className).toContain('bg-primary');
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">secondary</Badge>);
    const badge = screen.getByText('secondary');
    expect(badge.className).toContain('bg-secondary');
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">destructive</Badge>);
    const badge = screen.getByText('destructive');
    expect(badge.className).toContain('bg-destructive');
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline">outline</Badge>);
    const badge = screen.getByText('outline');
    expect(badge.className).not.toContain('bg-');
  });
});
