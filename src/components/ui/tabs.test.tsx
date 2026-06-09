import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@radix-ui/react-tabs', () => {
  const Root = ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    <div data-testid="tabs-root" {...props}>
      {children}
    </div>
  );
  Root.displayName = 'Tabs';

  const List = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} role="tablist" {...props}>
        {children}
      </div>
    )
  );
  List.displayName = 'TabsList';

  const Trigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
    ({ children, ...props }, ref) => (
      <button ref={ref} role="tab" {...props}>
        {children}
      </button>
    )
  );
  Trigger.displayName = 'TabsTrigger';

  const Content = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} role="tabpanel" {...props}>
        {children}
      </div>
    )
  );
  Content.displayName = 'TabsContent';

  return { Root, List, Trigger, Content };
});

import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs components', () => {
  it('Tabs renders children', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('tabs-root')).toBeTruthy();
  });

  it('TabsList renders with role tablist', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList data-testid="list">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('list').getAttribute('role')).toBe('tablist');
  });

  it('TabsTrigger renders as tab button', () => {
    render(
      <Tabs defaultValue="x">
        <TabsList>
          <TabsTrigger value="x" data-testid="trigger">
            My Tab
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('trigger').getAttribute('role')).toBe('tab');
    expect(screen.getByText('My Tab')).toBeTruthy();
  });

  it('TabsContent renders panel', () => {
    render(
      <Tabs defaultValue="y">
        <TabsList>
          <TabsTrigger value="y">Y</TabsTrigger>
        </TabsList>
        <TabsContent value="y" data-testid="panel">
          Panel Content
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('panel').getAttribute('role')).toBe('tabpanel');
    expect(screen.getByText('Panel Content')).toBeTruthy();
  });

  it('Tabs passes className', () => {
    render(
      <Tabs defaultValue="z" className="tabs-custom">
        <div />
      </Tabs>
    );
    expect(screen.getByTestId('tabs-root').className).toContain('tabs-custom');
  });
});
