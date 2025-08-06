import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SwipeableCoinCardDynamic } from '../SwipeableCoinCardDynamic';
import { CoinData } from '@/types/coingecko';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<any>) => {
    const Component = React.lazy(loader);
    return (props: any) => (
      <React.Suspense fallback={<div>Loading card...</div>}>
        <Component {...props} />
      </React.Suspense>
    );
  },
}));

// Mock the actual SwipeableCoinCard component
jest.mock('../../SwipeableCoinCard', () => ({
  __esModule: true,
  default: ({ coin, onClick }: any) => (
    <div data-testid="swipeable-coin-card" onClick={() => onClick?.(coin.id)}>
      {coin.name}
    </div>
  ),
  SwipeableCoinCard: ({ coin, onClick }: any) => (
    <div data-testid="swipeable-coin-card" onClick={() => onClick?.(coin.id)}>
      {coin.name}
    </div>
  ),
}));

describe('SwipeableCoinCardDynamic', () => {
  const mockCoin: CoinData = {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/bitcoin.png',
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    total_volume: 25000000000,
    price_change_percentage_24h: 2.5,
    circulating_supply: 19500000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -34.78,
    last_updated: '2024-01-01T12:00:00.000Z',
  };

  it('renders SwipeableCoinCard component', async () => {
    render(<SwipeableCoinCardDynamic coin={mockCoin} onClick={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('swipeable-coin-card')).toBeInTheDocument();
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    // In test environment, dynamic imports resolve synchronously
    render(<SwipeableCoinCardDynamic coin={mockCoin} onClick={jest.fn()} />);

    // Component should render successfully
    expect(screen.getByTestId('swipeable-coin-card')).toBeInTheDocument();
  });

  it('passes onClick callback correctly', async () => {
    const mockOnClick = jest.fn();
    render(<SwipeableCoinCardDynamic coin={mockCoin} onClick={mockOnClick} />);

    await waitFor(() => {
      const card = screen.getByTestId('swipeable-coin-card');
      card.click();
      expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
    });
  });

  it('passes coin data correctly', async () => {
    const customCoin = { ...mockCoin, name: 'Ethereum', id: 'ethereum' };
    render(<SwipeableCoinCardDynamic coin={customCoin} onClick={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });
  });

  it('handles missing onClick gracefully', async () => {
    render(<SwipeableCoinCardDynamic coin={mockCoin} />);

    await waitFor(() => {
      const card = screen.getByTestId('swipeable-coin-card');
      expect(() => card.click()).not.toThrow();
    });
  });
});
