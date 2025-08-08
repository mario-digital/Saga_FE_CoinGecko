import { renderHook, act, waitFor } from '@testing-library/react';
import useSWR from 'swr';
import { useSearch } from '../useSearch';
import { SearchResponse } from '@/types/coingecko';

// Mock SWR
jest.mock('swr');
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

// Mock the debounce utility
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  debounce: jest.fn(fn => fn), // Return the function directly for testing
}));

const mockSearchResponse: SearchResponse = {
  coins: [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      market_cap_rank: 1,
      thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      market_cap_rank: 2,
      thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
    },
  ],
  exchanges: [],
  categories: [],
};

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchResults).toBeUndefined();
    expect(result.current.isSearching).toBe(false);
    expect(result.current.searchError).toBeNull();
  });

  it('updates search query', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.searchQuery).toBe('bitcoin');
  });

  it('does not trigger search for queries less than 2 characters', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('b');
    });

    // SWR should be called with null key for short queries
    expect(mockUseSWR).toHaveBeenCalledWith(null, null, expect.any(Object));
  });

  it('triggers search for queries with 2 or more characters', () => {
    mockUseSWR.mockReturnValue({
      data: mockSearchResponse,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    // SWR should be called with a valid key
    expect(mockUseSWR).toHaveBeenCalledWith(
      'search-bitcoin',
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('returns search results from API response', () => {
    mockUseSWR.mockReturnValue({
      data: mockSearchResponse,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.searchResults).toEqual(mockSearchResponse.coins);
  });

  it('shows loading state when searching', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.isSearching).toBe(true);
  });

  it('handles search errors', () => {
    const mockError = {
      message: 'Network error',
      status: 400,
    };

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.searchError).toBe('Network error');
  });

  it('handles rate limit errors with custom message', () => {
    const mockError = {
      message: 'Too Many Requests',
      status: 429,
    };

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.searchError).toBe(
      'Too many search requests. Please wait a moment and try again.'
    );
  });

  it('handles server errors with custom message', () => {
    const mockError = {
      message: 'Internal Server Error',
      status: 500,
    };

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.searchError).toBe(
      'Search service is temporarily unavailable. Please try again later.'
    );
  });

  it('handles errors without message', () => {
    const mockError = {
      status: 400,
    };

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.searchError).toBe(
      'An error occurred while searching. Please try again.'
    );
  });

  it('clears search query and results', () => {
    const mockData = mockSearchResponse;

    mockUseSWR.mockImplementation(url => ({
      data: url ? mockData : undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    }));

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.searchQuery).toBe('bitcoin');
    expect(result.current.searchResults).toEqual(mockSearchResponse.coins);

    // Clear search should set query to empty and SWR should be called with null
    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe('');
    // After clearing, the URL should be null, so data should be undefined
    expect(result.current.searchResults).toBeUndefined();
  });

  it('trims whitespace from search query', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchQuery('  bitcoin  ');
    });

    expect(result.current.searchQuery).toBe('  bitcoin  ');

    // The actual search should use trimmed query
    expect(mockUseSWR).toHaveBeenCalledWith(
      'search-bitcoin',
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('uses correct SWR configuration', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    });

    renderHook(() => useSearch());

    expect(mockUseSWR).toHaveBeenCalledWith(null, null, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    });
  });
});
