/**
 * Tests for SwipeableCoinCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwipeableCoinCard } from '../SwipeableCoinCard';
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
    circulating_supply: 19500000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -34.78,
    last_updated: '2024-01-01T12:00:00.000Z',
  },
];

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('SwipeableCoinCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders coin information correctly', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
    expect(screen.getByText('2.50%')).toBeInTheDocument();
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('Volume (24h)')).toBeInTheDocument();
  });

  it('shows swipe indicator on mobile', () => {
    // Mock window width for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    expect(screen.getByText('Swipe')).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
  });

  it('handles keyboard navigation', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');

    mockOnClick.mockClear();

    // Test Space key
    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
  });

  it('handles touch events for swipe gestures', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByRole('button').parentElement!.parentElement!;

    // Simulate swipe left
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });

    fireEvent.touchMove(card, {
      touches: [{ clientX: 20, clientY: 100 }],
    });

    fireEvent.touchEnd(card);

    // Should show additional details after swipe
    expect(screen.getByText('Additional Details')).toBeInTheDocument();
  });

  it('shows additional coin details in swipe view', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByRole('button').parentElement!.parentElement!;

    // Simulate swipe left to reveal details
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });

    fireEvent.touchMove(card, {
      touches: [{ clientX: 20, clientY: 100 }],
    });

    fireEvent.touchEnd(card);

    // Check for additional details
    expect(screen.getByText('Additional Details')).toBeInTheDocument();
    expect(screen.getByText('Circulating')).toBeInTheDocument();
    expect(screen.getByText('Max Supply')).toBeInTheDocument();
    expect(screen.getByText('ATH')).toBeInTheDocument();
    expect(screen.getByText('From ATH')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const coinWithLargeNumbers = {
      ...mockCoinData[0],
      circulating_supply: 19500000,
      max_supply: 21000000,
      ath: 69000,
      ath_change_percentage: -34.78,
    };

    render(
      <SwipeableCoinCard coin={coinWithLargeNumbers} onClick={mockOnClick} />
    );

    const card = screen.getByRole('button').parentElement!.parentElement!;

    // Swipe to reveal details
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchMove(card, {
      touches: [{ clientX: 20, clientY: 100 }],
    });
    fireEvent.touchEnd(card);

    expect(screen.getByText('19.50M')).toBeInTheDocument();
    expect(screen.getByText('21.00M')).toBeInTheDocument();
    expect(screen.getByText('$69,000.00')).toBeInTheDocument();
    expect(screen.getByText('-34.78%')).toBeInTheDocument();
  });

  it('handles missing data gracefully', () => {
    const coinWithMissingData = {
      ...mockCoinData[0],
      circulating_supply: undefined,
      max_supply: undefined,
      ath: undefined,
      ath_change_percentage: undefined,
    };

    render(
      <SwipeableCoinCard coin={coinWithMissingData} onClick={mockOnClick} />
    );

    const card = screen.getByRole('button').parentElement!.parentElement!;

    // Swipe to reveal details
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchMove(card, {
      touches: [{ clientX: 20, clientY: 100 }],
    });
    fireEvent.touchEnd(card);

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.queryByText('Max Supply')).not.toBeInTheDocument();
    expect(screen.queryByText('ATH')).not.toBeInTheDocument();
  });

  it('applies correct styling for price changes', () => {
    // Positive change
    const { rerender } = render(
      <SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />
    );

    let changeElement = screen.getByText('2.50%').parentElement;
    expect(changeElement).toHaveClass('text-success');

    // Negative change
    const negativeChangeCoin = {
      ...mockCoinData[0],
      price_change_percentage_24h: -5.25,
    };

    rerender(
      <SwipeableCoinCard coin={negativeChangeCoin} onClick={mockOnClick} />
    );

    changeElement = screen.getByText('5.25%').parentElement;
    expect(changeElement).toHaveClass('text-danger');
  });

  it('does not trigger click when swiping', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByRole('button');

    // Start swipe
    fireEvent.touchStart(card.parentElement!.parentElement!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });

    // Move (swipe)
    fireEvent.touchMove(card.parentElement!.parentElement!, {
      touches: [{ clientX: 50, clientY: 100 }],
    });

    // Click during swipe should not trigger onClick
    fireEvent.click(card);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
