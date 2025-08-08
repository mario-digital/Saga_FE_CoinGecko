import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useCoins } from '../useCoins';
import { CoinData } from '@/types/coingecko';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

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
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3000,
    market_cap: 360000000000,
    market_cap_rank: 2,
    total_volume: 15000000000,
    price_change_percentage_24h: -1.2,
    last_updated: '2024-01-01T12:00:00.000Z',
  },
];

const mockApi = api as jest.MockedObject<typeof api>;

const createWrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      dedupingInterval: 0,
      provider: () => new Map(),
    }}
  >
    {children}
  </SWRConfig>
);

describe('useCoins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockApi.getCoins.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCoins(), {
      wrapper: createWrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.coins).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('returns coins data on successful fetch', async () => {
    mockApi.getCoins.mockResolvedValue(mockCoinData);

    const { result } = renderHook(() => useCoins(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.coins).toEqual(mockCoinData);
    expect(result.current.error).toBeNull();
  });

  it('returns error state on fetch failure', async () => {
    const errorMessage = 'Failed to fetch';
    mockApi.getCoins.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCoins(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.coins).toBeUndefined();
    expect(result.current.error).toBe(
      'Unable to connect to CoinGecko API. Please check your network connection and try again.'
    );
  });

  it('uses default parameters correctly', () => {
    mockApi.getCoins.mockImplementation(() => new Promise(() => {}));

    renderHook(() => useCoins(), {
      wrapper: createWrapper,
    });

    expect(mockApi.getCoins).toHaveBeenCalledWith(1, 50);
  });

  it('uses custom page and perPage parameters', () => {
    mockApi.getCoins.mockImplementation(() => new Promise(() => {}));

    renderHook(() => useCoins(2, 25), {
      wrapper: createWrapper,
    });

    expect(mockApi.getCoins).toHaveBeenCalledWith(2, 25);
  });

  it('calls the api.getCoins function', () => {
    mockApi.getCoins.mockImplementation(() => new Promise(() => {}));

    renderHook(() => useCoins(2, 100), {
      wrapper: createWrapper,
    });

    expect(mockApi.getCoins).toHaveBeenCalledWith(2, 100);
  });

  it('provides refetch function', async () => {
    mockApi.getCoins.mockResolvedValue(mockCoinData);

    const { result } = renderHook(() => useCoins(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');

    mockApi.getCoins.mockClear();
    mockApi.getCoins.mockResolvedValue([]);

    result.current.refetch();

    await waitFor(() => {
      expect(mockApi.getCoins).toHaveBeenCalled();
    });
  });

  it('handles error objects without message property', async () => {
    const errorWithoutMessage = { status: 404 };
    mockApi.getCoins.mockRejectedValue(errorWithoutMessage);

    const { result } = renderHook(() => useCoins(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });

  it('handles string errors', async () => {
    const stringError = 'Network error';
    mockApi.getCoins.mockRejectedValue(stringError);

    const { result } = renderHook(() => useCoins(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });

  it('maintains referential stability of return object properties', () => {
    mockApi.getCoins.mockImplementation(() => new Promise(() => {}));

    const { result, rerender } = renderHook(() => useCoins(), {
      wrapper: createWrapper,
    });

    const firstRefetch = result.current.refetch;

    rerender();

    expect(result.current.refetch).toBe(firstRefetch);
  });
});
