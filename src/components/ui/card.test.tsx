import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';

describe('Card', () => {
  it('renders with children', () => {
    render(<Card>card content</Card>);
    expect(screen.getByText('card content')).toBeTruthy();
  });

  it('applies glass class when glass prop is true', () => {
    const { container } = render(<Card glass>glass card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('glass-card');
  });

  it('renders CardHeader', () => {
    render(<CardHeader>header</CardHeader>);
    expect(screen.getByText('header')).toBeTruthy();
  });

  it('renders CardTitle', () => {
    render(<CardTitle>title</CardTitle>);
    expect(screen.getByText('title')).toBeTruthy();
  });

  it('renders CardDescription', () => {
    render(<CardDescription>desc</CardDescription>);
    expect(screen.getByText('desc')).toBeTruthy();
  });

  it('renders CardContent', () => {
    render(<CardContent>content</CardContent>);
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('renders CardFooter', () => {
    render(<CardFooter>footer</CardFooter>);
    expect(screen.getByText('footer')).toBeTruthy();
  });
});
