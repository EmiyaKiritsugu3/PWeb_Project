import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';

vi.mock('@radix-ui/react-collapsible', () => ({
  Root: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="collapsible-root" {...props}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button data-testid="collapsible-trigger" {...props}>
      {children}
    </button>
  ),
  CollapsibleContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="collapsible-content" {...props}>
      {children}
    </div>
  ),
}));

describe('Collapsible', () => {
  it('exports Collapsible component', () => {
    expect(Collapsible).toBeDefined();
  });

  it('exports CollapsibleTrigger component', () => {
    expect(CollapsibleTrigger).toBeDefined();
  });

  it('exports CollapsibleContent component', () => {
    expect(CollapsibleContent).toBeDefined();
  });

  it('renders Collapsible with children', () => {
    const { getByTestId } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(getByTestId('collapsible-root')).toBeTruthy();
    expect(getByTestId('collapsible-trigger')).toBeTruthy();
    expect(getByTestId('collapsible-content')).toBeTruthy();
  });
});
