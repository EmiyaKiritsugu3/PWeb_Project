import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-menubar', () => {
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
    Root: createPrimitive('Menubar'),
    Menu: createPrimitive('MenubarMenu'),
    Trigger: createButton('MenubarTrigger'),
    Content: createPrimitive('MenubarContent'),
    CheckboxItem: createPrimitive('MenubarCheckboxItem'),
    RadioItem: createPrimitive('MenubarRadioItem'),
    Label: createPrimitive('MenubarLabel'),
    Separator: createPrimitive('MenubarSeparator'),
    Group: ({
      children,
      heading,
      ...props
    }: React.ComponentPropsWithoutRef<'div'> & { heading?: string }) => (
      <div data-slot="MenubarGroup" {...props}>
        {heading && <div data-slot="MenubarGroupHeading">{heading}</div>}
        {children}
      </div>
    ),
    Item: ({
      children,
      onSelect,
      ...props
    }: React.ComponentPropsWithoutRef<'div'> & { onSelect?: (e: Event) => void }) => (
      <div data-slot="MenubarItem" onClick={(e) => onSelect?.(e)} {...props}>
        {children}
      </div>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    RadioGroup: createPrimitive('MenubarRadioGroup'),
    Sub: createPrimitive('MenubarSub'),
    SubTrigger: createButton('MenubarSubTrigger'),
    SubContent: createPrimitive('MenubarSubContent'),
    ItemIndicator: ({ children }: { children: React.ReactNode }) => (
      <span data-slot="MenubarItemIndicator">{children}</span>
    ),
  };
});

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarShortcut,
  MenubarGroup,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
} from './menubar';

describe('Menubar', () => {
  it('renders without throwing', () => {
    const { container } = render(<Menubar />);
    expect(container).toBeTruthy();
  });

  it('passes className', () => {
    render(<Menubar className="custom-class" data-testid="menubar" />);
    expect(screen.getByTestId('menubar')).toHaveClass('custom-class');
  });

  it('renders children', () => {
    render(
      <Menubar>
        <span>Content</span>
      </Menubar>
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });
});

describe('MenubarMenu', () => {
  it('renders children inside a menu', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <span>Menu item</span>
        </MenubarMenu>
      </Menubar>
    );
    expect(screen.getByText('Menu item')).toBeTruthy();
  });
});

describe('MenubarTrigger', () => {
  it('renders as a button', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    );
    const trigger = screen.getByText('File');
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('handles onClick', () => {
    const handleClick = vi.fn();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger onClick={handleClick}>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    );
    fireEvent.click(screen.getByText('File'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('MenubarContent', () => {
  it('renders content with items', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.getByText('Open')).toBeTruthy();
  });
});

describe('MenubarItem', () => {
  it('renders and handles click', () => {
    const handleClick = vi.fn();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Menu</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={handleClick}>Copy</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    fireEvent.click(screen.getByText('Copy'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('MenubarSeparator', () => {
  it('renders a separator', () => {
    const { container } = render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Menu</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>A</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>B</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    expect(container.querySelector('[data-slot="MenubarSeparator"]')).toBeTruthy();
  });
});

describe('MenubarLabel', () => {
  it('renders label text', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Menu</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Actions</MenubarLabel>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    expect(screen.getByText('Actions')).toBeTruthy();
  });
});

describe('MenubarShortcut', () => {
  it('renders shortcut text', () => {
    render(<MenubarShortcut>⌘S</MenubarShortcut>);
    expect(screen.getByText('⌘S')).toBeTruthy();
  });
});

describe('MenubarGroup', () => {
  it('renders grouped items', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            {/* @ts-expect-error - heading prop accepted by mock but not by real Radix type */}
            <MenubarGroup heading="Clipboard" data-testid="menubar-group">
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    expect(screen.getByText('Clipboard')).toBeTruthy();
    expect(screen.getByText('Cut')).toBeTruthy();
  });
});

describe('MenubarCheckboxItem', () => {
  it('renders checkbox item', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={true}>Show Toolbar</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    expect(screen.getByText('Show Toolbar')).toBeTruthy();
  });
});

describe('MenubarRadioGroup', () => {
  it('renders radio group with items', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Layout</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="grid">
              <MenubarRadioItem value="grid">Grid</MenubarRadioItem>
              <MenubarRadioItem value="list">List</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    expect(screen.getByText('Grid')).toBeTruthy();
    expect(screen.getByText('List')).toBeTruthy();
  });
});
