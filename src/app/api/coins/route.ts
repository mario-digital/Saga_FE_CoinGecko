import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '20';

    const url = `${COINGECKO_API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${per_page}&page=${page}&sparkline=false&locale=en`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      // Cache for 1 minute to reduce API calls
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching coins:', error);

    return NextResponse.json(
      { error: 'Failed to fetch coins data' },
      { status: 500 }
    );
  }
}
