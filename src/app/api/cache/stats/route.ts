/**
 * API endpoint to view cache statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiCache, getContainerAge } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';

export async function GET(_request: NextRequest) {
  try {
    // Get cache statistics
    const cacheStats = apiCache.getStats();
    const kvStats = await apiCache.getKvStats();
    const rateLimitStats = rateLimiter.getStats();

    const stats = {
      cache: {
        ...cacheStats,
        hitRatePercentage: `${(cacheStats.hitRate * 100).toFixed(2)}%`,
      },
      kv: kvStats,
      rateLimiter: rateLimitStats,
      containerAge: getContainerAge(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}
