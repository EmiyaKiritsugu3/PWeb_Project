import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-scroll-area', () => {
  const Root = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-slot="ScrollAreaRoot" {...props}>
        {children}
      </div>
    )
  );
  Root.displayName = 'ScrollAreaRoot';

  const Viewport = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-slot="ScrollAreaViewport" {...props}>
        {children}
      </div>
    )
  );
  Viewport.displayName = 'ScrollAreaViewport';

  const Scrollbar = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-slot="ScrollAreaScrollbar" {...props}>
        {children}
      </div>
    )
  );
  Scrollbar.displayName = 'ScrollAreaScrollbar';

  const Thumb = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ ...props }, ref) => <div ref={ref} data-slot="ScrollAreaThumb" {...props} />
  );
  Thumb.displayName = 'ScrollAreaThumb';

  return {
    Root,
    Viewport,
    ScrollAreaScrollbar: Scrollbar,
    ScrollAreaThumb: Thumb,
    Corner: () => <div data-slot="ScrollAreaCorner" />,
  };
});

import { ScrollArea, ScrollBar } from './scroll-area';

describe('ScrollArea', () => {
  it('renders without throwing', () => {
    const { container } = render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>
    );
    expect(container).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <ScrollArea>
        <p>Long text content that might overflow</p>
      </ScrollArea>
    );
    expect(screen.getByText('Long text content that might overflow')).toBeTruthy();
  });

  it('passes custom className', () => {
    render(
      <ScrollArea className="custom-scroll" data-testid="scroll">
        <div>Content</div>
      </ScrollArea>
    );
    expect(screen.getByTestId('scroll')).toHaveClass('custom-scroll');
  });

  it('includes scrollbar and corner', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.querySelector('[data-slot="ScrollAreaScrollbar"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="ScrollAreaCorner"]')).toBeTruthy();
  });
});

describe('ScrollBar', () => {
  it('renders with vertical orientation by default', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
        <ScrollBar />
      </ScrollArea>
    );
    expect(container.querySelector('[data-slot="ScrollAreaScrollbar"]')).toBeTruthy();
  });

  it('renders with horizontal orientation', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
    const scrollbar = container.querySelector('[data-slot="ScrollAreaScrollbar"]');
    expect(scrollbar).toBeTruthy();
  });
});
