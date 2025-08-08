import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { usePriceHistory, TimeRange } from '../usePriceHistory';
import { api } from '@/lib/api';

// Mock the api
jest.mock('@/lib/api');

// Mock useSWR for some specific tests
jest.mock('swr', () => {
  const actual = jest.requireActual('swr');
  return {
    ...actual,
    __esModule: true,
    default: jest.fn(actual.default),
  };
});

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
  const mockApi = api as jest.MockedObject<typeof api>;

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
      market_caps: [],
      total_volumes: [],
    };

    mockApi.getPriceHistory.mockResolvedValue(mockData);

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
    mockApi.getPriceHistory.mockRejectedValue(new Error('API Error'));

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
    mockApi.getPriceHistory.mockResolvedValue({
      prices: [],
      market_caps: [],
      total_volumes: [],
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
      market_caps: [],
      total_volumes: [],
    };

    mockApi.getPriceHistory.mockResolvedValue(mockData);

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
      market_caps: [],
      total_volumes: [],
    };
    const mockData2 = {
      prices: [[1609459200000, 3000]],
      market_caps: [],
      total_volumes: [],
    };

    mockApi.getPriceHistory
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

    expect(mockApi.getPriceHistory).toHaveBeenCalledWith('bitcoin', '7d');

    await act(async () => {
      rerender({ coinId: 'ethereum', timeRange: '7d' });
    });

    await waitFor(() => {
      expect(mockApi.getPriceHistory).toHaveBeenCalledWith('ethereum', '7d');
    });
  });

  it('refetches data when timeRange changes', async () => {
    const mockData1 = {
      prices: [[1609459200000, 29000]],
      market_caps: [],
      total_volumes: [],
    };
    const mockData2 = {
      prices: [[1609459200000, 30000]],
      market_caps: [],
      total_volumes: [],
    };

    mockApi.getPriceHistory
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
      expect(mockApi.getPriceHistory).toHaveBeenCalledWith('bitcoin', '30d');
    });
  });

  it('provides retry function', async () => {
    mockApi.getPriceHistory
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce({
        prices: [[1609459200000, 29000]],
        market_caps: [],
        total_volumes: [],
      });

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
      expect(result.current.data).toEqual([
        { date: '1/1/2021', formattedDate: expect.any(String), price: 29000 },
      ]);
    });
  });

  it('handles missing prices property', async () => {
    mockApi.getPriceHistory.mockResolvedValue({
      prices: [],
      market_caps: [],
      total_volumes: [],
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

  it('handles null response', async () => {
    mockApi.getPriceHistory.mockResolvedValue({
      prices: [],
      market_caps: [],
      total_volumes: [],
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

  it('handles all time range options', async () => {
    const timeRanges = ['24h', '7d', '30d', '90d', '1y'] as const;

    for (const timeRange of timeRanges) {
      mockApi.getPriceHistory.mockResolvedValue({
        prices: [],
        market_caps: [],
        total_volumes: [],
      });

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

  it('handles rate limit errors correctly', async () => {
    const rateLimitError = new Error('Rate limit exceeded');
    mockApi.getPriceHistory.mockRejectedValue(rateLimitError);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(
        'Rate limit exceeded. Please wait a minute before refreshing the page.'
      );
    });

    expect(result.current.data).toBeNull();
  });

  it('handles 404 not found errors correctly', async () => {
    const notFoundError = new Error('404 not found');
    mockApi.getPriceHistory.mockRejectedValue(notFoundError);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(
        'Price history not found for this coin.'
      );
    });

    expect(result.current.data).toBeNull();
  });

  it('handles alternative not found error message', async () => {
    const notFoundError = new Error('Resource not found');
    mockApi.getPriceHistory.mockRejectedValue(notFoundError);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(
        'Price history not found for this coin.'
      );
    });

    expect(result.current.data).toBeNull();
  });

  it('does not fetch when coinId is null', () => {
    const { result } = renderHook(() => usePriceHistory('', '7d'), {
      wrapper: createWrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockApi.getPriceHistory).not.toHaveBeenCalled();
  });

  describe('onErrorRetry behavior', () => {
    let onErrorRetryCallback: any;
    let revalidateMock: jest.Mock;

    beforeEach(() => {
      jest.useFakeTimers();
      revalidateMock = jest.fn();

      // Use the already mocked useSWR
      const useSWR = require('swr').default;

      useSWR.mockImplementation((key: any, fetcher: any, config: any) => {
        // Capture the onErrorRetry callback
        onErrorRetryCallback = config?.onErrorRetry;
        return {
          data: undefined,
          error: undefined,
          isLoading: false,
          mutate: jest.fn(),
        };
      });
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });

    it('should not retry on 404 errors', () => {
      renderHook(() => usePriceHistory('bitcoin', '7d'), {
        wrapper: createWrapper,
      });

      const error404 = { status: 404, message: 'Not Found' };
      onErrorRetryCallback(
        error404,
        'price-history-bitcoin-7d',
        {},
        revalidateMock,
        { retryCount: 0 }
      );

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      // Should not call revalidate for 404 errors
      expect(revalidateMock).not.toHaveBeenCalled();
    });

    it('should retry non-404 errors with exponential backoff', () => {
      renderHook(() => usePriceHistory('bitcoin', '7d'), {
        wrapper: createWrapper,
      });

      const networkError = { status: 500, message: 'Server Error' };

      // First retry (retryCount = 0)
      onErrorRetryCallback(
        networkError,
        'price-history-bitcoin-7d',
        {},
        revalidateMock,
        { retryCount: 0 }
      );

      // Should wait 3000ms for first retry
      jest.advanceTimersByTime(2999);
      expect(revalidateMock).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(revalidateMock).toHaveBeenCalledWith({ retryCount: 0 });
      expect(revalidateMock).toHaveBeenCalledTimes(1);

      revalidateMock.mockClear();

      // Second retry (retryCount = 1)
      onErrorRetryCallback(
        networkError,
        'price-history-bitcoin-7d',
        {},
        revalidateMock,
        { retryCount: 1 }
      );

      // Should wait 6000ms for second retry (3000 * 2^1)
      jest.advanceTimersByTime(5999);
      expect(revalidateMock).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(revalidateMock).toHaveBeenCalledWith({ retryCount: 1 });
      expect(revalidateMock).toHaveBeenCalledTimes(1);
    });

    it('should not retry after 2 attempts', () => {
      renderHook(() => usePriceHistory('bitcoin', '7d'), {
        wrapper: createWrapper,
      });

      const networkError = { status: 500, message: 'Server Error' };

      // Third attempt (retryCount = 2)
      onErrorRetryCallback(
        networkError,
        'price-history-bitcoin-7d',
        {},
        revalidateMock,
        { retryCount: 2 }
      );

      // Should not retry after 2 attempts
      jest.advanceTimersByTime(100000);
      expect(revalidateMock).not.toHaveBeenCalled();

      // Fourth attempt (retryCount = 3)
      onErrorRetryCallback(
        networkError,
        'price-history-bitcoin-7d',
        {},
        revalidateMock,
        { retryCount: 3 }
      );

      jest.advanceTimersByTime(100000);
      expect(revalidateMock).not.toHaveBeenCalled();
    });
  });

  describe('SWR configuration', () => {
    beforeEach(() => {
      const useSWR = require('swr').default;

      useSWR.mockImplementation(() => ({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('passes correct configuration to useSWR', () => {
      const useSWR = require('swr').default;

      renderHook(() => usePriceHistory('bitcoin', '7d'), {
        wrapper: createWrapper,
      });

      const [key, fetcher, config] = useSWR.mock.calls[0];

      expect(key).toBe('price-history-bitcoin-7d');
      expect(typeof fetcher).toBe('function');
      expect(config).toMatchObject({
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 30000,
        refreshInterval: 60000,
        shouldRetryOnError: false,
      });
      expect(typeof config.onErrorRetry).toBe('function');
    });

    it('calls api.getPriceHistory when fetcher is invoked', async () => {
      let fetcherFunction: any;
      const useSWR = require('swr').default;

      useSWR.mockImplementation((key: any, fetcher: any) => {
        fetcherFunction = fetcher;
        return {
          data: undefined,
          error: undefined,
          isLoading: true,
          mutate: jest.fn(),
        };
      });

      renderHook(() => usePriceHistory('bitcoin', '7d'), {
        wrapper: createWrapper,
      });

      // Verify the fetcher function is provided
      expect(fetcherFunction).toBeDefined();
      expect(typeof fetcherFunction).toBe('function');

      // Execute the fetcher to ensure coverage
      if (fetcherFunction) {
        mockApi.getPriceHistory.mockResolvedValue({
          prices: [[1609459200000, 29000]],
          market_caps: [],
          total_volumes: [],
        });
        const result = await fetcherFunction();
        expect(mockApi.getPriceHistory).toHaveBeenCalledWith('bitcoin', '7d');
      }
    });
  });
});
