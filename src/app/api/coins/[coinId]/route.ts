import { NextRequest, NextResponse } from 'next/server';
import { apiCache, getCacheKey, CACHE_TTL } from '@/lib/cache';
import { rateLimitedFetch } from '@/lib/rate-limiter';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;

    // Generate cache key
    const cacheKey = getCacheKey('coin-detail', { coinId });

    // Use dedupeRequest to prevent concurrent identical requests
    const data = await apiCache.dedupeRequest(
      cacheKey,
      async () => {
        const url = `${COINGECKO_API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;

        const response = await rateLimitedFetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        return response.json();
      },
      CACHE_TTL.COIN_DETAIL
    );

    const xCacheStatus = (await apiCache.has(cacheKey)) ? 'HIT' : 'MISS';

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': xCacheStatus,
        'X-Cache-Key': cacheKey,
      },
    });
  } catch (error: any) {
    const { coinId } = await params;
    console.error(`Error fetching coin ${coinId}:`, error);

    // Try to return stale data if available
    const cacheKey = getCacheKey('coin-detail', { coinId });
    const staleData = await apiCache.getStale(cacheKey);

    if (staleData) {
      console.warn(`Returning stale data for coin ${coinId} due to error`);
      return NextResponse.json(staleData, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'STALE',
        },
      });
    }

    // Return appropriate error based on status
    if (error.status === 404) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }

    if (error.status === 429) {
      console.warn('CoinGecko API rate limit exceeded');
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch coin data' },
      { status: 500 }
    );
  }
}
