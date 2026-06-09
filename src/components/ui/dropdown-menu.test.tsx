import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-dropdown-menu', () => {
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

  const createButton = (displayName: string) => {
    const Component = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
      ({ children, ...props }, ref) => (
        <button ref={ref} data-slot={displayName} {...props}>
          {children}
        </button>
      )
    );
    Component.displayName = displayName;
    return Component;
  };

  return {
    Root: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
      <div data-slot="DropdownMenu" {...props}>
        {children}
      </div>
    ),
    Trigger: createButton('DropdownMenuTrigger'),
    Content: createPrimitive('DropdownMenuContent'),
    Item: ({
      children,
      onSelect,
      ...props
    }: React.ComponentPropsWithoutRef<'div'> & { onSelect?: (e: Event) => void }) => (
      <div data-slot="DropdownMenuItem" onClick={(e) => onSelect?.(e)} {...props}>
        {children}
      </div>
    ),
    CheckboxItem: createPrimitive('DropdownMenuCheckboxItem'),
    RadioItem: createPrimitive('DropdownMenuRadioItem'),
    Label: createPrimitive('DropdownMenuLabel'),
    Separator: createPrimitive('DropdownMenuSeparator'),
    Group: createPrimitive('DropdownMenuGroup'),
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Sub: createPrimitive('DropdownMenuSub'),
    SubTrigger: createButton('DropdownMenuSubTrigger'),
    SubContent: createPrimitive('DropdownMenuSubContent'),
    RadioGroup: createPrimitive('DropdownMenuRadioGroup'),
    ItemIndicator: ({ children }: { children: React.ReactNode }) => (
      <span data-slot="DropdownMenuItemIndicator">{children}</span>
    ),
  };
});

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

function renderMenu(trigger = 'Open', items: React.ReactNode = null) {
  return render(
    <DropdownMenu>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>{items}</DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('renders trigger button', () => {
    renderMenu();
    expect(screen.getByText('Open')).toBeTruthy();
  });

  it('renders menu items', () => {
    renderMenu(
      'Open',
      <>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </>
    );
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
  });
});

describe('DropdownMenuTrigger', () => {
  it('renders as button', () => {
    renderMenu();
    expect(screen.getByText('Open').tagName).toBe('BUTTON');
  });

  it('handles onClick', () => {
    const onClick = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger onClick={onClick}>Toggle</DropdownMenuTrigger>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByText('Toggle'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('DropdownMenuItem', () => {
  it('renders and handles click', () => {
    const handleClick = vi.fn();
    renderMenu('Menu', <DropdownMenuItem onSelect={handleClick}>Save</DropdownMenuItem>);
    fireEvent.click(screen.getByText('Save'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('DropdownMenuCheckboxItem', () => {
  it('renders with checked state', () => {
    renderMenu(
      'Menu',
      <DropdownMenuCheckboxItem checked={true}>Show sidebar</DropdownMenuCheckboxItem>
    );
    expect(screen.getByText('Show sidebar')).toBeTruthy();
  });
});

describe('DropdownMenuRadioGroup', () => {
  it('renders radio items in group', () => {
    renderMenu(
      'Menu',
      <DropdownMenuRadioGroup value="a">
        <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    );
    expect(screen.getByText('Option A')).toBeTruthy();
    expect(screen.getByText('Option B')).toBeTruthy();
  });
});

describe('DropdownMenuLabel', () => {
  it('renders label text', () => {
    renderMenu('Menu', <DropdownMenuLabel>My Actions</DropdownMenuLabel>);
    expect(screen.getByText('My Actions')).toBeTruthy();
  });
});

describe('DropdownMenuSeparator', () => {
  it('renders separator element', () => {
    const { container } = renderMenu(
      'Menu',
      <>
        <DropdownMenuItem>A</DropdownMenuItem>
        <DropdownMenuSeparator data-testid="sep" />
        <DropdownMenuItem>B</DropdownMenuItem>
      </>
    );
    expect(container.querySelector('[data-slot="DropdownMenuSeparator"]')).toBeTruthy();
  });
});

describe('DropdownMenuShortcut', () => {
  it('renders shortcut text', () => {
    render(<DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>);
    expect(screen.getByText('⌘Z')).toBeTruthy();
  });
});

describe('DropdownMenuGroup', () => {
  it('renders grouped items', () => {
    renderMenu(
      'Menu',
      <DropdownMenuGroup>
        <DropdownMenuItem>Cut</DropdownMenuItem>
        <DropdownMenuItem>Copy</DropdownMenuItem>
      </DropdownMenuGroup>
    );
    expect(screen.getByText('Cut')).toBeTruthy();
    expect(screen.getByText('Copy')).toBeTruthy();
  });
});

describe('DropdownMenuSub', () => {
  it('renders sub menu with trigger and content', () => {
    renderMenu(
      'Menu',
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>More tools</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Sub item</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
    expect(screen.getByText('More tools')).toBeTruthy();
    expect(screen.getByText('Sub item')).toBeTruthy();
  });
});
