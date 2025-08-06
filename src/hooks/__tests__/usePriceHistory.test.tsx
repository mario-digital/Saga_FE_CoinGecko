import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { usePriceHistory, TimeRange } from '../usePriceHistory';
import { fetcher } from '@/lib/fetcher';

// Mock the fetcher
jest.mock('@/lib/fetcher');

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

describe('usePriceHistory', () => {
  const mockFetcher = fetcher as jest.MockedFunction<typeof fetcher>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches price history data successfully', async () => {
    const mockData = {
      prices: [
        [1609459200000, 29000],
        [1609545600000, 32000],
      ],
    };

    mockFetcher.mockResolvedValue(mockData);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    // Use real timers for async operations

    // Wait for all state updates to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([
        { date: '1/1/2021', formattedDate: expect.any(String), price: 29000 },
        { date: '1/2/2021', formattedDate: expect.any(String), price: 32000 },
      ]);
    });

    expect(result.current.error).toBeNull();
  });

  it('handles API errors', async () => {
    mockFetcher.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });


    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('API Error');
    });

    expect(result.current.data).toBeNull();
  });

  it('handles empty price data', async () => {
    mockFetcher.mockResolvedValue({
      prices: [],
    });

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });


    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    expect(result.current.error).toBeNull();
  });

  it('formats dates correctly', async () => {
    const mockData = {
      prices: [
        [1640995200000, 50000], // Dec 31, 2021
        [1641081600000, 51000], // Jan 1, 2022
      ],
    };

    mockFetcher.mockResolvedValue(mockData);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '30d'), {
      wrapper: createWrapper,
    });


    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([
        { date: '1/1/2022', formattedDate: expect.any(String), price: 50000 },
        { date: '1/2/2022', formattedDate: expect.any(String), price: 51000 },
      ]);
    });
  });

  it('refetches data when coinId changes', async () => {
    const mockData1 = {
      prices: [[1609459200000, 29000]],
    };
    const mockData2 = {
      prices: [[1609459200000, 3000]],
    };

    mockFetcher
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result, rerender } = renderHook(
      ({ coinId, timeRange }) => usePriceHistory(coinId, timeRange),
      {
        initialProps: { coinId: 'bitcoin', timeRange: '7d' as const },
        wrapper: createWrapper,
      }
    );


    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetcher).toHaveBeenCalledWith('/api/coins/bitcoin/history?days=7');

    await act(async () => {
      rerender({ coinId: 'ethereum', timeRange: '7d' });
    });

    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledWith('/api/coins/ethereum/history?days=7');
    });
  });

  it('refetches data when timeRange changes', async () => {
    const mockData1 = {
      prices: [[1609459200000, 29000]],
    };
    const mockData2 = {
      prices: [[1609459200000, 30000]],
    };

    mockFetcher
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result, rerender } = renderHook(
      ({ coinId, timeRange }: { coinId: string; timeRange: TimeRange }) =>
        usePriceHistory(coinId, timeRange),
      {
        initialProps: { coinId: 'bitcoin', timeRange: '7d' as TimeRange },
        wrapper: createWrapper,
      }
    );


    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      rerender({ coinId: 'bitcoin', timeRange: '30d' as TimeRange });
    });

    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledWith('/api/coins/bitcoin/history?days=30');
    });
  });

  it('provides retry function', async () => {
    mockFetcher
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce({ prices: [[1609459200000, 29000]] });

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });


    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('First error');
    });

    // Call retry
    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual([{ date: '1/1/2021', formattedDate: expect.any(String), price: 29000 }]);
    });
  });

  it('handles missing prices property', async () => {
    mockFetcher.mockResolvedValue({});

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });


    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
    });

    expect(result.current.error).toBeNull();
  });

  it('handles null response', async () => {
    mockFetcher.mockResolvedValue(null);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });


    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
    });

    expect(result.current.error).toBeNull();
  });

  it('handles all time range options', async () => {
    const timeRanges = ['24h', '7d', '30d', '90d', '1y'] as const;

    for (const timeRange of timeRanges) {
      mockFetcher.mockResolvedValue({ prices: [] });

      const { result } = renderHook(
        () => usePriceHistory('bitcoin', timeRange),
        { wrapper: createWrapper }
      );

      expect(result.current.isLoading).toBe(true);


      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    }
  });
});
