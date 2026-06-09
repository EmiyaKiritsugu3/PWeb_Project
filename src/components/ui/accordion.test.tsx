import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-accordion', () => {
  const Root = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    <div data-testid="accordion-root" {...props}>
      {children}
    </div>
  );
  Root.displayName = 'Accordion';

  const Item = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="accordion-item" {...props}>
        {children}
      </div>
    )
  );
  Item.displayName = 'AccordionItem';

  const Header = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    <div data-testid="accordion-header" {...props}>
      {children}
    </div>
  );
  Header.displayName = 'AccordionHeader';

  const Trigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
    ({ children, ...props }, ref) => (
      <button ref={ref} data-testid="accordion-trigger" {...props}>
        {children}
      </button>
    )
  );
  Trigger.displayName = 'AccordionTrigger';

  const Content = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} data-testid="accordion-content" {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'AccordionContent';

  return { Root, Item, Header, Trigger, Content };
});

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';

describe('Accordion components', () => {
  it('Accordion renders children', () => {
    render(
      <Accordion type="single">
        <div>content</div>
      </Accordion>
    );
    expect(screen.getByTestId('accordion-root')).toBeTruthy();
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('AccordionItem renders', () => {
    render(<AccordionItem value="item-1">Item Content</AccordionItem>);
    expect(screen.getByTestId('accordion-item')).toBeTruthy();
    expect(screen.getByText('Item Content')).toBeTruthy();
  });

  it('AccordionTrigger renders with text and chevron', () => {
    render(<AccordionTrigger>Click me</AccordionTrigger>);
    expect(screen.getByTestId('accordion-trigger')).toBeTruthy();
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('AccordionContent renders children', () => {
    render(<AccordionContent>Hidden Content</AccordionContent>);
    expect(screen.getByTestId('accordion-content')).toBeTruthy();
    expect(screen.getByText('Hidden Content')).toBeTruthy();
  });

  it('AccordionItem passes className', () => {
    render(
      <AccordionItem value="test" className="my-class">
        x
      </AccordionItem>
    );
    expect(screen.getByTestId('accordion-item').className).toContain('my-class');
  });
});
