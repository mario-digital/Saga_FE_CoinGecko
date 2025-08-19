import { renderHook, act, waitFor } from '@testing-library/react';
import { useFilteredCoins } from '@/hooks/useFilteredCoins';
import { CoinData } from '@/types/coingecko';

// Mock coin data with various market cap ranks
const mockCoins: CoinData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/bitcoin.png',
    current_price: 45000,
    market_cap: 900000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.5,
    total_volume: 25000000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://example.com/ethereum.png',
    current_price: 3000,
    market_cap: 350000000000,
    market_cap_rank: 2,
    price_change_percentage_24h: 1.8,
    total_volume: 15000000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    image: 'https://example.com/cardano.png',
    current_price: 0.5,
    market_cap: 16000000000,
    market_cap_rank: 8,
    price_change_percentage_24h: -1.2,
    total_volume: 800000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'polygon',
    symbol: 'matic',
    name: 'Polygon',
    image: 'https://example.com/polygon.png',
    current_price: 0.8,
    market_cap: 7000000000,
    market_cap_rank: 15,
    price_change_percentage_24h: 3.1,
    total_volume: 400000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'uniswap',
    symbol: 'uni',
    name: 'Uniswap',
    image: 'https://example.com/uniswap.png',
    current_price: 6,
    market_cap: 4500000000,
    market_cap_rank: 25,
    price_change_percentage_24h: -0.5,
    total_volume: 200000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'chainlink',
    symbol: 'link',
    name: 'Chainlink',
    image: 'https://example.com/chainlink.png',
    current_price: 15,
    market_cap: 8500000000,
    market_cap_rank: 75,
    price_change_percentage_24h: 1.2,
    total_volume: 500000000,
    last_updated: '2024-01-01',
  },
  {
    id: 'apecoin',
    symbol: 'ape',
    name: 'ApeCoin',
    image: 'https://example.com/apecoin.png',
    current_price: 1.5,
    market_cap: 550000000,
    market_cap_rank: 120,
    price_change_percentage_24h: -2.3,
    total_volume: 50000000,
    last_updated: '2024-01-01',
  },
];

// Mock coin with missing market_cap_rank
const coinWithoutRank: CoinData = {
  id: 'unknown',
  symbol: 'unk',
  name: 'Unknown',
  image: 'https://example.com/unknown.png',
  current_price: 0.001,
  market_cap: 1000000,
  market_cap_rank: null as any, // Missing rank
  price_change_percentage_24h: 0,
  total_volume: 100000,
  last_updated: '2024-01-01',
};

describe('useFilteredCoins', () => {
  it('returns all coins when filter is "all"', () => {
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: mockCoins, filter: 'all' })
    );

    expect(result.current.filteredCoins).toEqual(mockCoins);
    expect(result.current.filterCount).toBe(7);
    expect(result.current.totalCount).toBe(7);
    expect(result.current.activeFilter).toBe('all');
  });

  it('returns top 10 coins when filter is "top10"', () => {
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: mockCoins, filter: 'top10' })
    );

    expect(result.current.filteredCoins).toHaveLength(3);
    expect(result.current.filteredCoins.map(c => c.id)).toEqual([
      'bitcoin',
      'ethereum',
      'cardano',
    ]);
    expect(result.current.filterCount).toBe(3);
    expect(result.current.activeFilter).toBe('top10');
  });

  it('returns top 50 coins when filter is "top50"', () => {
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: mockCoins, filter: 'top50' })
    );

    expect(result.current.filteredCoins).toHaveLength(5);
    expect(result.current.filteredCoins.map(c => c.market_cap_rank)).toEqual([
      1, 2, 8, 15, 25,
    ]);
    expect(result.current.filterCount).toBe(5);
  });

  it('returns top 100 coins when filter is "top100"', () => {
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: mockCoins, filter: 'top100' })
    );

    expect(result.current.filteredCoins).toHaveLength(6);
    expect(
      result.current.filteredCoins.every(
        c => c.market_cap_rank !== null && c.market_cap_rank <= 100
      )
    ).toBe(true);
    expect(result.current.filterCount).toBe(6);
  });

  it('handles undefined coins array', () => {
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: undefined, filter: 'top10' })
    );

    expect(result.current.filteredCoins).toEqual([]);
    expect(result.current.filterCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('handles empty coins array', () => {
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: [], filter: 'top10' })
    );

    expect(result.current.filteredCoins).toEqual([]);
    expect(result.current.filterCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('filters out coins with missing market_cap_rank', () => {
    const coinsWithMissingRank = [...mockCoins, coinWithoutRank];
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: coinsWithMissingRank, filter: 'top10' })
    );

    expect(result.current.filteredCoins).toHaveLength(3);
    expect(
      result.current.filteredCoins.find(c => c.id === 'unknown')
    ).toBeUndefined();
  });

  it('handles invalid filter value by returning all coins', () => {
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: mockCoins, filter: 'invalid' })
    );

    expect(result.current.filteredCoins).toEqual(mockCoins);
    expect(result.current.filterCount).toBe(7);
    expect(result.current.activeFilter).toBe('invalid');
  });

  it('updates filtered results when filter changes', () => {
    const { result, rerender } = renderHook(
      ({ filter }) => useFilteredCoins({ coins: mockCoins, filter }),
      { initialProps: { filter: 'all' } }
    );

    expect(result.current.filteredCoins).toHaveLength(7);

    rerender({ filter: 'top10' });
    expect(result.current.filteredCoins).toHaveLength(3);

    rerender({ filter: 'top50' });
    expect(result.current.filteredCoins).toHaveLength(5);
  });

  it('memoizes filtered results', () => {
    const { result, rerender } = renderHook(() =>
      useFilteredCoins({ coins: mockCoins, filter: 'top10' })
    );

    const firstResult = result.current.filteredCoins;

    // Re-render with same props
    rerender();

    expect(result.current.filteredCoins).toBe(firstResult); // Same reference
  });

  it('always returns error as null', () => {
    const { result } = renderHook(() =>
      useFilteredCoins({ coins: mockCoins, filter: 'all' })
    );

    expect(result.current.error).toBeNull();
  });

  it('correctly calculates filter boundaries', () => {
    const rankedCoins: CoinData[] = Array.from({ length: 150 }, (_, i) => ({
      ...mockCoins[0],
      id: `coin-${i + 1}`,
      market_cap_rank: i + 1,
    }));

    const { result: resultTop10 } = renderHook(() =>
      useFilteredCoins({ coins: rankedCoins, filter: 'top10' })
    );
    expect(resultTop10.current.filterCount).toBe(10);

    const { result: resultTop50 } = renderHook(() =>
      useFilteredCoins({ coins: rankedCoins, filter: 'top50' })
    );
    expect(resultTop50.current.filterCount).toBe(50);

    const { result: resultTop100 } = renderHook(() =>
      useFilteredCoins({ coins: rankedCoins, filter: 'top100' })
    );
    expect(resultTop100.current.filterCount).toBe(100);
  });
});
