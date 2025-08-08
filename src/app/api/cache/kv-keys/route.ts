import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(_request: NextRequest) {
  try {
    // Check if KV is available
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({
        available: false,
        keys: [],
        error: 'KV not configured',
      });
    }

    // Get all keys (with pattern matching for our cache keys)
    const keys = await kv.keys('*');

    // Get details for each key
    const keyDetails = await Promise.all(
      keys.slice(0, 50).map(async key => {
        // Limit to 50 keys for performance
        try {
          const ttl = await kv.ttl(key);
          const value = await kv.get(key);
          const size = JSON.stringify(value).length;

          return {
            key,
            ttl: ttl > 0 ? ttl : 'No expiry',
            size,
            type: key.split(':')[0] || 'unknown',
          };
        } catch (error) {
          return {
            key,
            ttl: 'Unknown',
            size: 0,
            type: 'error',
          };
        }
      })
    );

    return NextResponse.json({
      available: true,
      totalKeys: keys.length,
      keys: keyDetails,
    });
  } catch (error: any) {
    console.error('Error fetching KV keys:', error);
    return NextResponse.json(
      {
        available: false,
        keys: [],
        error: error.message,
      },
      { status: 500 }
    );
  }
}
