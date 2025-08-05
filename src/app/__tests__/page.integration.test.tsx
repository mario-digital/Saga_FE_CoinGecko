import { render, screen, waitFor } from '@testing-library/react';
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

  it('renders FilterMarketCap component', () => {
    render(<HomePage />);

    expect(
      screen.getByLabelText('Filter coins by market cap')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Show all coins')).toBeInTheDocument();
    expect(screen.getByLabelText('Show top 10 coins')).toBeInTheDocument();
    expect(screen.getByLabelText('Show top 50 coins')).toBeInTheDocument();
    expect(screen.getByLabelText('Show top 100 coins')).toBeInTheDocument();
  });

  it('displays all coins by default', () => {
    render(<HomePage />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Cardano')).toBeInTheDocument();
    expect(screen.getByText('Polygon')).toBeInTheDocument();
  });

  it('filters coins when Top 10 is selected', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByLabelText('Show top 10 coins'));

    // Should show only coins with rank <= 10
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.queryByText('Cardano')).not.toBeInTheDocument();
    expect(screen.queryByText('Polygon')).not.toBeInTheDocument();
  });

  it('shows filter count indicator when filter is active', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByLabelText('Show top 10 coins'));

    expect(screen.getByText(/Showing 2 of 4 coins/)).toBeInTheDocument();
  });

  it('updates URL when filter changes', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByLabelText('Show top 50 coins'));

    expect(mockPush).toHaveBeenCalledWith('/?filter=top50&page=1');
  });

  it('resets to page 1 when filter changes', async () => {
    // Start on page 2
    mockSearchParams.set('page', '2');
    mockGetSearchParam.mockImplementation(key => (key === 'page' ? '2' : null));

    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByLabelText('Show top 10 coins'));

    // URLSearchParams maintains insertion order, page was already in params
    expect(mockPush).toHaveBeenCalledWith('/?page=1&filter=top10');
  });

  it('initializes filter from URL parameter', () => {
    mockSearchParams.set('filter', 'top50');
    mockGetSearchParam.mockImplementation(key =>
      key === 'filter' ? 'top50' : null
    );

    render(<HomePage />);

    expect(screen.getByLabelText('Show top 50 coins')).toHaveAttribute(
      'data-state',
      'on'
    );
  });

  it('shows empty state when no coins match filter', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // Filter to top 10, but our data has no coins in top 10
    (useCoins as jest.Mock).mockReturnValue({
      coins: mockCoins.filter(c => c.market_cap_rank > 100),
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
    render(<HomePage />);

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
    render(<HomePage />);

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
    const { container } = render(<HomePage />);

    // Click page 2
    const page2Button = container.querySelector(
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
    render(<HomePage />);

    await user.click(screen.getByLabelText('Show all coins'));

    expect(mockPush).toHaveBeenCalledWith('/?page=1');
  });
});
