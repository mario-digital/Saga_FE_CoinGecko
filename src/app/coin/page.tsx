'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

import { CoinDescription } from '@/components/CoinDescription';
import { CoinDetailError } from '@/components/CoinDetailError';
import { CoinDetailHeader } from '@/components/CoinDetailHeader';
import { CoinDetailSkeleton } from '@/components/CoinDetailSkeleton';
import { CoinStats } from '@/components/CoinStats';
import { PriceHistoryChartDynamic } from '@/components/dynamic/PriceHistoryChartDynamic';
import { PriceChanges } from '@/components/PriceChanges';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useCoinDetail } from '@/hooks/useCoinDetail';

function CoinDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const coinId = searchParams.get('id') || '';

  // Validate coinId parameter
  const isValidCoinId = /^[a-z0-9-]+$/.test(coinId);

  const { coin, isLoading, error, retry } = useCoinDetail(
    isValidCoinId ? coinId : ''
  );

  // Show error for invalid coin ID format
  if (!isValidCoinId && coinId) {
    return (
      <CoinDetailError
        error={
          new Error(
            'Invalid coin ID format. Coin IDs should only contain lowercase letters, numbers, and hyphens.'
          )
        }
        retry={() => router.push('/')}
      />
    );
  }

  // Show error if no coin ID provided
  if (!coinId) {
    return (
      <CoinDetailError
        error={
          new Error('No coin selected. Please select a coin from the list.')
        }
        retry={() => router.push('/')}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return <CoinDetailSkeleton />;
  }

  // Error state
  if (error) {
    return <CoinDetailError error={error} retry={retry} />;
  }

  // No data state
  if (!coin) {
    return (
      <CoinDetailError
        error={new Error('No data available for this coin')}
        retry={retry}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Coins</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>{coin.name}</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <CoinDetailHeader coin={coin} />

          {/* Stats Grid */}
          {coin.market_data && (
            <CoinStats
              marketData={coin.market_data}
              rank={coin.market_cap_rank}
            />
          )}

          {/* Price Changes */}
          <PriceChanges
            priceChanges={{
              '24h': coin.market_data?.price_change_percentage_24h || 0,
              '7d': coin.market_data?.price_change_percentage_7d || 0,
              '30d': coin.market_data?.price_change_percentage_30d || 0,
              '1y': coin.market_data?.price_change_percentage_1y || 0,
            }}
          />

          {/* Price Chart */}
          <div>
            <h2 className="mb-4 text-2xl font-bold">Price History</h2>
            <PriceHistoryChartDynamic coinId={coin.id} />
          </div>

          {/* Description */}
          <CoinDescription
            description={coin.description?.en || ''}
            links={coin.links}
            categories={coin.categories || []}
          />
        </div>
      </div>
    </div>
  );
}

export default function CoinDetailPage() {
  return (
    <Suspense fallback={<CoinDetailSkeleton />}>
      <CoinDetailContent />
    </Suspense>
  );
}
