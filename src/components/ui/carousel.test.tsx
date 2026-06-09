import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

const mockScrollPrev = vi.fn();
const mockScrollNext = vi.fn();

vi.mock('embla-carousel-react', () => ({
  default: () => [
    vi.fn(),
    {
      canScrollPrev: () => false,
      canScrollNext: () => true,
      scrollPrev: mockScrollPrev,
      scrollNext: mockScrollNext,
      on: vi.fn(),
      off: vi.fn(),
    },
  ],
}));

vi.mock('@/components/ui/button', () => {
  const Button = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
    ({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )
  );
  Button.displayName = 'Button';
  return { Button };
});

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from './carousel';

describe('Carousel', () => {
  it('renders without throwing', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(container).toBeTruthy();
  });

  it('renders carousel items', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>First</CarouselItem>
          <CarouselItem>Second</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.getByText('Second')).toBeTruthy();
  });

  it('renders prev/next buttons', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    expect(screen.getByText('Previous slide')).toBeTruthy();
    expect(screen.getByText('Next slide')).toBeTruthy();
  });

  it('disables previous button when canScrollPrev is false', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );
    expect(screen.getByText('Previous slide').closest('button')).toBeDisabled();
  });

  it('enables next button when canScrollNext is true', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );
    expect(screen.getByText('Next slide').closest('button')).not.toBeDisabled();
  });

  it('sets aria-roledescription on carousel section', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(screen.getByRole('region', { name: 'Carrossel de conteúdo' })).toBeTruthy();
  });
});
