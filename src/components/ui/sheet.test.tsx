import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-dialog', () => {
  const Root = ({
    children,
    open,
    ...props
  }: {
    children?: React.ReactNode;
    open?: boolean;
    [key: string]: unknown;
  }) => (
    <div data-testid="sheet-root" data-state={open ? 'open' : 'closed'} {...props}>
      {children}
    </div>
  );

  const Trigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ children, ...props }, ref) => (
    <button ref={ref} data-testid="sheet-trigger" {...props}>
      {children}
    </button>
  ));
  Trigger.displayName = 'SheetTrigger';

  const Portal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

  const Overlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="sheet-overlay" {...props} />
  );
  Overlay.displayName = 'SheetOverlay';

  const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="sheet-content" {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'SheetContent';

  const Close = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => (
      <button ref={ref} data-testid="sheet-close" {...props}>
        {children}
      </button>
    )
  );
  Close.displayName = 'SheetClose';

  const Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ children, ...props }, ref) => (
      <h2 ref={ref} data-testid="sheet-title" {...props}>
        {children}
      </h2>
    )
  );
  Title.displayName = 'SheetTitle';

  const Description = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
  >(({ children, ...props }, ref) => (
    <p ref={ref} data-testid="sheet-description" {...props}>
      {children}
    </p>
  ));
  Description.displayName = 'SheetDescription';

  return { Root, Trigger, Portal, Overlay, Content, Close, Title, Description };
});

vi.mock('lucide-react', () => ({
  X: () => <svg data-testid="icon-x" />,
}));

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';

describe('Sheet', () => {
  it('renders Sheet root without crashing', () => {
    render(
      <Sheet>
        <div>Content</div>
      </Sheet>
    );
    expect(screen.getByTestId('sheet-root')).toBeTruthy();
  });

  it('renders SheetTrigger', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
      </Sheet>
    );
    expect(screen.getByTestId('sheet-trigger')).toBeTruthy();
    expect(screen.getByText('Open Sheet')).toBeTruthy();
  });

  it('renders SheetContent with children', () => {
    render(
      <Sheet>
        <SheetContent>
          <p>Sheet body</p>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByTestId('sheet-content')).toBeTruthy();
    expect(screen.getByText('Sheet body')).toBeTruthy();
  });

  it('renders close button inside SheetContent', () => {
    render(
      <Sheet>
        <SheetContent>
          <p>Content</p>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByTestId('sheet-close')).toBeTruthy();
  });

  it('renders SheetHeader with children', () => {
    render(
      <Sheet>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText('Sheet Title')).toBeTruthy();
    expect(screen.getByText('Sheet Description')).toBeTruthy();
  });

  it('renders SheetFooter with children', () => {
    render(
      <Sheet>
        <SheetContent>
          <SheetFooter>
            <button>Action 1</button>
            <button>Action 2</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText('Action 1')).toBeTruthy();
    expect(screen.getByText('Action 2')).toBeTruthy();
  });

  it('renders SheetContent with side variant applied via className', () => {
    render(
      <Sheet>
        <SheetContent side="left">
          <p>Left sheet</p>
        </SheetContent>
      </Sheet>
    );
    const content = screen.getByTestId('sheet-content');
    expect(content.className).toContain('left');
  });

  it('defaults to right side variant', () => {
    render(
      <Sheet>
        <SheetContent>
          <p>Right sheet</p>
        </SheetContent>
      </Sheet>
    );
    const content = screen.getByTestId('sheet-content');
    expect(content.className).toContain('right');
  });

  it('passes open state to root', () => {
    render(
      <Sheet open>
        <div>Child</div>
      </Sheet>
    );
    expect(screen.getByTestId('sheet-root').getAttribute('data-state')).toBe('open');
  });

  it('passes className to SheetContent', () => {
    render(
      <Sheet>
        <SheetContent className="my-custom-class">
          <p>Content</p>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByTestId('sheet-content').className).toContain('my-custom-class');
  });
});
