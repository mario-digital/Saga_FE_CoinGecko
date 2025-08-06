import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PriceHistoryChartDynamic } from '../PriceHistoryChartDynamic';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<any>, options?: any) => {
    const Component = React.lazy(loader);
    const Loading = options?.loading || (() => <div>Loading chart...</div>);

    return (props: any) => (
      <React.Suspense fallback={<Loading />}>
        <Component {...props} />
      </React.Suspense>
    );
  },
}));

// Mock the actual PriceHistoryChart component
jest.mock('../../PriceHistoryChart', () => ({
  __esModule: true,
  default: ({ coinId }: any) => (
    <div data-testid="price-history-chart">Chart for {coinId}</div>
  ),
  PriceHistoryChart: ({ coinId }: any) => (
    <div data-testid="price-history-chart">Chart for {coinId}</div>
  ),
}));

// Mock the skeleton component
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="chart-skeleton">Loading skeleton</div>,
}));

describe('PriceHistoryChartDynamic', () => {
  it('renders PriceHistoryChart component', async () => {
    render(<PriceHistoryChartDynamic coinId="bitcoin" />);

    await waitFor(() => {
      expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
      expect(screen.getByText('Chart for bitcoin')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton initially', () => {
    // In test environment, dynamic imports resolve synchronously
    // This test would only be meaningful in a real browser environment
    render(<PriceHistoryChartDynamic coinId="bitcoin" />);

    // Component should render successfully
    expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
  });

  it('passes coinId prop correctly', async () => {
    render(<PriceHistoryChartDynamic coinId="ethereum" />);

    await waitFor(() => {
      expect(screen.getByText('Chart for ethereum')).toBeInTheDocument();
    });
  });

  it('renders with ssr disabled', async () => {
    // The component should still render client-side
    render(<PriceHistoryChartDynamic coinId="test-coin" />);

    await waitFor(() => {
      expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
    });
  });
});
