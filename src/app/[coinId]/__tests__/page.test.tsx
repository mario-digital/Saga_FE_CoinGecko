/**
 * Tests for Coin Detail Page
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import CoinDetailPage from '../page';
import { useCoinDetail, CoinNotFoundError } from '@/hooks/useCoinDetail';

// Mock hooks and components
jest.mock('@/hooks/useCoinDetail', () => {
  // Define the mock error class inside the factory function
  class CoinNotFoundError extends Error {
    constructor(coinId: string) {
      super(`Coin with ID "${coinId}" not found`);
      this.name = 'CoinNotFoundError';
    }
  }

  return {
    useCoinDetail: jest.fn(),
    CoinNotFoundError,
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

// Mock dynamic components
jest.mock('@/components/dynamic/PriceHistoryChartDynamic', () => ({
  PriceHistoryChartDynamic: () => <div>Price History Chart</div>,
}));

// Mock CoinDetailSkeleton to make testing easier
jest.mock('@/components/CoinDetailSkeleton', () => ({
  CoinDetailSkeleton: () => (
    <div data-testid="coin-detail-skeleton">Loading...</div>
  ),
}));

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any) => {
    const Component = fn;
    Component.preload = jest.fn();
    return Component;
  },
}));

const mockUseCoinDetail = useCoinDetail as jest.MockedFunction<
  typeof useCoinDetail
>;

// Mock data
const mockCoinData = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  market_cap_rank: 1,
  image: {
    thumb: 'https://example.com/thumb.png',
    small: 'https://example.com/small.png',
    large: 'https://example.com/large.png',
  },
  description: {
    en: 'Bitcoin is a decentralized cryptocurrency.',
  },
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
    subreddit_url: 'https://reddit.com/r/bitcoin',
    repos_url: {
      github: ['https://github.com/bitcoin/bitcoin'],
      bitbucket: [],
    },
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
  asset_platform_id: null,
};

describe('CoinDetailPage', () => {
  const mockParams = Promise.resolve({ coinId: 'bitcoin' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', async () => {
    mockUseCoinDetail.mockReturnValue({
      coin: undefined,
      isLoading: true,
      error: null,
      retry: jest.fn(),
    });

    await act(async () => {
      render(<CoinDetailPage params={mockParams} />);
    });

    // The skeleton should be rendered
    expect(screen.getByTestId('coin-detail-skeleton')).toBeInTheDocument();
  });

  it('renders error state for 404', async () => {
    const error404 = new CoinNotFoundError('invalid-coin');

    mockUseCoinDetail.mockReturnValue({
      coin: undefined,
      isLoading: false,
      error: error404,
      retry: jest.fn(),
    });

    render(<CoinDetailPage params={mockParams} />);

    // Check for 404 error message
    await waitFor(() => {
      expect(screen.getByText('Coin Not Found')).toBeInTheDocument();
      expect(
        screen.getByText(
          /The cryptocurrency you are looking for does not exist/
        )
      ).toBeInTheDocument();
    });
  });

  it('renders error state for network error', () => {
    const networkError = new Error('Network error');
    const retryMock = jest.fn();

    mockUseCoinDetail.mockReturnValue({
      coin: undefined,
      isLoading: false,
      error: networkError,
      retry: retryMock,
    });

    render(<CoinDetailPage params={mockParams} />);

    expect(screen.getByText('Error Loading Coin Data')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load coin data/)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders coin details when loaded', async () => {
    mockUseCoinDetail.mockReturnValue({
      coin: mockCoinData,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage params={mockParams} />);

    // Wait for content to load - use heading to be more specific
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Bitcoin' })
      ).toBeInTheDocument();
    });

    // Header
    expect(screen.getByText('BTC')).toBeInTheDocument(); // Symbol should be uppercase
    // Rank is displayed as "Rank #" and "1" in separate elements
    const rankElements = screen.getAllByText(/Rank #/);
    expect(rankElements[0].closest('div')).toHaveTextContent('Rank #1');

    // Navigation
    expect(screen.getByText('Home')).toBeInTheDocument();
    // On mobile shows "Back", on desktop shows "Back to List"
    const backButton =
      screen.queryByText('Back to List') || screen.queryByText('Back');
    expect(backButton).toBeInTheDocument();

    // Price
    expect(screen.getByText(/\$45,000/)).toBeInTheDocument();
    const priceChangeElements = screen.getAllByText(/\+2\.50%/);
    expect(priceChangeElements.length).toBeGreaterThan(0);

    // Market Stats
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
  });

  it('renders external links correctly', () => {
    mockUseCoinDetail.mockReturnValue({
      coin: mockCoinData,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage params={mockParams} />);

    const websiteLink = screen.getByRole('link', { name: /Website/i });
    expect(websiteLink).toHaveAttribute('href', 'https://bitcoin.org');
    expect(websiteLink).toHaveAttribute('target', '_blank');

    const twitterLink = screen.getByRole('link', { name: /Twitter/i });
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/bitcoin');

    const redditLink = screen.getByRole('link', { name: /Reddit/i });
    expect(redditLink).toHaveAttribute('href', 'https://reddit.com/r/bitcoin');

    const githubLink = screen.getByRole('link', { name: /GitHub/i });
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/bitcoin/bitcoin'
    );
  });

  it('handles null coin data gracefully', () => {
    mockUseCoinDetail.mockReturnValue({
      coin: undefined,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    const { container } = render(<CoinDetailPage params={mockParams} />);

    expect(container.firstChild).toBeNull();
  });
});
