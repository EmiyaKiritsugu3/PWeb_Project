import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@/components/ui/popover', () => {
  const PopoverTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ children, ...props }, ref) => (
    <button ref={ref} data-testid="popover-trigger" {...props}>
      {children}
    </button>
  ));
  PopoverTrigger.displayName = 'PopoverTrigger';

  const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="popover-content" {...props}>
        {children}
      </div>
    )
  );
  PopoverContent.displayName = 'PopoverContent';

  return {
    Popover: ({ children, open }: { children?: React.ReactNode; open?: boolean }) => (
      <div data-testid="popover" data-state={open ? 'open' : 'closed'}>
        {children}
      </div>
    ),
    PopoverTrigger,
    PopoverContent,
  };
});

vi.mock('@/components/ui/command', () => {
  const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="command" {...props}>
        {children}
      </div>
    )
  );
  Command.displayName = 'Command';

  const CommandInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >(({ ...props }, ref) => <input ref={ref} data-testid="command-input" {...props} />);
  CommandInput.displayName = 'CommandInput';

  const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="command-list" {...props}>
        {children}
      </div>
    )
  );
  CommandList.displayName = 'CommandList';

  const CommandEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="command-empty" {...props}>
        {children}
      </div>
    )
  );
  CommandEmpty.displayName = 'CommandEmpty';

  const CommandGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { heading?: string }
  >(({ children, heading, ...props }, ref) => (
    <div ref={ref} data-testid="command-group" data-heading={heading} {...props}>
      {children}
    </div>
  ));
  CommandGroup.displayName = 'CommandGroup';

  const CommandItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      value?: string;
      keywords?: string[];
      onSelect?: (value: string) => void;
    }
  >(({ children, value, onSelect, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="command-item"
      data-value={value}
      onClick={() => onSelect?.(value ?? '')}
      {...props}
    >
      {children}
    </div>
  ));
  CommandItem.displayName = 'CommandItem';

  return { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem };
});

vi.mock('@/components/ui/button', () => {
  const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }
  >(({ children, variant, ...props }, ref) => (
    <button ref={ref} data-testid="button" data-variant={variant} {...props}>
      {children}
    </button>
  ));
  Button.displayName = 'Button';
  return { Button };
});

vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="icon-check" />,
  ChevronsUpDown: () => <svg data-testid="icon-chevrons-up-down" />,
}));

import { Combobox } from './combobox';

const mockOptions = [
  {
    label: 'Group 1',
    options: [
      { value: 'opt1', label: 'Option One' },
      { value: 'opt2', label: 'Option Two' },
    ],
  },
];

const mockFlatOptions = [
  { value: 'opt1', label: 'Option One' },
  { value: 'opt2', label: 'Option Two' },
];

describe('Combobox', () => {
  it('renders without crashing', () => {
    render(<Combobox options={mockOptions} flatOptions={mockFlatOptions} onChange={vi.fn()} />);
    expect(screen.getByTestId('popover')).toBeTruthy();
  });

  it('renders trigger button with placeholder when no value', () => {
    render(
      <Combobox
        options={mockOptions}
        flatOptions={mockFlatOptions}
        onChange={vi.fn()}
        placeholder="Pick something..."
      />
    );
    expect(screen.getByText('Pick something...')).toBeTruthy();
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('shows default placeholder text', () => {
    render(<Combobox options={mockOptions} flatOptions={mockFlatOptions} onChange={vi.fn()} />);
    expect(screen.getByText('Select an option...')).toBeTruthy();
  });

  it('renders chevrons up down icon', () => {
    render(<Combobox options={mockOptions} flatOptions={mockFlatOptions} onChange={vi.fn()} />);
    expect(screen.getByTestId('icon-chevrons-up-down')).toBeTruthy();
  });

  it('shows selected label when value is provided', () => {
    render(
      <Combobox
        options={mockOptions}
        flatOptions={mockFlatOptions}
        value="opt1"
        onChange={vi.fn()}
      />
    );
    const matches = screen.getAllByText('Option One');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('combobox').textContent).toContain('Option One');
  });

  it('has combobox role with aria-expanded', () => {
    render(<Combobox options={mockOptions} flatOptions={mockFlatOptions} onChange={vi.fn()} />);
    const combobox = screen.getByRole('combobox');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
  });

  it('passes className to button', () => {
    render(
      <Combobox
        options={mockOptions}
        flatOptions={mockFlatOptions}
        onChange={vi.fn()}
        className="custom-combobox"
      />
    );
    expect(screen.getByRole('combobox').className).toContain('custom-combobox');
  });

  it('renders command input inside popover', () => {
    render(
      <Combobox
        options={mockOptions}
        flatOptions={mockFlatOptions}
        onChange={vi.fn()}
        searchPlaceholder="Search options..."
      />
    );
    expect(screen.getByTestId('command-input')).toBeTruthy();
  });

  it('renders command groups with options', () => {
    render(<Combobox options={mockOptions} flatOptions={mockFlatOptions} onChange={vi.fn()} />);
    expect(screen.getByTestId('command-group')).toBeTruthy();
    expect(screen.getByText('Option One')).toBeTruthy();
    expect(screen.getByText('Option Two')).toBeTruthy();
  });

  it('renders check icon for selected option', () => {
    render(
      <Combobox
        options={mockOptions}
        flatOptions={mockFlatOptions}
        value="opt1"
        onChange={vi.fn()}
      />
    );
    const checks = screen.getAllByTestId('icon-check');
    expect(checks.length).toBeGreaterThan(0);
  });
});
