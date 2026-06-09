import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-alert-dialog', () => {
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
      <div data-slot="AlertDialog" {...props}>
        {children}
      </div>
    ),
    Trigger: createButton('AlertDialogTrigger'),
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Overlay: createPrimitive('AlertDialogOverlay'),
    Content: createPrimitive('AlertDialogContent'),
    Title: createPrimitive('AlertDialogTitle'),
    Description: createPrimitive('AlertDialogDescription'),
    Action: createButton('AlertDialogAction'),
    Cancel: createButton('AlertDialogCancel'),
  };
});

vi.mock('@/components/ui/button', () => ({
  buttonVariants: (opts?: { variant?: string }) => `btn ${opts?.variant || 'default'}`,
}));

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

describe('AlertDialog', () => {
  it('renders without throwing', () => {
    const { container } = render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(container).toBeTruthy();
  });
});

describe('AlertDialogTrigger', () => {
  it('renders as a button', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
      </AlertDialog>
    );
    const trigger = screen.getByText('Open Dialog');
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('handles click', () => {
    const onClick = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger onClick={onClick}>Open</AlertDialogTrigger>
      </AlertDialog>
    );
    fireEvent.click(screen.getByText('Open'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('AlertDialogTitle', () => {
  it('renders title text', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogTitle>Warning</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByText('Warning')).toBeTruthy();
  });
});

describe('AlertDialogDescription', () => {
  it('renders description text', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogDescription>Some description</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByText('Some description')).toBeTruthy();
  });
});

describe('AlertDialogAction', () => {
  it('renders and handles click', () => {
    const onAction = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );
    fireEvent.click(screen.getByText('Confirm'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe('AlertDialogCancel', () => {
  it('renders cancel button', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByText('Go Back')).toBeTruthy();
  });
});

describe('AlertDialogHeader', () => {
  it('renders header with title and description', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
            <AlertDialogDescription>Details here</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByText('Confirm')).toBeTruthy();
    expect(screen.getByText('Details here')).toBeTruthy();
  });
});

describe('AlertDialogFooter', () => {
  it('renders footer with action and cancel', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('OK')).toBeTruthy();
  });
});
