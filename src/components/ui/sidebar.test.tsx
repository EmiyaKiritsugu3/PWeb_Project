import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('lucide-react', () => ({
  PanelLeft: () => <svg data-testid="panel-left-icon" />,
}));

vi.mock('@radix-ui/react-tooltip', () => {
  const Trigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  ));
  Trigger.displayName = 'TooltipTrigger';

  const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'TooltipContent';

  return {
    Provider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    Root: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    Trigger,
    Content,
  };
});

vi.mock('@radix-ui/react-separator', () => {
  const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} role="separator" {...props} />
  );
  Root.displayName = 'Separator';
  return { Root };
});

vi.mock('@radix-ui/react-slot', () => {
  const Slot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
  >(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ));
  Slot.displayName = 'Slot';
  return { Slot };
});

vi.mock('@/components/ui/sheet', () => {
  const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="sheet-content" {...props}>
        {children}
      </div>
    )
  );
  SheetContent.displayName = 'SheetContent';

  const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ children, ...props }, ref) => (
      <h2 ref={ref} {...props}>
        {children}
      </h2>
    )
  );
  SheetTitle.displayName = 'SheetTitle';

  return {
    Sheet: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="sheet">{children}</div>
    ),
    SheetContent,
    SheetTitle,
  };
});

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarInset,
  useSidebar,
} from './sidebar';

function TestConsumer() {
  const { state, open, toggleSidebar } = useSidebar();
  return (
    <div>
      <span data-testid="state">{state}</span>
      <span data-testid="open">{String(open)}</span>
      <button data-testid="toggle" onClick={toggleSidebar}>
        Toggle
      </button>
    </div>
  );
}

describe('SidebarProvider', () => {
  beforeEach(() => {
    document.cookie = 'sidebar_state=; path=/; max-age=0';
  });

  it('renders without crashing', () => {
    render(
      <SidebarProvider>
        <div>Content</div>
      </SidebarProvider>
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('provides context via useSidebar', () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    );
    expect(screen.getByTestId('state')).toBeTruthy();
    expect(screen.getByTestId('open')).toBeTruthy();
  });

  it('defaults to expanded state', () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    );
    expect(screen.getByTestId('state').textContent).toBe('expanded');
    expect(screen.getByTestId('open').textContent).toBe('true');
  });

  it('accepts defaultOpen=false', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <TestConsumer />
      </SidebarProvider>
    );
    expect(screen.getByTestId('state').textContent).toBe('collapsed');
    expect(screen.getByTestId('open').textContent).toBe('false');
  });

  it('toggles sidebar on button click', () => {
    render(
      <SidebarProvider defaultOpen>
        <TestConsumer />
      </SidebarProvider>
    );
    expect(screen.getByTestId('state').textContent).toBe('expanded');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('state').textContent).toBe('collapsed');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('state').textContent).toBe('expanded');
  });

  it('throws when useSidebar used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function BadConsumer() {
      useSidebar();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useSidebar must be used within a SidebarProvider'
    );
    consoleSpy.mockRestore();
  });

  it('sets data-state on sidebar div', () => {
    render(
      <SidebarProvider>
        <Sidebar>Nav</Sidebar>
      </SidebarProvider>
    );
    const sidebar = screen.getByText('Nav').closest('[data-state]');
    expect(sidebar?.getAttribute('data-state')).toBe('expanded');
  });

  it('responds to controlled open prop', () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false);
      return (
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <span data-testid="open-val">{String(open)}</span>
          <button data-testid="set-open" onClick={() => setOpen(true)}>
            Open
          </button>
        </SidebarProvider>
      );
    }
    render(<Controlled />);
    expect(screen.getByTestId('open-val').textContent).toBe('false');
    fireEvent.click(screen.getByTestId('set-open'));
    expect(screen.getByTestId('open-val').textContent).toBe('true');
  });
});

