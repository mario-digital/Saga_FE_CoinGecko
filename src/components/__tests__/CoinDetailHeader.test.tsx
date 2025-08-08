import React from 'react';
import { render, screen } from '@testing-library/react';
import { CoinDetailHeader } from '../CoinDetailHeader';
import { CoinDetailData } from '@/types/coingecko';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up">TrendingUp</div>,
  TrendingDown: () => <div data-testid="trending-down">TrendingDown</div>,
}));

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span className={`badge-${variant}`}>{children}</span>
  ),
}));

// Mock utility functions
jest.mock('@/lib/utils', () => ({
  formatCurrency: (value: number) => {
    if (value < 0.01) {
      return `$${value.toFixed(6)}`;
    }
    return `$${value.toLocaleString()}`;
  },
  formatPercentage: (value: number) => `${value.toFixed(2)}%`,
  getPercentageChangeColor: (value: number) =>
    value >= 0 ? 'text-green-600' : 'text-red-600',
}));

const mockCoin: CoinDetailData = {
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
    en: 'Bitcoin is a decentralized cryptocurrency',
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

describe('CoinDetailHeader', () => {
  it('renders coin name and symbol', () => {
    render(<CoinDetailHeader coin={mockCoin} />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
  });

  it('renders coin logo with correct attributes', () => {
    render(<CoinDetailHeader coin={mockCoin} />);

    const image = screen.getByAltText('Bitcoin logo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/large.png');
    expect(image).toHaveAttribute('width', '64');
    expect(image).toHaveAttribute('height', '64');
    expect(image).toHaveClass('rounded-full');
  });

  it('renders market cap rank', () => {
    render(<CoinDetailHeader coin={mockCoin} />);

    expect(screen.getByText('Rank #1')).toBeInTheDocument();
    const rankBadge = screen.getByText('Rank #1');
    expect(rankBadge).toHaveClass('badge-secondary');
  });

  it('renders current price', () => {
    render(<CoinDetailHeader coin={mockCoin} />);

    expect(screen.getByText('$45,000')).toBeInTheDocument();
  });

  it('renders positive price change with up trend icon', () => {
    render(<CoinDetailHeader coin={mockCoin} />);

    expect(screen.getByText('2.50%')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up')).toBeInTheDocument();
    expect(screen.queryByTestId('trending-down')).not.toBeInTheDocument();
  });

  it('renders negative price change with down trend icon', () => {
    const coinWithNegativeChange = {
      ...mockCoin,
      market_data: {
        ...mockCoin.market_data,
        price_change_percentage_24h: -3.5,
      },
    };

    render(<CoinDetailHeader coin={coinWithNegativeChange} />);

    expect(screen.getByText('-3.50%')).toBeInTheDocument();
    expect(screen.getByTestId('trending-down')).toBeInTheDocument();
    expect(screen.queryByTestId('trending-up')).not.toBeInTheDocument();
  });

  it('renders zero price change with up trend icon', () => {
    const coinWithZeroChange = {
      ...mockCoin,
      market_data: {
        ...mockCoin.market_data,
        price_change_percentage_24h: 0,
      },
    };

    render(<CoinDetailHeader coin={coinWithZeroChange} />);

    expect(screen.getByText('0.00%')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up')).toBeInTheDocument();
  });

  it('renders symbol in uppercase', () => {
    const coinWithLowerSymbol = {
      ...mockCoin,
      symbol: 'btc',
    };

    render(<CoinDetailHeader coin={coinWithLowerSymbol} />);

    expect(screen.getByText('BTC')).toBeInTheDocument();
  });

  it('handles high market cap ranks', () => {
    const highRankCoin = { ...mockCoin, market_cap_rank: 9999 };
    render(<CoinDetailHeader coin={highRankCoin} />);

    expect(screen.getByText('Rank #9999')).toBeInTheDocument();
  });

  it('renders with proper layout structure', () => {
    const { container } = render(<CoinDetailHeader coin={mockCoin} />);

    const header = container.firstChild;
    expect(header).toHaveClass(
      'flex',
      'flex-col',
      'sm:flex-row',
      'items-start',
      'sm:items-center',
      'gap-4',
      'mb-8'
    );
  });

  it('applies correct text colors for price change', () => {
    const { rerender } = render(<CoinDetailHeader coin={mockCoin} />);

    // Positive change - should be green
    let priceChange = screen.getByText('2.50%').parentElement;
    expect(priceChange).toHaveClass('text-green-600');

    // Negative change - should be red
    const negCoin = {
      ...mockCoin,
      market_data: {
        ...mockCoin.market_data,
        price_change_percentage_24h: -5,
      },
    };
    rerender(<CoinDetailHeader coin={negCoin} />);
    priceChange = screen.getByText('-5.00%').parentElement;
    expect(priceChange).toHaveClass('text-red-600');
  });

  it('renders coin name with proper styling', () => {
    render(<CoinDetailHeader coin={mockCoin} />);

    const coinName = screen.getByText('Bitcoin');
    expect(coinName).toHaveClass(
      'text-3xl',
      'font-bold',
      'text-gray-900',
      'dark:text-white'
    );
  });

  it('renders symbol with proper styling', () => {
    render(<CoinDetailHeader coin={mockCoin} />);

    const symbol = screen.getByText('BTC');
    expect(symbol).toHaveClass(
      'text-xl',
      'text-gray-500',
      'dark:text-gray-400'
    );
  });

  it('renders price with proper styling', () => {
    render(<CoinDetailHeader coin={mockCoin} />);

    const price = screen.getByText('$45,000');
    expect(price).toHaveClass(
      'text-2xl',
      'font-semibold',
      'text-gray-900',
      'dark:text-white'
    );
  });

  it('handles very large prices', () => {
    const largePriceCoin = {
      ...mockCoin,
      market_data: {
        ...mockCoin.market_data,
        current_price: { usd: 1234567890 },
      },
    };

    render(<CoinDetailHeader coin={largePriceCoin} />);

    expect(screen.getByText('$1,234,567,890')).toBeInTheDocument();
  });

  it('handles very small prices', () => {
    const smallPriceCoin = {
      ...mockCoin,
      market_data: {
        ...mockCoin.market_data,
        current_price: { usd: 0.000001 },
      },
    };

    render(<CoinDetailHeader coin={smallPriceCoin} />);

    expect(screen.getByText('$0.000001')).toBeInTheDocument();
  });

  it('handles null market cap rank', () => {
    const noRankCoin = { ...mockCoin, market_cap_rank: null };
    render(<CoinDetailHeader coin={noRankCoin} />);

    // When rank is null, it should show "Rank #null" or "Rank #"
    // Check that the Rank text exists, without specific number
    const rankElement = screen.getByText(/Rank #/);
    expect(rankElement).toBeInTheDocument();
  });

  it('handles extreme percentage changes', () => {
    const extremeChangeCoin = {
      ...mockCoin,
      market_data: {
        ...mockCoin.market_data,
        price_change_percentage_24h: 999.99,
      },
    };

    render(<CoinDetailHeader coin={extremeChangeCoin} />);

    expect(screen.getByText('999.99%')).toBeInTheDocument();
  });
});
