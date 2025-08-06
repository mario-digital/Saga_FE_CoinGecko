import React, { Suspense } from 'react';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import HomePage from '../page';
import { useCoins } from '@/hooks/useCoins';
import { CoinData } from '@/types/coingecko';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/useCoins');
jest.mock('@/hooks/useFilteredCoins', () => ({
  useFilteredCoins: ({ coins, filter }: any) => {
    const filtered = coins || [];
    return {
      filteredCoins: filtered,
      filterCount: filtered.length,
      totalCount: filtered.length,
    };
  },
}));

// Mock CoinCardSkeleton
jest.mock('@/components/CoinCardSkeleton', () => ({
  CoinCardSkeleton: () => <div className="animate-pulse">Loading...</div>,
}));

// Mock CoinCard
jest.mock('@/components/CoinCard', () => ({
  CoinCard: ({ coin, onClick }: any) => (
    <div
      role="button"
      className="grid hover:scale-[1.02]"
      onClick={() => onClick(coin.id)}
      aria-label={`View details for ${coin.name}`}
    >
      <span>{coin.name}</span>
      <span>{coin.symbol}</span>
    </div>
  ),
}));

// Mock FilterMarketCap
jest.mock('@/components/FilterMarketCap', () => ({
  __esModule: true,
  default: ({ filter, onFilterChange }: any) => (
    <div role="radiogroup">
      <button
        role="radio"
        aria-checked="false"
        aria-label="Show all coins"
        onClick={() => onFilterChange('all')}
      >
        All
      </button>
      <button
        role="radio"
        aria-checked="false"
        aria-label="Show top 10 coins"
        onClick={() => onFilterChange('top10')}
      >
        Top 10
      </button>
      <button
        role="radio"
        aria-checked="false"
        aria-label="Show top 50 coins"
        onClick={() => onFilterChange('top50')}
      >
        Top 50
      </button>
      <button
        role="radio"
        aria-checked="false"
        aria-label="Show top 100 coins"
        onClick={() => onFilterChange('top100')}
      >
        Top 100
      </button>
    </div>
  ),
}));

// Mock Pagination
jest.mock('@/components/Pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange, disabled }: any) => (
    <nav role="navigation">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
      >
        Previous
      </button>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  ),
}));

// Mock dynamic imports properly
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: any, options?: any) => {
    // For SwipeableCoinCard
    if (loader.toString().includes('SwipeableCoinCard')) {
      const SwipeableCard = ({ coin, onClick }: any) => (
        <div
          aria-label={`View details for ${coin.name}`}
          onClick={() => onClick(coin.id)}
        >
          {coin.name}
        </div>
      );
      return SwipeableCard;
    }
    // For PullToRefresh
    if (loader.toString().includes('PullToRefresh')) {
      const PullToRefresh = ({ children, onRefresh }: any) => (
        <div>{children}</div>
      );
      return PullToRefresh;
    }
    // Default mock component
    const Component = () => <div />;
    return Component;
  },
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;
const mockUseCoins = useCoins as jest.MockedFunction<typeof useCoins>;

const mockCoinData: CoinData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    total_volume: 25000000000,
    price_change_percentage_24h: 2.5,
    last_updated: '2024-01-01T12:00:00.000Z',
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3000,
    market_cap: 360000000000,
    market_cap_rank: 2,
    total_volume: 15000000000,
    price_change_percentage_24h: -1.2,
    last_updated: '2024-01-01T12:00:00.000Z',
  },
];

