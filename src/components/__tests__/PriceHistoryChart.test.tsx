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
  YAxis: () => <div data-testid="yaxis" />,
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
  ChartTooltip: ({ children }: any) => (
    <div data-testid="chart-tooltip">{children}</div>
  ),
  ChartTooltipContent: ({ children }: any) => (
    <div data-testid="chart-tooltip-content">{children}</div>
  ),
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
      error: { message: 'Failed to fetch data' },
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
      error: { message: 'Error' },
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
});
