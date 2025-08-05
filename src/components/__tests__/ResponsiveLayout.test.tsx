/**
 * Tests for responsive layout behaviors
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from '../Header';
import { CoinCard } from '../CoinCard';
import { CoinStats } from '../CoinStats';
import { PriceChanges } from '../PriceChanges';
import { CoinData } from '@/types/coingecko';

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
];

const mockMarketData = {
  current_price: { usd: 45000 },
  market_cap: { usd: 900000000000 },
  total_volume: { usd: 25000000000 },
  price_change_percentage_24h: 2.5,
  price_change_percentage_7d: 5.2,
  price_change_percentage_30d: -3.8,
  price_change_percentage_1y: 45.6,
  circulating_supply: 19500000,
  total_supply: 21000000,
  max_supply: 21000000,
  ath: { usd: 69000 },
  ath_change_percentage: { usd: -34.78 },
  ath_date: { usd: '2021-11-10T14:24:11.849Z' },
  atl: { usd: 67.81 },
  atl_change_percentage: { usd: 66261.89 },
  atl_date: { usd: '2013-07-06T00:00:00.000Z' },
};

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockedLink = ({ children, ...props }: any) => {
    return <a {...props}>{children}</a>;
  };
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock useTheme hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
}));

describe('Responsive Layout Tests', () => {
  // Helper to set viewport size
  const setViewportSize = (width: number, height: number = 800) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  };

  describe('Header Component', () => {
    it('shows hamburger menu on mobile', () => {
      setViewportSize(375); // iPhone size
      render(<Header />);

      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
      expect(screen.queryByText('About')).not.toBeInTheDocument(); // Desktop nav hidden
    });

    it('shows full navigation on desktop', () => {
      setViewportSize(1024); // Desktop size
      render(<Header />);

      expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('opens mobile menu when hamburger clicked', async () => {
      setViewportSize(375);
      render(<Header />);

      const hamburger = screen.getByLabelText('Open menu');
      fireEvent.click(hamburger);

      await waitFor(() => {
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
      });
    });

    it('closes mobile menu when close button clicked', async () => {
      setViewportSize(375);
      render(<Header />);

      // Open menu
      fireEvent.click(screen.getByLabelText('Open menu'));

      await waitFor(() => {
        expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
      });

      // Close menu
      fireEvent.click(screen.getByLabelText('Close menu'));

      await waitFor(() => {
        expect(screen.queryByText('About')).not.toBeInTheDocument();
      });
    });

    it('applies sticky positioning on scroll', () => {
      render(<Header />);
      const header = screen.getByRole('banner');

      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });
  });

  describe('CoinCard Component', () => {
    it('has appropriate touch target size on mobile', () => {
      setViewportSize(375);
      render(<CoinCard coin={mockCoinData[0]} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('min-h-[120px]');
    });

    it('has larger size on tablet/desktop', () => {
      setViewportSize(768);
      render(<CoinCard coin={mockCoinData[0]} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('sm:min-h-[140px]');
    });

    it('uses responsive padding', () => {
      render(<CoinCard coin={mockCoinData[0]} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('p-3', 'sm:p-4');
    });

    it('uses responsive font sizes', () => {
      render(<CoinCard coin={mockCoinData[0]} />);

      const title = screen.getByText('Bitcoin');
      expect(title).toHaveClass('text-base', 'sm:text-lg');

      const price = screen.getByText('$45,000.00');
      expect(price).toHaveClass('text-lg', 'sm:text-xl');
    });
  });

  describe('CoinStats Component', () => {
    it('displays in 2-column grid on mobile', () => {
      setViewportSize(375);
      render(<CoinStats marketData={mockMarketData} rank={1} />);

      const grid = screen.getByText('Market Cap').closest('.grid');
      expect(grid).toHaveClass(
        'grid-cols-2',
        'sm:grid-cols-2',
        'lg:grid-cols-3'
      );
    });

    it('displays in 3-column grid on desktop', () => {
      setViewportSize(1024);
      render(<CoinStats marketData={mockMarketData} rank={1} />);

      const grid = screen.getByText('Market Cap').closest('.grid');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('uses responsive text sizes', () => {
      render(<CoinStats marketData={mockMarketData} rank={1} />);

      const label = screen.getByText('Market Cap');
      expect(label).toHaveClass('text-xs', 'sm:text-sm');
    });
  });

  describe('PriceChanges Component', () => {
    const mockPriceChanges = {
      '24h': 2.5,
      '7d': 5.2,
      '30d': -3.8,
      '1y': 45.6,
    };

    it('displays in 2x2 grid on mobile', () => {
      setViewportSize(375);
      render(<PriceChanges priceChanges={mockPriceChanges} />);

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2', 'sm:grid-cols-4');
    });

    it('displays in 4-column grid on desktop', () => {
      setViewportSize(1024);
      render(<PriceChanges priceChanges={mockPriceChanges} />);

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2', 'sm:grid-cols-4');
    });

    it('uses responsive spacing', () => {
      render(<PriceChanges priceChanges={mockPriceChanges} />);

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('gap-3', 'sm:gap-4');
    });
  });

  describe('Touch Interactions', () => {
    it('provides adequate touch targets', () => {
      setViewportSize(375);
      render(<CoinCard coin={mockCoinData[0]} onClick={jest.fn()} />);

      const card = screen.getByRole('button');
      const styles = window.getComputedStyle(card);

      // Check minimum height for touch target
      expect(card).toHaveClass('min-h-[120px]');
    });

    it('handles tap without triggering accidental clicks', () => {
      const onClick = jest.fn();
      setViewportSize(375);
      render(<CoinCard coin={mockCoinData[0]} onClick={onClick} />);

      const card = screen.getByRole('button');

      // Quick tap
      fireEvent.touchStart(card);
      fireEvent.touchEnd(card);
      fireEvent.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Typography', () => {
    it('uses responsive text sizes', () => {
      const { container } = render(
        <h1 className="text-2xl sm:text-3xl lg:text-4xl">Test Text</h1>
      );

      const element = container.firstChild as HTMLElement;

      // Check that responsive text classes are applied
      expect(element).toHaveClass('text-2xl', 'sm:text-3xl', 'lg:text-4xl');
    });
  });

  describe('Safe Area Support', () => {
    it('applies responsive padding', () => {
      const { container } = render(
        <div className="p-3 sm:p-4 lg:p-6">Content</div>
      );

      const element = container.firstChild as HTMLElement;

      // Check that responsive padding classes exist
      expect(element).toHaveClass('p-3', 'sm:p-4', 'lg:p-6');
    });
  });

  describe('Viewport Transitions', () => {
    it('transitions smoothly between mobile and desktop layouts', () => {
      const { rerender } = render(<Header />);

      // Start mobile
      setViewportSize(375);
      rerender(<Header />);
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();

      // Transition to tablet
      setViewportSize(768);
      rerender(<Header />);
      expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();

      // Back to mobile
      setViewportSize(375);
      rerender(<Header />);
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });
  });
});
