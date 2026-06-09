import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';

vi.mock('cmdk', () => {
  const createPrimitive = (displayName: string) => {
    const Component = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
      ({ children, ...props }, ref) => (
        <div ref={ref} data-slot={displayName} {...props}>
          {children}
        </div>
      )
    );
    Component.displayName = displayName;
    return Component;
  };

  const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
    ({ ...props }, ref) => <input ref={ref} data-slot="cmdk-input" {...props} />
  );
  Input.displayName = 'CommandInput';

  return {
    Command: Object.assign(createPrimitive('Command'), {
      Input,
      List: createPrimitive('CommandList'),
      Empty: createPrimitive('CommandEmpty'),
      Group: ({
        children,
        heading,
        ...props
      }: React.ComponentPropsWithoutRef<'div'> & { heading?: string }) => (
        <div data-slot="CommandGroup" {...props}>
          {heading && <div data-slot="CommandGroupHeading">{heading}</div>}
          {children}
        </div>
      ),
      Item: ({
        children,
        onSelect,
        ...props
      }: React.ComponentPropsWithoutRef<'div'> & { onSelect?: (e: Event) => void }) => (
        <div data-slot="CommandItem" onClick={(e) => onSelect?.(e)} {...props}>
          {children}
        </div>
      ),
      Separator: createPrimitive('CommandSeparator'),
    }),
  };
});

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    <div data-slot="dialog" {...props}>
      {children}
    </div>
  ),
  DialogContent: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    <div data-slot="dialog-content" {...props}>
      {children}
    </div>
  ),
}));

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandDialog,
} from './command';

describe('Command', () => {
  it('renders without throwing', () => {
    const { container } = render(<Command />);
    expect(container).toBeTruthy();
  });

  it('passes className and children', () => {
    render(<Command className="test-class">Content</Command>);
    const el = screen.getByText('Content');
    expect(el.closest('[data-slot="Command"]')).toHaveClass('test-class');
  });

  it('passes data attributes', () => {
    render(<Command data-testid="cmd" />);
    expect(screen.getByTestId('cmd')).toBeTruthy();
  });
});

describe('CommandInput', () => {
  it('renders an input element', () => {
    render(<CommandInput placeholder="Search…" />);
    expect(screen.getByPlaceholderText('Search…')).toBeTruthy();
  });

  it('passes value and onChange', () => {
    const handleChange = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<CommandInput {...({ value: 'test', onChange: handleChange } as any)} />);
    const input = screen.getByDisplayValue('test');
    fireEvent.change(input, { target: { value: 'new' } });
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('CommandList', () => {
  it('renders children', () => {
    render(<CommandList>List content</CommandList>);
    expect(screen.getByText('List content')).toBeTruthy();
  });
});

describe('CommandEmpty', () => {
  it('renders empty state', () => {
    render(<CommandEmpty>No results</CommandEmpty>);
    expect(screen.getByText('No results')).toBeTruthy();
  });
});

describe('CommandGroup', () => {
  it('renders with heading', () => {
    render(
      <CommandGroup heading="Suggestions">
        <CommandItem>Item 1</CommandItem>
      </CommandGroup>
    );
    expect(screen.getByText('Suggestions')).toBeTruthy();
    expect(screen.getByText('Item 1')).toBeTruthy();
  });
});

describe('CommandItem', () => {
  it('renders and handles click', () => {
    const handleClick = vi.fn();
    render(<CommandItem onSelect={handleClick}>My Item</CommandItem>);
    const item = screen.getByText('My Item');
    fireEvent.click(item);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('CommandShortcut', () => {
  it('renders shortcut text', () => {
    render(<CommandShortcut>⌘K</CommandShortcut>);
    expect(screen.getByText('⌘K')).toBeTruthy();
  });
});

describe('CommandSeparator', () => {
  it('renders a separator element', () => {
    const { container } = render(<CommandSeparator />);
    expect(container.querySelector('[data-slot="CommandSeparator"]')).toBeTruthy();
  });
});

describe('CommandDialog', () => {
  it('renders dialog with command inside', () => {
    render(
      <CommandDialog>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup heading="Group">
            <CommandItem>Result</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    );
    expect(screen.getByPlaceholderText('Search…')).toBeTruthy();
    expect(screen.getByText('Result')).toBeTruthy();
  });
});
