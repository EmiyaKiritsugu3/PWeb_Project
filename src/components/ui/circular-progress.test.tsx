import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CircularProgress } from './circular-progress';

describe('CircularProgress', () => {
  it('renders without throwing', () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container).toBeTruthy();
  });

  it('renders SVG circles', () => {
    const { container } = render(<CircularProgress value={75} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  it('displays value when showValue is true', () => {
    render(<CircularProgress value={42} showValue />);
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('does not display value by default', () => {
    const { container } = render(<CircularProgress value={42} />);
    expect(container.textContent).not.toContain('42%');
  });

  it('renders label when provided', () => {
    render(<CircularProgress value={90} label="Progress" />);
    expect(screen.getByText('Progress')).toBeTruthy();
  });

  it('renders sm size', () => {
    const { container } = render(<CircularProgress value={50} size="sm" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('w-16');
  });

  it('renders md size by default', () => {
    const { container } = render(<CircularProgress value={50} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('w-32');
  });

  it('renders lg size', () => {
    const { container } = render(<CircularProgress value={50} size="lg" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('w-48');
  });

  it('applies custom className', () => {
    const { container } = render(<CircularProgress value={50} className="my-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('my-class');
  });

  it('calculates strokeDashoffset correctly for 0%', () => {
    const { container } = render(<CircularProgress value={0} />);
    const progressCircle = container.querySelectorAll('circle')[1];
    const circumference = 2 * Math.PI * 40;
    expect(progressCircle.getAttribute('stroke-dashoffset')).toBe(String(circumference));
  });

  it('calculates strokeDashoffset correctly for 100%', () => {
    const { container } = render(<CircularProgress value={100} />);
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle.getAttribute('stroke-dashoffset')).toBe('0');
  });

  it('uses cyan gradient by default', () => {
    const { container } = render(<CircularProgress value={50} />);
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle.getAttribute('stroke')).toBe('url(#cyan-gradient)');
  });

  it('uses gold gradient when specified', () => {
    const { container } = render(<CircularProgress value={50} gradient="gold" />);
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle.getAttribute('stroke')).toBe('url(#gold-gradient)');
  });

  it('uses rose gradient when specified', () => {
    const { container } = render(<CircularProgress value={50} gradient="rose" />);
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle.getAttribute('stroke')).toBe('url(#rose-gradient)');
  });

  it('passes forward ref', () => {
    const ref = { current: null };
    render(<CircularProgress value={50} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
