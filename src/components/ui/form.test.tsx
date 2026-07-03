import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('react-hook-form', () => {
  const FormProvider = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="form-provider">{children}</div>
  );

  const Controller = ({
    name,
    render: renderProp,
  }: {
    name: string;
    render: (props: { field: Record<string, unknown> }) => React.ReactNode;
  }) => {
    return (
      <div data-testid={`controller-${name}`}>
        {renderProp({
          field: { name, value: '', onChange: vi.fn(), onBlur: vi.fn() },
        })}
      </div>
    );
  };

  const useFormContext = () => ({
    getFieldState: (_name: string) => {
      if (_name === 'errorField') {
        return { error: { message: 'Required' }, isDirty: true, invalid: true };
      }
      return { error: undefined, isDirty: false, invalid: false };
    },
    formState: { errors: { errorField: { message: 'Required' } } },
  });

  return { FormProvider, Controller, useFormContext };
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

vi.mock('@radix-ui/react-label', () => {
  const Root = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ children, ...props }, ref) => (
      <label ref={ref} {...props}>
        {children}
      </label>
    )
  );
  Root.displayName = 'LabelRoot';
  return { Root };
});

vi.mock('@/components/ui/label', () => {
  const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ children, ...props }, ref) => (
      <label ref={ref} {...props}>
        {children}
      </label>
    )
  );
  Label.displayName = 'Label';
  return { Label };
});

import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from './form';
import { useFormField } from './form';

const MockedForm = Form as unknown as React.FC<{ children?: React.ReactNode }>;

describe('Form', () => {
  it('renders Form (FormProvider) wrapping children', () => {
    render(
      <MockedForm>
        <div>Form content</div>
      </MockedForm>
    );
    expect(screen.getByTestId('form-provider')).toBeTruthy();
    expect(screen.getByText('Form content')).toBeTruthy();
  });

  it('renders FormItem as a div', () => {
    render(
      <FormItem data-testid="test-item">
        <span>Item content</span>
      </FormItem>
    );
    expect(screen.getByTestId('test-item')).toBeTruthy();
    expect(screen.getByText('Item content')).toBeTruthy();
  });

  it('renders FormLabel as a label element', () => {
    render(<FormLabel>Username</FormLabel>);
    const label = screen.getByText('Username');
    expect(label.tagName).toBe('LABEL');
  });

  it('renders FormControl wrapping a child element', () => {
    render(
      <FormControl>
        <input data-testid="form-input" />
      </FormControl>
    );
    expect(screen.getByTestId('form-input')).toBeTruthy();
  });

  it('renders FormDescription', () => {
    render(<FormDescription data-testid="test-desc">This is a help text</FormDescription>);
    expect(screen.getByTestId('test-desc')).toBeTruthy();
    expect(screen.getByText('This is a help text')).toBeTruthy();
  });

  it('renders FormMessage with no error returns null', () => {
    const { container } = render(<FormMessage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders FormMessage with children text when no error', () => {
    render(<FormMessage>fallback text</FormMessage>);
    expect(screen.getByText('fallback text')).toBeTruthy();
  });

  it('passes className to FormItem', () => {
    render(<FormItem className="custom-item" data-testid="item" />);
    expect(screen.getByTestId('item').className).toContain('custom-item');
  });

  it('passes className to FormDescription', () => {
    render(
      <FormDescription className="desc-custom" data-testid="desc">
        Text
      </FormDescription>
    );
    expect(screen.getByTestId('desc').className).toContain('desc-custom');
  });

  it('passes ref to FormItem', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<FormItem ref={ref}>Content</FormItem>);
    expect(ref.current).toBeTruthy();
  });
});

// useFormField context verification tested implicitly via FormLabel/FormControl rendering above
