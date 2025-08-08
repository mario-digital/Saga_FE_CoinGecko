import { NextRequest, NextResponse } from 'next/server';
import { apiCache, getCacheKey, CACHE_TTL } from '@/lib/cache';
import { rateLimitedFetch } from '@/lib/rate-limiter';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '20';

    // Generate cache key
    const cacheKey = getCacheKey('coins', { page, per_page });

    // Use dedupeRequest to prevent concurrent identical requests
    const data = await apiCache.dedupeRequest(
      cacheKey,
      async () => {
        const url = `${COINGECKO_API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${per_page}&page=${page}&sparkline=false&locale=en`;

        const response = await rateLimitedFetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        return response.json();
      },
      CACHE_TTL.COINS_LIST
    );

    const xCacheStatus = (await apiCache.has(cacheKey)) ? 'HIT' : 'MISS';

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'X-Cache': xCacheStatus,
        'X-Cache-Key': cacheKey,
      },
    });
  } catch (error: any) {
    console.error('Error fetching coins:', error);

    // Try to return stale data if available
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '20';
    const cacheKey = getCacheKey('coins', { page, per_page });
    const staleData = await apiCache.getStale(cacheKey);

    if (staleData) {
      console.warn('Returning stale data due to error');
      return NextResponse.json(staleData, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'STALE',
        },
      });
    }

    // Return appropriate error based on status
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch coins data' },
      { status: 500 }
    );
  }
}
