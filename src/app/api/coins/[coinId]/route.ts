import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;

    const url = `${COINGECKO_API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      // Cache for 1 minute
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
      }
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error(`Error fetching coin:`, error);

    return NextResponse.json(
      { error: 'Failed to fetch coin data' },
      { status: 500 }
    );
  }
}