describe('Sidebar structural components', () => {
  it('renders SidebarTrigger', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
      </SidebarProvider>
    );
    expect(screen.getByTestId('panel-left-icon')).toBeTruthy();
  });

  it('SidebarTrigger calls toggleSidebar on click', () => {
    render(
      <SidebarProvider defaultOpen>
        <TestConsumer />
        <SidebarTrigger />
      </SidebarProvider>
    );
    expect(screen.getByTestId('state').textContent).toBe('expanded');
    fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(screen.getByTestId('state').textContent).toBe('collapsed');
  });

  it('renders SidebarHeader', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader data-testid="header">
            <span>Logo</span>
          </SidebarHeader>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByText('Logo')).toBeTruthy();
  });

  it('renders SidebarFooter', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarFooter data-testid="footer">
            <span>Footer</span>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('footer')).toBeTruthy();
    expect(screen.getByText('Footer')).toBeTruthy();
  });

  it('renders SidebarContent', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent data-testid="content">
            <span>Content</span>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('content')).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('renders SidebarGroup', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup data-testid="group">Group content</SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('group')).toBeTruthy();
  });

  it('renders SidebarGroupLabel', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel data-testid="group-label">Navigation</SidebarGroupLabel>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('group-label')).toBeTruthy();
    expect(screen.getByText('Navigation')).toBeTruthy();
  });

  it('renders SidebarGroupContent', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent data-testid="group-content">Items</SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('group-content')).toBeTruthy();
  });

  it('renders SidebarMenu', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu data-testid="menu">Menu items</SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('menu')).toBeTruthy();
    expect(screen.getByTestId('menu').tagName).toBe('UL');
  });

  it('renders SidebarMenuItem', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem data-testid="menu-item">Item</SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('menu-item')).toBeTruthy();
    expect(screen.getByTestId('menu-item').tagName).toBe('LI');
  });

  it('renders SidebarMenuButton', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton data-testid="menu-button">Dashboard</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('menu-button')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('renders SidebarMenuButton with isActive', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive data-testid="active-btn">
                  Active Item
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('active-btn').getAttribute('data-active')).toBe('true');
  });

  it('renders SidebarMenuAction', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Item</SidebarMenuButton>
                <SidebarMenuAction data-testid="menu-action">Action</SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('menu-action')).toBeTruthy();
  });

  it('renders SidebarMenuBadge', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Messages</SidebarMenuButton>
                <SidebarMenuBadge data-testid="badge">5</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('badge')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('renders SidebarMenuSub', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSub data-testid="menu-sub">
                  <SidebarMenuSubItem>Sub item</SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('menu-sub')).toBeTruthy();
    expect(screen.getByTestId('menu-sub').tagName).toBe('UL');
  });

  it('renders SidebarMenuSubItem', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSub>
                  <SidebarMenuSubItem data-testid="sub-item">Sub Item</SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('sub-item')).toBeTruthy();
    expect(screen.getByTestId('sub-item').tagName).toBe('LI');
  });

  it('renders SidebarMenuSubButton', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton data-testid="sub-button" href="/test">
                      Sub Button
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('sub-button')).toBeTruthy();
    expect(screen.getByText('Sub Button')).toBeTruthy();
  });

  it('renders SidebarSeparator', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarSeparator data-testid="separator" />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('separator')).toBeTruthy();
    expect(screen.getByTestId('separator').getAttribute('role')).toBe('separator');
  });

  it('renders SidebarInset', () => {
    render(
      <SidebarProvider>
        <SidebarInset data-testid="inset">
          <span>Main content</span>
        </SidebarInset>
      </SidebarProvider>
    );
    expect(screen.getByTestId('inset')).toBeTruthy();
    expect(screen.getByTestId('inset').tagName).toBe('MAIN');
    expect(screen.getByText('Main content')).toBeTruthy();
  });

  it('passes className to SidebarMenuButton', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="custom-btn" data-testid="custom-btn">
                  Item
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByTestId('custom-btn').className).toContain('custom-btn');
  });

  it('passes data attributes to SidebarMenuSubButton', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton size="sm" isActive href="/link">
                      Sub
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    const subBtn = screen.getByText('Sub').closest('a');
    expect(subBtn?.getAttribute('data-size')).toBe('sm');
    expect(subBtn?.getAttribute('data-active')).toBe('true');
  });

  it('Sidebar renders with side=right', () => {
    render(
      <SidebarProvider>
        <Sidebar side="right">
          <SidebarContent>Right sidebar</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    const sidebarRoot = screen.getByText('Right sidebar').closest('[data-side]');
    expect(sidebarRoot?.getAttribute('data-side')).toBe('right');
  });

  it('Sidebar renders with collapsible=none', () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>Non-collapsible</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Non-collapsible')).toBeTruthy();
  });

  it('SidebarMenuButton renders with tooltip string', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Menu tooltip">Item with tooltip</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Item with tooltip')).toBeTruthy();
  });
});
