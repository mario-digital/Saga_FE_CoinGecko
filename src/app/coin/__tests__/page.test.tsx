import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import CoinDetailPage from '../page';
import { useCoinDetail } from '@/hooks/useCoinDetail';
import { usePriceHistory } from '@/hooks/usePriceHistory';

// Mock hooks
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  })),
}));

jest.mock('@/hooks/useCoinDetail');
jest.mock('@/hooks/usePriceHistory');

// Mock components
jest.mock('@/components/CoinDetailHeader', () => ({
  CoinDetailHeader: ({ coin }: any) => <div>CoinDetailHeader: {coin.name}</div>,
}));

jest.mock('@/components/CoinStats', () => ({
  CoinStats: ({ coin }: any) => <div>CoinStats</div>,
}));

jest.mock('@/components/dynamic/PriceHistoryChartDynamic', () => ({
  PriceHistoryChartDynamic: () => <div>PriceHistoryChartDynamic</div>,
}));

jest.mock('@/components/PriceChanges', () => ({
  PriceChanges: ({ coin }: any) => <div>PriceChanges</div>,
}));

jest.mock('@/components/CoinDescription', () => ({
  CoinDescription: ({ coin }: any) => <div>CoinDescription</div>,
}));

jest.mock('@/components/CoinDetailError', () => ({
  CoinDetailError: ({ error, retry }: any) => (
    <div>
      Error: {error.message}
      <button onClick={retry}>Retry</button>
    </div>
  ),
}));

const mockCoin = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  market_cap_rank: 1,
  image: {
    thumb: 'https://example.com/thumb.png',
    small: 'https://example.com/small.png',
    large: 'https://example.com/large.png',
  },
  description: { en: 'Bitcoin description' },
  links: {
    homepage: ['https://bitcoin.org'],
    blockchain_site: [],
    official_forum_url: [],
    chat_url: [],
    announcement_url: [],
    twitter_screen_name: 'bitcoin',
    facebook_username: '',
    bitcointalk_thread_identifier: null,
    telegram_channel_identifier: '',
    subreddit_url: '',
    repos_url: { github: [], bitbucket: [] },
  },
  market_data: {
    current_price: { usd: 45000 },
    market_cap: { usd: 900000000000 },
    total_volume: { usd: 25000000000 },
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d: 5.3,
    price_change_percentage_30d: -1.2,
    price_change_percentage_1y: 150.7,
    ath: { usd: 69000 },
    ath_date: { usd: '2021-11-10T14:24:11.849Z' },
    atl: { usd: 67.81 },
    atl_date: { usd: '2013-07-06T00:00:00.000Z' },
    circulating_supply: 19500000,
    total_supply: 21000000,
    max_supply: 21000000,
  },
  categories: ['Cryptocurrency'],
  platforms: {},
};

const mockPriceHistory = [
  { date: '1/1/2024', price: 42000, formattedDate: 'Jan 1' },
  { date: '1/2/2024', price: 43000, formattedDate: 'Jan 2' },
  { date: '1/3/2024', price: 45000, formattedDate: 'Jan 3' },
];

describe('CoinDetailPage', () => {
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('renders loading state', () => {
    mockSearchParams.get.mockReturnValue('bitcoin');
    (useCoinDetail as jest.Mock).mockReturnValue({
      coin: undefined,
      isLoading: true,
      error: null,
      retry: jest.fn(),
    });
    (usePriceHistory as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      retry: jest.fn(),
    });

    const { container } = render(<CoinDetailPage />);

    // Check for skeleton loading elements
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state when coin fetch fails', () => {
    mockSearchParams.get.mockReturnValue('bitcoin');
    const mockRetry = jest.fn();
    (useCoinDetail as jest.Mock).mockReturnValue({
      coin: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
      retry: mockRetry,
    });
    (usePriceHistory as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage />);

    expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders coin details when data is loaded', async () => {
    mockSearchParams.get.mockReturnValue('bitcoin');
    (useCoinDetail as jest.Mock).mockReturnValue({
      coin: mockCoin,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });
    (usePriceHistory as jest.Mock).mockReturnValue({
      data: mockPriceHistory,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('CoinDetailHeader: Bitcoin')).toBeInTheDocument();
      expect(screen.getByText('CoinStats')).toBeInTheDocument();
      expect(screen.getByText('PriceHistoryChartDynamic')).toBeInTheDocument();
      expect(screen.getByText('PriceChanges')).toBeInTheDocument();
      expect(screen.getByText('CoinDescription')).toBeInTheDocument();
    });
  });

  it('fetches correct coin based on search params', () => {
    mockSearchParams.get.mockReturnValue('ethereum');
    (useCoinDetail as jest.Mock).mockReturnValue({
      coin: undefined,
      isLoading: true,
      error: null,
      retry: jest.fn(),
    });
    (usePriceHistory as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage />);

    expect(useCoinDetail).toHaveBeenCalledWith('ethereum');
  });

  it('renders error when no coin ID provided', () => {
    mockSearchParams.get.mockReturnValue(null);
    (useCoinDetail as jest.Mock).mockReturnValue({
      coin: undefined,
      isLoading: false,
      error: new Error('No coin ID provided'),
      retry: jest.fn(),
    });
    (usePriceHistory as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage />);

    // The mock error component shows "Error: <message>"
    expect(screen.getByText(/No coin selected/)).toBeInTheDocument();
  });

  it('renders price history chart component', () => {
    mockSearchParams.get.mockReturnValue('bitcoin');
    (useCoinDetail as jest.Mock).mockReturnValue({
      coin: mockCoin,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });
    (usePriceHistory as jest.Mock).mockReturnValue({
      data: mockPriceHistory,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage />);

    // The price history is handled inside the PriceHistoryChartDynamic component
    expect(screen.getByText('PriceHistoryChartDynamic')).toBeInTheDocument();
  });

  it('handles empty coin ID', () => {
    mockSearchParams.get.mockReturnValue('');
    (useCoinDetail as jest.Mock).mockReturnValue({
      coin: undefined,
      isLoading: false,
      error: new Error('Invalid coin ID'),
      retry: jest.fn(),
    });
    (usePriceHistory as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage />);

    expect(useCoinDetail).toHaveBeenCalledWith('');
  });

  it('continues showing coin data even if price history fails', () => {
    mockSearchParams.get.mockReturnValue('bitcoin');
    (useCoinDetail as jest.Mock).mockReturnValue({
      coin: mockCoin,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });
    (usePriceHistory as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to fetch price history',
      retry: jest.fn(),
    });

    render(<CoinDetailPage />);

    expect(screen.getByText('CoinDetailHeader: Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('CoinStats')).toBeInTheDocument();
    expect(screen.getByText('PriceHistoryChartDynamic')).toBeInTheDocument();
  });
});
