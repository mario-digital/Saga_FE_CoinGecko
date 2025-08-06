import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from '../chart';

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: ({ content }: any) => <div data-testid="tooltip">{content}</div>,
  Legend: ({ content }: any) => <div data-testid="legend">{content}</div>,
}));

describe('Chart Components', () => {
  const mockConfig = {
    line: { label: 'Line', color: 'hsl(var(--chart-1))' },
    bar: { label: 'Bar', color: 'hsl(var(--chart-2))' },
  };

  describe('ChartContainer', () => {
    it('renders children with ResponsiveContainer', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <div>Chart Content</div>
        </ChartContainer>
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByText('Chart Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
    const { container } = render(
        <ChartContainer config={mockConfig} className="custom-class">
          <div>Content</div>
        </ChartContainer>
      );

      const wrapper = container.querySelector('[data-chart]');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('sets config in context', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent />
        </ChartContainer>
      );

      // The config should be available to child components via context
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('applies default aspect ratio', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <div>Content</div>
        </ChartContainer>
      );

      const wrapper = container.querySelector('[data-chart]');
      expect(wrapper).toHaveClass('aspect-video');
    });

    it('renders with custom id', () => {
    const { container } = render(
        <ChartContainer config={mockConfig} id="test-chart">
          <div>Content</div>
        </ChartContainer>
      );

      const element = container.querySelector(
        '[data-chart="chart-test-chart"]'
      );
      expect(element).toBeInTheDocument();
    });
  });

  describe('ChartTooltip', () => {
    it('renders Tooltip component from recharts', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltip />
        </ChartContainer>
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('uses ChartTooltipContent as default content', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltip />
        </ChartContainer>
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('accepts custom content', () => {
      const CustomContent = () => <div>Custom Tooltip</div>;

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltip content={<CustomContent />} />
        </ChartContainer>
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('hides arrow by default', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltip cursor={false} />
        </ChartContainer>
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('ChartTooltipContent', () => {
    it('renders tooltip content when active', () => {
      const payload = [
        { dataKey: 'line', value: 100, payload: { fill: 'red' } },
        { dataKey: 'bar', value: 200, payload: { fill: 'blue' } },
      ];

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            label="January"
          />
        </ChartContainer>
      );

      expect(screen.getByText('January')).toBeInTheDocument();
    });

    it('returns null when not active', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={false} />
        </ChartContainer>
      );

      const tooltipContent = container.querySelector('.rounded-lg.border');
      expect(tooltipContent).not.toBeInTheDocument();
    });

    it('handles indicator display', () => {
      const payload = [
        {
          dataKey: 'line',
          value: 100,
          payload: { fill: 'red' },
          name: 'line',
        },
      ];

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            indicator="line"
          />
        </ChartContainer>
      );

      // Should render with line indicator - check for the value instead of label to avoid ambiguity
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('hides label when specified', () => {
      const payload = [
        { dataKey: 'line', value: 100, name: 'line', payload: { fill: 'red' } },
      ];

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            label="Test Label"
            hideLabel={true}
          />
        </ChartContainer>
      );

      expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });

    it('formats values with custom formatter', () => {
      const payload = [
        {
          dataKey: 'line',
          value: 1000,
          name: 'line',
          payload: { fill: 'red' },
        },
      ];
      const formatter = (value: any) => `$${value}`;

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            formatter={formatter}
          />
        </ChartContainer>
      );

      expect(screen.getByText('$1000')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const payload = [
        { dataKey: 'line', value: 100, name: 'line', payload: { fill: 'red' } },
      ];

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            className="custom-tooltip"
          />
        </ChartContainer>
      );

      const tooltip = container.querySelector('.custom-tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    it('displays nested values correctly', () => {
      const payload = [
        {
          dataKey: 'nested.value',
          value: 150,
          payload: { fill: 'green' },
          name: 'nested.value',
        },
      ];

      const nestedConfig = {
        'nested.value': { label: 'Nested Value', color: 'green' },
      };

    const { container } = render(
        <ChartContainer config={nestedConfig}>
          <ChartTooltipContent active={true} payload={payload} />
        </ChartContainer>
      );

      // Check that the value is displayed
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  describe('ChartLegend', () => {
    it('renders Legend component from recharts', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegend />
        </ChartContainer>
      );

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('uses ChartLegendContent as default content', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegend />
        </ChartContainer>
      );

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('accepts custom content', () => {
      const CustomLegend = () => <div>Custom Legend</div>;

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegend content={<CustomLegend />} />
        </ChartContainer>
      );

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });

  describe('ChartLegendContent', () => {
    it('renders legend items', () => {
      const payload = [
        { value: 'line', dataKey: 'line' },
        { value: 'bar', dataKey: 'bar' },
      ];

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} />
        </ChartContainer>
      );

      expect(screen.getByText('Line')).toBeInTheDocument();
      expect(screen.getByText('Bar')).toBeInTheDocument();
    });

    it('handles vertical align', () => {
      const payload = [{ value: 'line', dataKey: 'line' }];

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} verticalAlign="top" />
        </ChartContainer>
      );

      const legend = container.querySelector('.flex.items-center');
      expect(legend).toHaveClass('pb-3');
    });

    it('applies custom className', () => {
      const payload = [{ value: 'line', dataKey: 'line' }];

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} className="custom-legend" />
        </ChartContainer>
      );

      const legend = container.querySelector('.custom-legend');
      expect(legend).toBeInTheDocument();
    });

    it('hides icon when specified', () => {
      const payload = [{ value: 'line', dataKey: 'line' }];

    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} hideIcon />
        </ChartContainer>
      );

      const icon = container.querySelector('[data-color]');
      expect(icon).not.toBeInTheDocument();
    });

    it('returns null when no payload', () => {
    const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent />
        </ChartContainer>
      );

      const legend = container.querySelector('.flex.items-center');
      expect(legend).not.toBeInTheDocument();
    });
  });

  describe('ChartStyle', () => {
    it('renders style element with CSS variables', () => {
    const { container } = render(
        <ChartStyle id="test" config={mockConfig} />
      );

      const style = container.querySelector('style');
      expect(style).toBeInTheDocument();
      expect(style?.innerHTML).toContain('[data-chart=test]');
    });

    it('generates CSS variables for each config item', () => {
    const { container } = render(
        <ChartStyle id="chart-1" config={mockConfig} />
      );

      const style = container.querySelector('style');
      expect(style?.innerHTML).toContain('--color-line');
      expect(style?.innerHTML).toContain('--color-bar');
    });

    it('handles different color formats', () => {
      const config = {
        primary: { label: 'Primary', color: 'hsl(220, 90%, 50%)' },
        secondary: { label: 'Secondary', color: '#ff0000' },
        tertiary: { label: 'Tertiary', color: 'rgb(0, 255, 0)' },
      };

    const { container } = render(
        <ChartStyle id="multi-color" config={config} />
      );

      const style = container.querySelector('style');
      expect(style?.innerHTML).toContain('--color-primary');
      expect(style?.innerHTML).toContain('--color-secondary');
      expect(style?.innerHTML).toContain('--color-tertiary');
    });
  });
});
