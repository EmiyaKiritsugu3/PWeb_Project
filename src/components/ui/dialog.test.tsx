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
    <div data-testid="dialog-root" data-state={open ? 'open' : 'closed'} {...props}>
      {children}
    </div>
  );

  const Trigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ children, ...props }, ref) => (
    <button ref={ref} data-testid="dialog-trigger" {...props}>
      {children}
    </button>
  ));
  Trigger.displayName = 'DialogTrigger';

  const Portal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

  const Overlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="dialog-overlay" {...props} />
  );
  Overlay.displayName = 'DialogOverlay';

  const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="dialog-content" {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'DialogContent';

  const Close = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => (
      <button ref={ref} data-testid="dialog-close" {...props}>
        {children}
      </button>
    )
  );
  Close.displayName = 'DialogClose';

  const Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ children, ...props }, ref) => (
      <h2 ref={ref} data-testid="dialog-title" {...props}>
        {children}
      </h2>
    )
  );
  Title.displayName = 'DialogTitle';

  const Description = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
  >(({ children, ...props }, ref) => (
    <p ref={ref} data-testid="dialog-description" {...props}>
      {children}
    </p>
  ));
  Description.displayName = 'DialogDescription';

  return { Root, Trigger, Portal, Overlay, Content, Close, Title, Description };
});

vi.mock('lucide-react', () => ({
  X: () => <svg data-testid="icon-x" />,
}));

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';

describe('Dialog', () => {
  it('renders Dialog root without crashing', () => {
    render(
      <Dialog>
        <div>Content</div>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-root')).toBeTruthy();
  });

  it('renders DialogTrigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-trigger')).toBeTruthy();
    expect(screen.getByText('Open')).toBeTruthy();
  });

  it('renders DialogContent with children', () => {
    render(
      <Dialog>
        <DialogContent>
          <p>Dialog body</p>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-content')).toBeTruthy();
    expect(screen.getByText('Dialog body')).toBeTruthy();
  });

  it('renders DialogHeader with children', () => {
    render(
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Title</DialogTitle>
            <DialogDescription>My Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('My Title')).toBeTruthy();
    expect(screen.getByText('My Description')).toBeTruthy();
  });

  it('renders DialogFooter with children', () => {
    render(
      <Dialog>
        <DialogContent>
          <DialogFooter>
            <button>Cancel</button>
            <button>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('renders DialogClose button', () => {
    render(
      <Dialog>
        <DialogContent>
          <DialogClose>Close me</DialogClose>
        </DialogContent>
      </Dialog>
    );
    const closeButtons = screen.getAllByTestId('dialog-close');
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Close me')).toBeTruthy();
  });

  it('passes className to DialogContent', () => {
    render(
      <Dialog>
        <DialogContent className="custom-class">
          <p>Content</p>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-content').className).toContain('custom-class');
  });

  it('passes props to Dialog root', () => {
    render(
      <Dialog open>
        <div>Child</div>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-root').getAttribute('data-state')).toBe('open');
  });

  it('renders with data-state=closed when not open', () => {
    render(
      <Dialog>
        <div>Child</div>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-root').getAttribute('data-state')).toBe('closed');
  });
});
