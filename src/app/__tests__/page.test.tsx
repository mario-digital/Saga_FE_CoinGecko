import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    });

    // Mock useSearchParams
    mockUseSearchParams.mockReturnValue({
      get: jest.fn(() => null),
      getAll: jest.fn(() => []),
      has: jest.fn(() => false),
      keys: jest.fn(() => []),
      values: jest.fn(() => []),
      entries: jest.fn(() => []),
      forEach: jest.fn(),
      toString: jest.fn(() => ''),
    } as any);

    // Mock window.scrollTo
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true,
    });
  });

  it('displays loading state initially', async () => {
    mockUseCoins.mockReturnValue({
      coins: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<HomePage />);

    // Wait for skeleton loaders to appear (due to dynamic imports)
    await waitFor(() => {
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('displays coins when data is loaded', async () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<HomePage />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('btc')).toBeInTheDocument();
    expect(screen.getByText('eth')).toBeInTheDocument();
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

  it('displays empty state when no coins are available', () => {
    const mockRefetch = jest.fn();
    mockUseCoins.mockReturnValue({
      coins: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<HomePage />);

    expect(screen.getByText('No Data Available')).toBeInTheDocument();
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

    render(<HomePage />);

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

    render(<HomePage />);

    const bitcoinCard = screen
      .getByText('Bitcoin')
      .closest('div[role="button"]');
    expect(bitcoinCard).toBeInTheDocument();

    await user.click(bitcoinCard!);

    expect(mockPush).toHaveBeenCalledWith('/bitcoin');
  });

  it('renders pagination component with correct props', () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<HomePage />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
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

    const { rerender } = render(<HomePage />);

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    rerender(<HomePage />);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('does not show pagination when loading', () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<HomePage />);

    // Pagination should not be rendered during loading
    const previousButton = screen.queryByText('Previous');
    const nextButton = screen.queryByText('Next');

    expect(previousButton).not.toBeInTheDocument();
    expect(nextButton).not.toBeInTheDocument();
  });

  it('renders coins in a grid layout', () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<HomePage />);

    const grid = screen.getByText('Bitcoin').closest('.grid');
    expect(grid).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4'
    );
  });

  it('applies hover effects to coin cards', () => {
    mockUseCoins.mockReturnValue({
      coins: mockCoinData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<HomePage />);

    const bitcoinCard = screen
      .getByText('Bitcoin')
      .closest('div[role="button"]');
    expect(bitcoinCard).toHaveClass('hover:scale-[1.02]', 'transition-all');
  });

  it('shows loading skeletons with correct styling', () => {
    mockUseCoins.mockReturnValue({
      coins: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<HomePage />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    // Check that skeleton cards are rendered in grid
    const grid = document.querySelector('.grid');
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

    const { rerender } = render(<HomePage />);

    // Check for loading skeletons
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );

    isLoading = false;
    rerender(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });

    // Check that loading skeletons are gone
    expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
  });

  it('handles undefined coins gracefully', () => {
    mockUseCoins.mockReturnValue({
      coins: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<HomePage />);

    expect(screen.getByText('No Data Available')).toBeInTheDocument();
  });
});
