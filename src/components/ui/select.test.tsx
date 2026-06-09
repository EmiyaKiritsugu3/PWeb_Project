import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-select', () => {
  const Root = ({
    children,
    value,
    ...props
  }: {
    children?: React.ReactNode;
    value?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="select-root" data-value={value} {...props}>
      {children}
    </div>
  );

  const Trigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ children, ...props }, ref) => (
    <button ref={ref} data-testid="select-trigger" role="combobox" {...props}>
      {children}
    </button>
  ));
  Trigger.displayName = 'SelectTrigger';

  const Value = ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  );

  const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="select-content" role="listbox" {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'SelectContent';

  const Item = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
  >(({ children, value: itemValue, ...props }, ref) => (
    <div ref={ref} data-testid="select-item" data-value={itemValue} role="option" {...props}>
      {children}
    </div>
  ));
  Item.displayName = 'SelectItem';

  const Group = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  );

  const Label = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="select-label" {...props}>
        {children}
      </div>
    )
  );
  Label.displayName = 'SelectLabel';

  const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => (
      <div ref={ref} data-testid="select-separator" role="separator" {...props} />
    )
  );
  Separator.displayName = 'SelectSeparator';

  const Icon = ({ children }: { children?: React.ReactNode; asChild?: boolean }) => <>{children}</>;

  const ItemIndicator = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

  const ItemText = ({ children }: { children?: React.ReactNode }) => <span>{children}</span>;

  const Portal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

  const Viewport = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="select-viewport" {...props}>
      {children}
    </div>
  );

  const ScrollUpButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="select-scroll-up" {...props} />
  );
  ScrollUpButton.displayName = 'SelectScrollUpButton';

  const ScrollDownButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} data-testid="select-scroll-down" {...props} />
  );
  ScrollDownButton.displayName = 'SelectScrollDownButton';

  return {
    Root,
    Trigger,
    Value,
    Content,
    Item,
    Group,
    Label,
    Separator,
    Icon,
    ItemIndicator,
    ItemText,
    Portal,
    Viewport,
    ScrollUpButton,
    ScrollDownButton,
  };
});

vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="icon-check" />,
  ChevronDown: () => <svg data-testid="icon-chevron-down" />,
  ChevronUp: () => <svg data-testid="icon-chevron-up" />,
}));

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './select';

describe('Select', () => {
  it('renders Select root without crashing', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('select-root')).toBeTruthy();
  });

  it('renders SelectTrigger', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('select-trigger')).toBeTruthy();
  });

  it('renders SelectValue with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByText('Select a fruit')).toBeTruthy();
  });

  it('renders chevron icon inside trigger', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('icon-chevron-down')).toBeTruthy();
  });

  it('renders SelectContent', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId('select-content')).toBeTruthy();
  });

  it('renders SelectItem with children', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Banana')).toBeTruthy();
    expect(screen.getByText('Cherry')).toBeTruthy();
  });

  it('passes value prop to Select root', () => {
    render(
      <Select value="apple">
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('select-root').getAttribute('data-value')).toBe('apple');
  });

  it('renders SelectGroup', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId('select-group')).toBeTruthy();
    expect(screen.getByText('Fruits')).toBeTruthy();
  });

  it('renders SelectSeparator', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectSeparator />
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId('select-separator')).toBeTruthy();
  });

  it('passes className to SelectTrigger', () => {
    render(
      <Select>
        <SelectTrigger className="my-custom-trigger">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('select-trigger').className).toContain('my-custom-trigger');
  });
});