const mockPush = jest.fn();

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    // Mock useSearchParams to return a proper URLSearchParams object
    const searchParams = new URLSearchParams() as any;
    mockUseSearchParams.mockReturnValue(searchParams);

    // Mock window.scrollTo
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('displays loading state initially', async () => {
    mockUseCoins.mockReturnValue({
      coins: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<HomePage />);

    // The Suspense fallback should show skeletons
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays coins when data is loaded', async () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      const bitcoinElements = screen.getAllByText('Bitcoin');
      expect(bitcoinElements.length).toBeGreaterThan(0);
    });

    const ethereumElements = screen.getAllByText('Ethereum');
    expect(ethereumElements.length).toBeGreaterThan(0);
    const btcElements = screen.getAllByText('btc');
    expect(btcElements.length).toBeGreaterThan(0);
    const ethElements = screen.getAllByText('eth');
    expect(ethElements.length).toBeGreaterThan(0);
  });

  it('displays error state when there is an error', () => {
    const mockRefetch = jest.fn();
    mockUseCoins.mockReturnValue({
      coins: undefined,
      isLoading: false,
      error: 'Failed to fetch data',
      refetch: mockRefetch,
    });

    render(<HomePage />);

    expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls refetch when "Try Again" button is clicked in error state', async () => {
    const user = userEvent.setup();
    const mockRefetch = jest.fn();
    mockUseCoins.mockReturnValue({
      coins: undefined,
      isLoading: false,
      error: 'Failed to fetch data',
      refetch: mockRefetch,
    });

    render(<HomePage />);

    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('displays empty state when no coins are available', async () => {
    const mockRefetch = jest.fn();
    mockUseCoins.mockReturnValue({
      coins: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Unable to load cryptocurrency data at this time.')
    ).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('calls refetch when "Refresh" button is clicked in empty state', async () => {
    const user = userEvent.setup();
    const mockRefetch = jest.fn();
    mockUseCoins.mockReturnValue({
      coins: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('handles coin click and navigates to coin detail page', async () => {
    const user = userEvent.setup();
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      const bitcoinElements = screen.getAllByText('Bitcoin');
      expect(bitcoinElements.length).toBeGreaterThan(0);
    });

    const bitcoinCard = screen.getByRole('button', {
      name: /View details for Bitcoin/i,
    });
    await user.click(bitcoinCard);
    expect(mockPush).toHaveBeenCalledWith('/bitcoin');
  });

  it('renders pagination component with correct props', async () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('handles page change and calls useCoins with new page', async () => {
    const user = userEvent.setup();

    mockUseCoins.mockImplementation(() => {
      return {
        coins: mockCoinData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      };
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(mockPush).toHaveBeenCalledWith('/?page=2', { scroll: true });
  });

  it('does not show pagination when loading', async () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(<HomePage />);
    });

    // During loading, Suspense shows fallback (skeletons)
    // Pagination should not be in the document
    const previousButton = screen.queryByText('Previous');
    const nextButton = screen.queryByText('Next');

    expect(previousButton).not.toBeInTheDocument();
    expect(nextButton).not.toBeInTheDocument();
  });

  it('renders coins in a grid layout', async () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      const bitcoinElements = screen.getAllByText('Bitcoin');
      expect(bitcoinElements.length).toBeGreaterThan(0);
    });

    const bitcoinElements = screen.getAllByText('Bitcoin');
    const grid = bitcoinElements[0].closest('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid');
  });

  it('applies hover effects to coin cards', async () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      const bitcoinElements = screen.getAllByText('Bitcoin');
      expect(bitcoinElements.length).toBeGreaterThan(0);
    });

    const bitcoinCard = screen.getByRole('button', {
      name: /View details for Bitcoin/i,
    });
    expect(bitcoinCard).toHaveClass('hover:scale-[1.02]');
  });

  it('shows loading skeletons with correct styling', async () => {
    mockUseCoins.mockReturnValue({
      coins: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<HomePage />);

    // Immediately check for skeletons (Suspense fallback)
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    // Check that skeleton cards are rendered in grid
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('maintains state consistency during loading transitions', async () => {
    let isLoading = true;
    const mockRefetch = jest.fn();

    mockUseCoins.mockImplementation(() => ({
      coins: isLoading ? undefined : mockCoinData,
      isLoading,
      error: null,
      refetch: mockRefetch,
    }));

    const { rerender, container } = render(<HomePage />);

    // Check for loading skeletons
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    // Transition to loaded state
    isLoading = false;

    await act(async () => {
      rerender(<HomePage />);
    });

    await waitFor(() => {
      const bitcoinElements = screen.getAllByText('Bitcoin');
      expect(bitcoinElements.length).toBeGreaterThan(0);
    });

    // Verify that coin data is shown
    const bitcoinElements = screen.getAllByText('Bitcoin');
    const ethereumElements = screen.getAllByText('Ethereum');
    expect(bitcoinElements.length).toBeGreaterThan(0);
    expect(ethereumElements.length).toBeGreaterThan(0);
  });

  it('handles undefined coins gracefully', async () => {
    mockUseCoins.mockReturnValue({
      coins: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });
  });
});
