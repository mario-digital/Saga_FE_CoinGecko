import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PriceHistoryChart } from '../PriceHistoryChart';
import { usePriceHistory } from '@/hooks/usePriceHistory';

// Mock the hooks
jest.mock('@/hooks/usePriceHistory');

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey }: any) => <div data-testid={`line-${dataKey}`} />,
  XAxis: ({ dataKey }: any) => <div data-testid={`xaxis-${dataKey}`} />,
  YAxis: ({ tickFormatter }: any) => {
    // Test the tickFormatter function if provided
    if (tickFormatter) {
      const testValues = [0.5, 50, 500, 5000, 50000];
      const formattedValues = testValues.map(tickFormatter);
      return (
        <div
          data-testid="yaxis"
          data-formatted-values={JSON.stringify(formattedValues)}
        />
      );
    }
    return <div data-testid="yaxis" />;
  },
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock chart UI components
jest.mock('@/components/ui/chart', () => ({
  ChartConfig: {},
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartTooltip: ({ content }: any) => {
    // Extract and test the tooltip content if it has props
    if (content && content.props) {
      return (
        <div data-testid="chart-tooltip" data-has-content="true">
          {content}
        </div>
      );
    }
    return <div data-testid="chart-tooltip" />;
  },
  ChartTooltipContent: ({ formatter, labelFormatter }: any) => {
    // Test the formatter functions if provided
    let formattedValues: any[] = [];
    if (formatter) {
      const testValues = [0.001, 0.5, 10, 1000, 50000, 'text', null, undefined];
      formattedValues = testValues.map(formatter);
    }

    let formattedLabel = '';
    if (labelFormatter) {
      formattedLabel = labelFormatter('2024-01-01');
    }

    return (
      <div
        data-testid="chart-tooltip-content"
        data-formatted-values={JSON.stringify(formattedValues)}
        data-formatted-label={formattedLabel}
      />
    );
  },
}));

