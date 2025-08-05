'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCoinDetail } from '@/hooks/useCoinDetail';
import { CoinDetailHeader } from '@/components/CoinDetailHeader';
import { CoinDetailSkeleton } from '@/components/CoinDetailSkeleton';
import { CoinDetailError } from '@/components/CoinDetailError';
import { CoinStats } from '@/components/CoinStats';
import { PriceChanges } from '@/components/PriceChanges';
import { CoinDescription } from '@/components/CoinDescription';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CoinDetailPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default function CoinDetailPage({ params }: CoinDetailPageProps) {
  const resolvedParams = use(params);

  // Validate coinId parameter
  const coinId = resolvedParams.coinId;
  const isValidCoinId = /^[a-z0-9-]+$/.test(coinId);

  const { coin, isLoading, error, retry } = useCoinDetail(
    isValidCoinId ? coinId : ''
  );

  // Show error for invalid coin ID format
  if (!isValidCoinId) {
    return (
      <CoinDetailError
        error={
          new Error(
            'Invalid coin ID format. Coin IDs should only contain lowercase letters, numbers, and hyphens.'
          )
        }
        retry={() => (window.location.href = '/')}
      />
    );
  }

  if (isLoading) {
    return <CoinDetailSkeleton />;
  }

  if (error) {
    return <CoinDetailError error={error} retry={retry} />;
  }

  if (!coin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{coin.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Link>
        </Button>
      </div>

      {/* Header with coin info */}
      <CoinDetailHeader coin={coin} />

      {/* Market statistics */}
      <CoinStats marketData={coin.market_data} rank={coin.market_cap_rank} />

      {/* Price changes */}
      <PriceChanges
        priceChanges={{
          '24h': coin.market_data.price_change_percentage_24h,
          '7d': coin.market_data.price_change_percentage_7d,
          '30d': coin.market_data.price_change_percentage_30d,
          '1y': coin.market_data.price_change_percentage_1y,
        }}
      />

      {/* Description and links */}
      <CoinDescription
        description={coin.description.en}
        links={coin.links}
        categories={coin.categories}
      />
    </div>
  );
}
