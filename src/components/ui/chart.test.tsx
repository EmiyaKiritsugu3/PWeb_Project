import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="chart-tooltip" />,
  Legend: () => <div data-testid="chart-legend" />,
}));

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from './chart';

const sampleConfig = {
  desktop: { label: 'Desktop', color: '#2563eb' },
  mobile: { label: 'Mobile', color: '#10b981' },
};

describe('ChartContainer', () => {
  it('renders without throwing', () => {
    const { container } = render(
      <ChartContainer config={sampleConfig}>
        <div>chart children</div>
      </ChartContainer>
    );
    expect(container).toBeTruthy();
  });

  it('renders children inside ResponsiveContainer', () => {
    render(
      <ChartContainer config={sampleConfig}>
        <div>Inner chart</div>
      </ChartContainer>
    );
    expect(screen.getByText('Inner chart')).toBeTruthy();
    expect(screen.getByTestId('responsive-container')).toBeTruthy();
  });

  it('applies data-chart attribute', () => {
    render(
      <ChartContainer config={sampleConfig} id="test-chart" data-testid="chart">
        <div>child</div>
      </ChartContainer>
    );
    expect(screen.getByTestId('chart')).toHaveAttribute('data-chart');
  });

  it('injects CSS custom properties via style tag', () => {
    const { container } = render(
      <ChartContainer config={sampleConfig} id="color-chart">
        <div>child</div>
      </ChartContainer>
    );
    const styleEl = container.querySelector('style');
    expect(styleEl).toBeTruthy();
    expect(styleEl?.innerHTML).toContain('--color-desktop');
    expect(styleEl?.innerHTML).toContain('--color-mobile');
  });
});

describe('ChartTooltip', () => {
  it('renders recharts Tooltip', () => {
    render(<ChartTooltip />);
    expect(screen.getByTestId('chart-tooltip')).toBeTruthy();
  });
});

describe('ChartLegend', () => {
  it('renders recharts Legend', () => {
    render(<ChartLegend />);
    expect(screen.getByTestId('chart-legend')).toBeTruthy();
  });
});

describe('ChartTooltipContent', () => {
  it('renders nothing when not active', () => {
    const { container } = render(
      <ChartContainer config={sampleConfig}>
        <ChartTooltipContent
          active={false}
          payload={[]}
          coordinate={{ x: 0, y: 0 }}
          accessibilityLayer={true}
          activeIndex={'0'}
        />
      </ChartContainer>
    );
    expect(container.querySelector('[class*="grid min-w"]')).toBeNull();
  });

  it('renders nothing when no payload', () => {
    const { container } = render(
      <ChartContainer config={sampleConfig}>
        <ChartTooltipContent
          active={true}
          payload={[]}
          coordinate={{ x: 0, y: 0 }}
          accessibilityLayer={true}
          activeIndex={'0'}
        />
      </ChartContainer>
    );
    expect(container.querySelector('[class*="grid min-w"]')).toBeNull();
  });

  it('renders tooltip with payload', () => {
    render(
      <ChartContainer config={sampleConfig}>
        <ChartTooltipContent
          active={true}
          payload={[
            {
              name: 'desktop',
              value: 100,
              dataKey: 'desktop',
              color: '#2563eb',
              payload: {},
              graphicalItemId: '1',
            },
          ]}
          coordinate={{ x: 0, y: 0 }}
          accessibilityLayer={true}
          activeIndex={'0'}
        />
      </ChartContainer>
    );
    expect(screen.getByText('100')).toBeTruthy();
  });
});

describe('ChartLegendContent', () => {
  it('renders nothing with empty payload', () => {
    const { container } = render(
      <ChartContainer config={sampleConfig}>
        <ChartLegendContent payload={[]} />
      </ChartContainer>
    );
    expect(container.querySelector('[class*="flex items-center justify-center"]')).toBeNull();
  });

  it('renders legend items from config', () => {
    render(
      <ChartContainer config={sampleConfig}>
        <ChartLegendContent
          payload={[
            { value: 'desktop', dataKey: 'desktop', color: '#2563eb', type: 'circle' },
            { value: 'mobile', dataKey: 'mobile', color: '#10b981', type: 'circle' },
          ]}
        />
      </ChartContainer>
    );
    expect(screen.getByText('Desktop')).toBeTruthy();
    expect(screen.getByText('Mobile')).toBeTruthy();
  });
});
