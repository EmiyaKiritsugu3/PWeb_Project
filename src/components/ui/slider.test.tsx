import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-slider', () => {
  const Root = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div
        ref={ref}
        role="slider"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        {children}
      </div>
    )
  );
  Root.displayName = 'SliderRoot';

  const Track = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="track" {...props} />
  );
  Track.displayName = 'SliderTrack';

  const Range = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="range" {...props} />
  );
  Range.displayName = 'SliderRange';

  const Thumb = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="thumb" {...props} />
  );
  Thumb.displayName = 'SliderThumb';

  return { Root, Track, Range, Thumb };
});

import { Slider } from './slider';

describe('Slider', () => {
  it('renders without crashing', () => {
    render(<Slider data-testid="slider" />);
    expect(screen.getByTestId('slider')).toBeTruthy();
  });

  it('renders track', () => {
    render(<Slider />);
    expect(screen.getByTestId('track')).toBeTruthy();
  });

  it('renders range', () => {
    render(<Slider />);
    expect(screen.getByTestId('range')).toBeTruthy();
  });

  it('renders thumb', () => {
    render(<Slider />);
    expect(screen.getByTestId('thumb')).toBeTruthy();
  });

  it('passes custom className', () => {
    render(<Slider className="my-slider" data-testid="slider" />);
    expect(screen.getByTestId('slider').className).toContain('my-slider');
  });
});
