/**
 * API endpoint to get cached items list
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiCache } from '@/lib/cache';

export async function GET(_request: NextRequest) {
  try {
    // Get all cache keys and their info
    const cacheItems = apiCache.getCacheItems();

    return NextResponse.json(cacheItems, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error getting cache items:', error);
    return NextResponse.json(
      { error: 'Failed to get cache items' },
      { status: 500 }
    );
  }
}
