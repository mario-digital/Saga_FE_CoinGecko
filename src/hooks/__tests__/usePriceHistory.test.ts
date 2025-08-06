import { renderHook, waitFor, act } from '@testing-library/react';
import { usePriceHistory, TimeRange } from '../usePriceHistory';
import { api } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api');

describe('usePriceHistory', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('fetches price history data successfully', async () => {
    const mockData = {
      prices: [
        [1609459200000, 29000],
        [1609545600000, 32000],
      ],
    };

    mockApi.getPriceHistory = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'));

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    // Use real timers for async operations
    jest.useRealTimers();

    // Wait for all state updates to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([
        { date: '1/1/2021', price: 29000 },
        { date: '1/2/2021', price: 32000 },
      ]);
    });

    expect(result.current.error).toBeNull();
  });

  it('handles API errors', async () => {
    mockApi.getPriceHistory = jest
      .fn()
      .mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'));

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch price history');
    });

    expect(result.current.data).toBeNull();
  });

  it('handles empty price data', async () => {
    mockApi.getPriceHistory = jest.fn().mockResolvedValue({
      prices: [],
    });

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'));

    jest.useRealTimers();

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

    mockApi.getPriceHistory = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '30d'));

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([
        { date: '1/1/2022', price: 50000 },
        { date: '1/2/2022', price: 51000 },
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

    mockApi.getPriceHistory = jest
      .fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result, rerender } = renderHook(
      ({ coinId, timeRange }) => usePriceHistory(coinId, timeRange),
      {
        initialProps: { coinId: 'bitcoin', timeRange: '7d' as const },
      }
    );

    jest.useRealTimers();

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
    };
    const mockData2 = {
      prices: [[1609459200000, 30000]],
    };

    mockApi.getPriceHistory = jest
      .fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result, rerender } = renderHook(
      ({ coinId, timeRange }: { coinId: string; timeRange: TimeRange }) =>
        usePriceHistory(coinId, timeRange),
      {
        initialProps: { coinId: 'bitcoin', timeRange: '7d' as TimeRange },
      }
    );

    jest.useRealTimers();

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
    mockApi.getPriceHistory = jest
      .fn()
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce({ prices: [[1609459200000, 29000]] });

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'));

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch price history');
    });

    // Call retry
    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual([{ date: '1/1/2021', price: 29000 }]);
    });
  });

  it('handles missing prices property', async () => {
    mockApi.getPriceHistory = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'));

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    expect(result.current.error).toBeNull();
  });

  it('handles null response', async () => {
    mockApi.getPriceHistory = jest.fn().mockResolvedValue(null);

    const { result } = renderHook(() => usePriceHistory('bitcoin', '7d'));

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    expect(result.current.error).toBeNull();
  });

  it('handles all time range options', async () => {
    const timeRanges = ['24h', '7d', '30d', '90d', '1y'] as const;

    for (const timeRange of timeRanges) {
      mockApi.getPriceHistory = jest.fn().mockResolvedValue({ prices: [] });

      const { result } = renderHook(() =>
        usePriceHistory('bitcoin', timeRange)
      );

      expect(result.current.isLoading).toBe(true);

      jest.useRealTimers();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.useFakeTimers();
    }
  });
});
