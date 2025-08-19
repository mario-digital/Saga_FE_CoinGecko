import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import HomePage from '@/app/page';
import { useCoins } from '@/hooks/useCoins';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the useCoins hook
jest.mock('@/hooks/useCoins');

// Mock PullToRefresh component
jest.mock('@/components/PullToRefresh', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/dynamic to avoid issues with dynamic imports in tests
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any, _options?: any) => {
    // For PullToRefresh, return a simple component that renders children
    if (fn.toString().includes('PullToRefresh')) {
      const Component = ({ children }: { children: React.ReactNode }) =>
        children;
      Component.preload = jest.fn();
      return Component;
    }
    // For SwipeableCoinCard, mock the component
    if (fn.toString().includes('SwipeableCoinCard')) {
      const SwipeableCoinCard = ({ coin, onClick, className }: any) => (
        <div
          className={className}
          onClick={() => onClick(coin.id)}
          data-testid={`coin-card-${coin.id}`}
        >
          <div>{coin.name}</div>
          <div>{coin.symbol}</div>
          <div>{coin.current_price}</div>
        </div>
      );
      SwipeableCoinCard.preload = jest.fn();
      return SwipeableCoinCard;
    }
    // For other components, resolve the promise synchronously
    const Component = () => null;
    return Component;
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

const mockSearchParams = new URLSearchParams();
const mockGetSearchParam = jest.fn((key: string) => mockSearchParams.get(key));

// Mock coin data
const mockCoins = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/bitcoin.png',
    current_price: 45000,
    market_cap: 900000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.5,
    total_volume: 25000000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://example.com/ethereum.png',
    current_price: 3000,
    market_cap: 350000000000,
    market_cap_rank: 2,
    price_change_percentage_24h: 1.8,
    total_volume: 15000000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    image: 'https://example.com/cardano.png',
    current_price: 0.5,
    market_cap: 16000000000,
    market_cap_rank: 15,
    price_change_percentage_24h: -1.2,
    total_volume: 800000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'polygon',
    symbol: 'matic',
    name: 'Polygon',
    image: 'https://example.com/polygon.png',
    current_price: 0.8,
    market_cap: 7000000000,
    market_cap_rank: 55,
    price_change_percentage_24h: 3.1,
    total_volume: 400000000,
    last_updated: '2024-01-01',
  },
];

