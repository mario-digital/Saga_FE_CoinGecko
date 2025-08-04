import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoinCard } from '../CoinCard';
import { CoinData } from '@/types/coingecko';

const mockCoinData: CoinData = {
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
};

const mockCoinDataNegativeChange: CoinData = {
  ...mockCoinData,
  id: 'ethereum',
  name: 'Ethereum',
  symbol: 'eth',
  price_change_percentage_24h: -3.2,
  market_cap_rank: 2,
};

describe('CoinCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders coin information correctly', () => {
    render(<CoinCard coin={mockCoinData} />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('btc')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
    expect(screen.getByText('+2.50%')).toBeInTheDocument();
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('Volume (24h)')).toBeInTheDocument();
  });

  it('displays positive price change in success color', () => {
    render(<CoinCard coin={mockCoinData} />);

    const priceChange = screen.getByText('+2.50%');
    expect(priceChange).toHaveClass('text-success-600');
  });

  it('displays negative price change in danger color', () => {
    render(<CoinCard coin={mockCoinDataNegativeChange} />);

    const priceChange = screen.getByText('-3.20%');
    expect(priceChange).toHaveClass('text-danger-600');
  });

  it('handles click events correctly', async () => {
    const user = userEvent.setup();
    render(<CoinCard coin={mockCoinData} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation (Enter key)', async () => {
    const user = userEvent.setup();
    render(<CoinCard coin={mockCoinData} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation (Space key)', async () => {
    const user = userEvent.setup();
    render(<CoinCard coin={mockCoinData} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when no handler is provided', async () => {
    const user = userEvent.setup();
    render(<CoinCard coin={mockCoinData} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-test-class';
    render(<CoinCard coin={mockCoinData} className={customClass} />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass(customClass);
  });

  it('displays coin image with correct alt text', () => {
    render(<CoinCard coin={mockCoinData} />);

    const image = screen.getByAltText('Bitcoin logo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
  });

  it('handles image error gracefully', () => {
    render(<CoinCard coin={mockCoinData} />);

    const image = screen.getByAltText('Bitcoin logo');
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', '/images/placeholder-coin.svg');
  });

  it('does not display rank when market_cap_rank is undefined', () => {
    const coinWithoutRank = { ...mockCoinData };
    delete (coinWithoutRank as any).market_cap_rank;
    render(<CoinCard coin={coinWithoutRank} />);

    expect(screen.queryByText('#1')).not.toBeInTheDocument();
  });

  it('is accessible with proper ARIA attributes', () => {
    render(<CoinCard coin={mockCoinData} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('formats large numbers correctly', () => {
    const coinWithLargeNumbers: CoinData = {
      ...mockCoinData,
      current_price: 1234567.89,
      market_cap: 1234567890123,
      total_volume: 987654321098,
    };

    render(<CoinCard coin={coinWithLargeNumbers} />);

    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
  });

  it('renders with zero price change', () => {
    const coinWithZeroChange = {
      ...mockCoinData,
      price_change_percentage_24h: 0,
    };

    render(<CoinCard coin={coinWithZeroChange} />);

    const priceChange = screen.getByText('+0.00%');
    expect(priceChange).toHaveClass('text-gray-600');
  });
});
