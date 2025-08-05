/**
 * Tests for Coin Detail Page
 */

import { render, screen } from '@testing-library/react';
import CoinDetailPage from '../page';
import { useCoinDetail } from '@/hooks/useCoinDetail';

// Mock hooks and components
jest.mock('@/hooks/useCoinDetail');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
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

    render(<CoinDetailPage params={mockParams} />);

    // Should show skeleton container
    expect(
      screen.getByText('', { selector: '.container' })
    ).toBeInTheDocument();
    // Should have multiple skeleton elements
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state for 404', () => {
    const error404 = new Error('Coin with ID "invalid-coin" not found');
    error404.name = 'CoinNotFoundError';

    mockUseCoinDetail.mockReturnValue({
      coin: undefined,
      isLoading: false,
      error: error404,
      retry: jest.fn(),
    });

    render(<CoinDetailPage params={mockParams} />);

    // Check for error message - CoinDetailError component might render differently
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
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

  it('renders coin details when loaded', () => {
    mockUseCoinDetail.mockReturnValue({
      coin: mockCoinData,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<CoinDetailPage params={mockParams} />);

    // Header
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('btc')).toBeInTheDocument(); // Symbol is lowercase
    expect(screen.getByText('#1')).toBeInTheDocument();

    // Navigation
    expect(screen.getByText('Home')).toBeInTheDocument();
    // On mobile shows "Back", on desktop shows "Back to List"
    const backButton =
      screen.queryByText('Back to List') || screen.queryByText('Back');
    expect(backButton).toBeInTheDocument();

    // Price
    expect(screen.getByText(/\$45,000/)).toBeInTheDocument();
    expect(screen.getByText(/\+2\.50%/)).toBeInTheDocument();

    // Market Stats
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('24h Trading Volume')).toBeInTheDocument();
    expect(screen.getByText('Circulating Supply')).toBeInTheDocument();
    expect(screen.getByText('All-Time High')).toBeInTheDocument();
    expect(screen.getByText('All-Time Low')).toBeInTheDocument();

    // Price Changes
    expect(screen.getByText('Price Performance')).toBeInTheDocument();
    expect(screen.getByText('24 Hours')).toBeInTheDocument();
    expect(screen.getByText('7 Days')).toBeInTheDocument();
    expect(screen.getByText('30 Days')).toBeInTheDocument();
    expect(screen.getByText('1 Year')).toBeInTheDocument();

    // Description
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(
      screen.getByText(/Bitcoin is a decentralized cryptocurrency/)
    ).toBeInTheDocument();
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
