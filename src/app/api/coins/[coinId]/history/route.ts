import { NextRequest, NextResponse } from 'next/server';
import { apiCache, getCacheKey, CACHE_TTL } from '@/lib/cache';
import { rateLimitedFetch } from '@/lib/rate-limiter';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '7';
    const { coinId } = await params;

    // Generate cache key
    const cacheKey = getCacheKey('price-history', { coinId, days });

    // Use dedupeRequest to prevent concurrent identical requests
    const data = await apiCache.dedupeRequest(
      cacheKey,
      async () => {
        const url = `${COINGECKO_API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;

        const response = await rateLimitedFetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        return response.json();
      },
      CACHE_TTL.PRICE_HISTORY
    );

    const xCacheStatus = (await apiCache.has(cacheKey)) ? 'HIT' : 'MISS';

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        'X-Cache': xCacheStatus,
        'X-Cache-Key': cacheKey,
      },
    });
  } catch (error: any) {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '7';
    const { coinId } = await params;
    console.error(`Error fetching price history for ${coinId}:`, error);

    // Try to return stale data if available
    const cacheKey = getCacheKey('price-history', { coinId, days });
    const staleData = await apiCache.getStale(cacheKey);

    if (staleData) {
      console.warn(`Returning stale price history for ${coinId} due to error`);
      return NextResponse.json(staleData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'STALE',
        },
      });
    }

    // Return appropriate error based on status
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Price history not found for this coin' },
        { status: 404 }
      );
    }

    if (error.status === 429) {
      console.warn('CoinGecko API rate limit exceeded for price history');
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}
