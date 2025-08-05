import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '7';
    const { coinId } = await params;

    const url = `${COINGECKO_API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      // Cache for 5 minutes
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error(`Error fetching price history:`, error);

    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}
