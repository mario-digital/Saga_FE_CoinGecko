/**
 * Tests for CoinStats component
 */

import { render, screen } from '@testing-library/react';
import { CoinStats } from '../CoinStats';

describe('CoinStats', () => {
  const mockMarketData = {
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
  };

  it('renders all stat cards', () => {
    render(<CoinStats marketData={mockMarketData} rank={1} />);

    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('24h Trading Volume')).toBeInTheDocument();
    expect(screen.getByText('Circulating Supply')).toBeInTheDocument();
    expect(screen.getByText('All-Time High')).toBeInTheDocument();
    expect(screen.getByText('All-Time Low')).toBeInTheDocument();
    expect(screen.getByText('Max Supply')).toBeInTheDocument();
  });

  it('displays market cap with rank', () => {
    render(<CoinStats marketData={mockMarketData} rank={1} />);

    expect(screen.getByText('$900,000,000,000.00')).toBeInTheDocument();
    expect(screen.getByText('Rank #1')).toBeInTheDocument();
  });

  it('calculates volume to market cap ratio', () => {
    render(<CoinStats marketData={mockMarketData} rank={1} />);

    expect(screen.getByText('$25,000,000,000.00')).toBeInTheDocument();
    expect(screen.getByText('2.78% of market cap')).toBeInTheDocument();
  });

  it('displays circulating supply with percentage', () => {
    render(<CoinStats marketData={mockMarketData} rank={1} />);

    expect(screen.getByText('19.50M')).toBeInTheDocument();
    expect(screen.getByText('92.9% of max supply')).toBeInTheDocument();
  });

  it('handles no max supply', () => {
    const noMaxSupplyData = {
      ...mockMarketData,
      max_supply: null,
    };

    render(<CoinStats marketData={noMaxSupplyData} rank={1} />);

    expect(screen.getByText('No Limit')).toBeInTheDocument();
    expect(screen.getByText('Unlimited supply')).toBeInTheDocument();
  });

  it('displays all-time high with date and change', () => {
    render(<CoinStats marketData={mockMarketData} rank={1} />);

    expect(screen.getByText('$69,000.00')).toBeInTheDocument();
    expect(screen.getByText(/Nov 10, 2021/)).toBeInTheDocument();
    expect(screen.getByText(/-34\.78%/)).toBeInTheDocument();
  });

  it('displays all-time low with date and change', () => {
    render(<CoinStats marketData={mockMarketData} rank={1} />);

    expect(screen.getByText('$67.81')).toBeInTheDocument();
    expect(screen.getByText(/Jul 6, 2013/)).toBeInTheDocument();
    expect(screen.getByText(/\+66279\.06%/)).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const largeNumberData = {
      ...mockMarketData,
      market_cap: { usd: 1234567890123 },
      total_volume: { usd: 98765432109 },
      circulating_supply: 123456789,
    };

    render(<CoinStats marketData={largeNumberData} rank={1} />);

    expect(screen.getByText('$1,234,567,890,123.00')).toBeInTheDocument();
    expect(screen.getByText('$98,765,432,109.00')).toBeInTheDocument();
    expect(screen.getByText('123.46M')).toBeInTheDocument();
  });

  it('handles edge case with total supply but no max supply', () => {
    const edgeCaseData = {
      ...mockMarketData,
      max_supply: null,
      total_supply: 25000000,
    };

    render(<CoinStats marketData={edgeCaseData} rank={1} />);

    expect(screen.getByText('78.0% of total supply')).toBeInTheDocument();
  });
});