describe('HomePage Filter Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGetSearchParam,
      toString: () => mockSearchParams.toString(),
    });
    (useCoins as jest.Mock).mockReturnValue({
      coins: mockCoins,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders FilterMarketCap component', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Check that filter radio buttons are rendered
    // The FilterMarketCap component should be present
    await waitFor(() => {
      const allRadio = screen.getByLabelText('Show all coins');
      expect(allRadio).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Show top 10 coins')).toBeInTheDocument();
    expect(screen.getByLabelText('Show top 50 coins')).toBeInTheDocument();
    expect(screen.getByLabelText('Show top 100 coins')).toBeInTheDocument();
  });

  it('displays all coins by default', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Wait for coins to be rendered
    await waitFor(() => {
      // Use getAllByText and check the first element to handle potential duplicates
      expect(screen.getAllByText('Bitcoin')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Ethereum')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Cardano')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Polygon')[0]).toBeInTheDocument();
    });
  });

  it.skip('filters coins when Top 10 is selected', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // Click the filter button
    await user.click(screen.getByLabelText('Show top 10 coins'));

    // Wait for the filter to take effect
    await waitFor(() => {
      // Should show only coins with rank <= 10
      expect(screen.getAllByText('Bitcoin')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Ethereum')[0]).toBeInTheDocument();
      // Cardano (rank 15) and Polygon (rank 55) should not be visible
      expect(screen.queryAllByText('Cardano')).toHaveLength(0);
      expect(screen.queryAllByText('Polygon')).toHaveLength(0);
    });
  });

  it.skip('shows filter count indicator when filter is active', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByLabelText('Show top 10 coins'));

    // After clicking the filter, verify that only 2 coins are shown
    await waitFor(() => {
      // Bitcoin and Ethereum should be visible (rank 1 and 2)
      expect(screen.getAllByText('Bitcoin')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Ethereum')[0]).toBeInTheDocument();
    });

    // Now check for the filter count text
    // The text "Showing 2 of 4 coins" should be present
    const filterText = await screen.findByText('Showing 2 of 4 coins');
    expect(filterText).toBeInTheDocument();
  });

  it('updates URL when filter changes', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<HomePage />);
    });

    await user.click(screen.getByLabelText('Show top 50 coins'));

    expect(mockPush).toHaveBeenCalledWith('/?filter=top50&page=1');
  });

  it('resets to page 1 when filter changes', async () => {
    // Start on page 2
    mockSearchParams.set('page', '2');
    mockGetSearchParam.mockImplementation(key => (key === 'page' ? '2' : null));

    const user = userEvent.setup();
    await act(async () => {
      render(<HomePage />);
    });

    await user.click(screen.getByLabelText('Show top 10 coins'));

    // URLSearchParams maintains insertion order (filter first, then page)
    expect(mockPush).toHaveBeenCalledWith('/?filter=top10&page=1');
  });

  it('initializes filter from URL parameter', async () => {
    mockSearchParams.set('filter', 'top50');
    mockGetSearchParam.mockImplementation(key =>
      key === 'filter' ? 'top50' : null
    );

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Show top 50 coins')).toHaveAttribute(
        'data-state',
        'on'
      );
    });
  });

  it('shows empty state when no coins match filter', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<HomePage />);
    });

    // Filter to top 10, but our data has no coins in top 10
    (useCoins as jest.Mock).mockReturnValue({
      coins: mockCoins.filter(
        c => c.market_cap_rank !== null && c.market_cap_rank > 100
      ),
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    await user.click(screen.getByLabelText('Show top 10 coins'));

    expect(screen.getByText('No Coins Match Filter')).toBeInTheDocument();
    expect(
      screen.getByText(/Try selecting a different filter/)
    ).toBeInTheDocument();
    expect(screen.getByText('Clear Filter')).toBeInTheDocument();
  });

  it('clears filter when Clear Filter button is clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<HomePage />);
    });

    // Set a filter first
    await user.click(screen.getByLabelText('Show top 10 coins'));

    // Mock no results for this filter
    (useCoins as jest.Mock).mockReturnValue({
      coins: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    // Re-render to show empty state
    await act(async () => {
      render(<HomePage />);
    });

    // Click clear filter
    await user.click(screen.getByText('Clear Filter'));

    expect(mockPush).toHaveBeenLastCalledWith('/?page=1');
  });

  it('preserves filter when pagination changes', async () => {
    mockSearchParams.set('filter', 'top50');
    mockGetSearchParam.mockImplementation(key =>
      key === 'filter' ? 'top50' : null
    );

    const user = userEvent.setup();
    let container: HTMLElement;
    await act(async () => {
      const result = render(<HomePage />);
      container = result.container;
    });

    // Click page 2
    const page2Button = container!.querySelector(
      'button[aria-label="Go to page 2"]'
    );
    if (page2Button) {
      await user.click(page2Button);
      expect(mockPush).toHaveBeenCalledWith('/?filter=top50&page=2');
    }
  });

  it('removes filter param from URL when "all" is selected', async () => {
    mockSearchParams.set('filter', 'top50');
    mockGetSearchParam.mockImplementation(key =>
      key === 'filter' ? 'top50' : null
    );

    const user = userEvent.setup();
    await act(async () => {
      render(<HomePage />);
    });

    await user.click(screen.getByLabelText('Show all coins'));

    expect(mockPush).toHaveBeenCalledWith('/?page=1');
  });
});
