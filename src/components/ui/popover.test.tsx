import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-popover', () => {
  const Trigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
    ({ children, ...props }, ref) => (
      <button ref={ref} data-slot="PopoverTrigger" {...props}>
        {children}
      </button>
    )
  );
  Trigger.displayName = 'PopoverTrigger';

  const Content = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-slot="PopoverContent" {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'PopoverContent';

  return {
    Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Trigger,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Content,
  };
});

import { Popover, PopoverTrigger, PopoverContent } from './popover';

describe('Popover', () => {
  it('renders trigger and content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Open popover')).toBeTruthy();
    expect(screen.getByText('Popover body')).toBeTruthy();
  });
});

describe('PopoverTrigger', () => {
  it('renders as a button', () => {
    render(
      <Popover>
        <PopoverTrigger>Click me</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByText('Click me').tagName).toBe('BUTTON');
  });

  it('handles onClick', () => {
    const onClick = vi.fn();
    render(
      <Popover>
        <PopoverTrigger onClick={onClick}>Toggle</PopoverTrigger>
      </Popover>
    );
    fireEvent.click(screen.getByText('Toggle'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('PopoverContent', () => {
  it('renders content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content text</PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Content text')).toBeTruthy();
  });

  it('passes custom className', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-popover">Body</PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Body')).toHaveClass('custom-popover');
  });
});