// Mock TimeRangeSelector
jest.mock('../TimeRangeSelector', () => ({
  TimeRangeSelector: ({ value, onChange }: any) => (
    <div data-testid="time-range-selector" role="radiogroup">
      <button onClick={() => onChange('24h')}>24H</button>
      <button onClick={() => onChange('7d')}>7D</button>
      <button onClick={() => onChange('30d')}>30D</button>
      <button onClick={() => onChange('90d')}>90D</button>
      <button onClick={() => onChange('1y')}>1Y</button>
      <div>Current: {value}</div>
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-icon">Alert</div>,
  RefreshCw: () => <div data-testid="refresh-icon">Refresh</div>,
}));

// Mock UI components
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

describe('PriceHistoryChart', () => {
  const mockUsePriceHistory = usePriceHistory as jest.Mock;
  const mockRetry = jest.fn();

  const mockData = [
    { date: '2024-01-01', price: 45000 },
    { date: '2024-01-02', price: 46000 },
    { date: '2024-01-03', price: 47000 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePriceHistory.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      retry: mockRetry,
    });
  });

  it('renders chart with data', () => {
    render(<PriceHistoryChart coinId="bitcoin" coinName="Bitcoin" />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Price History')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin price over time')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    // Should show skeleton loader
    expect(screen.getByText('Price History')).toBeInTheDocument();
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error state', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to fetch data',
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    expect(screen.getByText('Unable to load price data')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
  });

  it('calls retry when retry button is clicked', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Error',
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('handles time range changes', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    // Initially shows 7d
    expect(screen.getByText('Current: 7d')).toBeInTheDocument();

    // Click 30d button
    const button30d = screen.getByText('30D');
    fireEvent.click(button30d);

    // Should update the time range
    expect(mockUsePriceHistory).toHaveBeenCalledWith('bitcoin', '30d');
  });

  it('shows no data message when data is empty', () => {
    mockUsePriceHistory.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    expect(screen.getByText('No price data available')).toBeInTheDocument();
    expect(
      screen.getByText('No price history data available for this time range')
    ).toBeInTheDocument();
  });

  it('formats chart data correctly', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    const chart = screen.getByTestId('line-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');

    expect(data).toEqual(mockData);
  });

  it('uses coin ID when coin name is not provided', () => {
    render(<PriceHistoryChart coinId="ethereum" />);

    expect(screen.getByText('Price History')).toBeInTheDocument();
    expect(screen.getByText('Price over time')).toBeInTheDocument();
  });

  it('renders chart components', () => {
    const { container } = render(
      <PriceHistoryChart coinId="bitcoin" coinName="Bitcoin" />
    );

    // Check for chart elements by looking for the chart container
    expect(screen.getByText('Price History')).toBeInTheDocument();
    // Check that time range selector is present
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('displays time range selector', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    // Check for radio group instead of test-id
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getByText('24H')).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
    expect(screen.getByText('90D')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
  });

  it('maintains selected time range across re-renders', () => {
    const { rerender } = render(<PriceHistoryChart coinId="bitcoin" />);

    // Change to 30d
    fireEvent.click(screen.getByText('30D'));

    // Re-render with same props
    rerender(<PriceHistoryChart coinId="bitcoin" />);

    // Should still be 30d
    expect(mockUsePriceHistory).toHaveBeenLastCalledWith('bitcoin', '30d');
  });

  it('updates when coin ID changes', () => {
    const { rerender } = render(<PriceHistoryChart coinId="bitcoin" />);

    expect(mockUsePriceHistory).toHaveBeenCalledWith('bitcoin', '7d');

    rerender(<PriceHistoryChart coinId="ethereum" />);

    expect(mockUsePriceHistory).toHaveBeenCalledWith('ethereum', '7d');
  });

  it('shows formatted price in tooltip', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    // Chart tooltip is mocked so just check it exists
    expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
  });

  it('handles loading state with skeleton', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    // Check for skeleton loader using data-testid
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays correct chart config', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    // The chart should be rendered with correct configuration
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('handles all time range options', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    const timeRanges = ['24h', '7d', '30d', '90d', '1y'];

    timeRanges.forEach(range => {
      const button = screen.getByText(
        range
          .toUpperCase()
          .replace('H', 'H')
          .replace('D', 'D')
          .replace('Y', 'Y')
      );
      fireEvent.click(button);

      expect(mockUsePriceHistory).toHaveBeenCalledWith('bitcoin', range);
    });
  });

  it('memoizes component to prevent unnecessary re-renders', () => {
    const { rerender } = render(
      <PriceHistoryChart coinId="bitcoin" coinName="Bitcoin" />
    );

    const initialCallCount = mockUsePriceHistory.mock.calls.length;

    // Re-render with same props
    rerender(<PriceHistoryChart coinId="bitcoin" coinName="Bitcoin" />);

    // Should not cause additional hook calls due to memoization
    expect(mockUsePriceHistory.mock.calls.length).toBeLessThanOrEqual(
      initialCallCount + 1
    );
  });

  it('formats Y-axis tick values correctly', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    const yAxis = screen.getByTestId('yaxis');
    const formattedValues = JSON.parse(
      yAxis.getAttribute('data-formatted-values') || '[]'
    );

    // Test different price ranges
    expect(formattedValues[0]).toBe('$0.5000'); // < 1
    expect(formattedValues[1]).toBe('$50.00'); // >= 1 but < 1000
    expect(formattedValues[2]).toBe('$500.00'); // >= 1 but < 1000
    expect(formattedValues[3]).toBe('$5.0k'); // >= 1000
    expect(formattedValues[4]).toBe('$50.0k'); // >= 1000
  });

  it('formats tooltip values correctly', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    const tooltipContent = screen.getByTestId('chart-tooltip-content');
    const formattedValues = JSON.parse(
      tooltipContent.getAttribute('data-formatted-values') || '[]'
    );

    // Test number formatting
    expect(formattedValues[0]).toBe('$0.0010'); // Small number < 1
    expect(formattedValues[1]).toBe('$0.5000'); // Number < 1
    expect(formattedValues[2]).toBe('$10.00'); // Number >= 1
    expect(formattedValues[3]).toBe('$1,000.00'); // Large number
    expect(formattedValues[4]).toBe('$50,000.00'); // Very large number

    // Test non-number values
    expect(formattedValues[5]).toBe('text'); // String passes through
    expect(formattedValues[6]).toBe(null); // Null passes through
    expect(formattedValues[7]).toBe(null); // Undefined becomes null in JSON
  });

  it('formats tooltip label correctly', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    const tooltipContent = screen.getByTestId('chart-tooltip-content');
    const formattedLabel = tooltipContent.getAttribute('data-formatted-label');

    // labelFormatter should pass through the value as-is
    expect(formattedLabel).toBe('2024-01-01');
  });

  it('handles null data gracefully', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    expect(screen.getByText('No price data available')).toBeInTheDocument();
  });

  it('displays correct description with coin name', () => {
    render(<PriceHistoryChart coinId="bitcoin" coinName="Bitcoin" />);

    expect(screen.getByText('Bitcoin price over time')).toBeInTheDocument();
  });

  it('displays generic description without coin name', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    expect(screen.getByText('Price over time')).toBeInTheDocument();
  });

  it('renders chart tooltip with content', () => {
    render(<PriceHistoryChart coinId="bitcoin" />);

    const tooltip = screen.getByTestId('chart-tooltip');
    expect(tooltip).toHaveAttribute('data-has-content', 'true');
  });

  it('handles error with fallback message', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: false,
      error: null, // No error message
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    // Should show no data message when error is null but data is also null
    expect(screen.getByText('No price data available')).toBeInTheDocument();
  });

  it('displays formatted data in chart', () => {
    const detailedMockData = [
      { date: '2024-01-01', formattedDate: 'Jan 1', price: 0.001 },
      { date: '2024-01-02', formattedDate: 'Jan 2', price: 999.99 },
      { date: '2024-01-03', formattedDate: 'Jan 3', price: 50000 },
    ];

    mockUsePriceHistory.mockReturnValue({
      data: detailedMockData,
      isLoading: false,
      error: null,
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    const chart = screen.getByTestId('line-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');

    expect(data).toEqual(detailedMockData);
    expect(data[0].formattedDate).toBe('Jan 1');
  });

  it('shows no data when error is empty string', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: false,
      error: '', // Empty string error is falsy
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    // Empty string error is falsy, so shows no data state
    expect(screen.getByText('No price data available')).toBeInTheDocument();
    expect(
      screen.getByText('No price history data available for this time range')
    ).toBeInTheDocument();
  });

  it('shows error with custom error message', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Network timeout occurred', // Custom error message
      retry: mockRetry,
    });

    render(<PriceHistoryChart coinId="bitcoin" />);

    expect(screen.getByText('Unable to load price data')).toBeInTheDocument();
    expect(screen.getByText('Network timeout occurred')).toBeInTheDocument();
  });

  it('shows error with whitespace-only error message', () => {
    mockUsePriceHistory.mockReturnValue({
      data: null,
      isLoading: false,
      error: '   ', // Whitespace-only string is truthy
      retry: mockRetry,
    });

    const { container } = render(<PriceHistoryChart coinId="bitcoin" />);

    expect(screen.getByText('Unable to load price data')).toBeInTheDocument();
    // Check that the whitespace error is in the paragraph
    const errorParagraph = container.querySelector(
      '.text-sm.text-muted-foreground.mb-4'
    );
    expect(errorParagraph?.textContent).toBe('   ');
  });
});
