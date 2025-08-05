/**
 * Tests for useCoinDetail hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import {
  useCoinDetail,
  CoinNotFoundError,
  NetworkError,
} from '../useCoinDetail';
import { ApiError } from '@/lib/fetcher';

// Mock SWR
jest.mock('swr');
import useSWR from 'swr';

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe('useCoinDetail', () => {
  const mockCoinData = {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    market_cap_rank: 1,
    image: {
      thumb: 'https://example.com/thumb.png',
      small: 'https://example.com/small.png',
      large: 'https://example.com/large.png',
    },
    description: {
      en: 'Bitcoin is a decentralized cryptocurrency.',
    },
    links: {
      homepage: ['https://bitcoin.org'],
      blockchain_site: [],
      official_forum_url: [],
      chat_url: [],
      announcement_url: [],
      twitter_screen_name: 'bitcoin',
      facebook_username: '',
      bitcointalk_thread_identifier: null,
      telegram_channel_identifier: '',
      subreddit_url: 'https://reddit.com/r/bitcoin',
      repos_url: {
        github: ['https://github.com/bitcoin/bitcoin'],
        bitbucket: [],
      },
    },
    market_data: {
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
    },
    categories: ['Cryptocurrency'],
    platforms: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useCoinDetail('bitcoin'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.coin).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('returns coin data when loaded', () => {
    mockUseSWR.mockReturnValue({
      data: mockCoinData,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useCoinDetail('bitcoin'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.coin).toEqual(mockCoinData);
    expect(result.current.error).toBeNull();
  });

  it('returns error for 404 response', () => {
    const error404 = new ApiError('Not Found', 404);
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: error404,
      isLoading: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useCoinDetail('invalid-coin'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.coin).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(CoinNotFoundError);
    expect(result.current.error?.message).toBe(
      'Coin with ID "invalid-coin" not found'
    );
  });

  it('returns network error for other errors', () => {
    const networkError = new ApiError('Network Error', 500);
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: networkError,
      isLoading: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useCoinDetail('bitcoin'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.coin).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(NetworkError);
    expect(result.current.error?.message).toBe('Network Error');
  });

  it('returns rate limit error for 429 response', () => {
    const rateLimitError = new ApiError('Too Many Requests', 429);
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: rateLimitError,
      isLoading: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useCoinDetail('bitcoin'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.coin).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(NetworkError);
    expect(result.current.error?.message).toBe(
      'Rate limit exceeded. Please try again later.'
    );
  });

  it('calls mutate when retry is called', () => {
    const mutateMock = jest.fn();
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('Test error'),
      isLoading: false,
      mutate: mutateMock,
    } as any);

    const { result } = renderHook(() => useCoinDetail('bitcoin'));

    result.current.retry();

    expect(mutateMock).toHaveBeenCalledTimes(1);
  });

  it('does not make request when coinId is empty', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useCoinDetail(''));

    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('includes correct query parameters in URL', () => {
    mockUseSWR.mockReturnValue({
      data: mockCoinData,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useCoinDetail('bitcoin'));

    const expectedUrl = '/api/coins/bitcoin';
    expect(mockUseSWR).toHaveBeenCalledWith(
      expectedUrl,
      expect.any(Function),
      expect.any(Object)
    );
  });
});
