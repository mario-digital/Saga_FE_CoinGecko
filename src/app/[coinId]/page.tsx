'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCoinDetail } from '@/hooks/useCoinDetail';
import { CoinDetailHeader } from '@/components/CoinDetailHeader';
import { CoinDetailSkeleton } from '@/components/CoinDetailSkeleton';
import { CoinDetailError } from '@/components/CoinDetailError';
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
  const { coin, isLoading, error, retry } = useCoinDetail(
    resolvedParams.coinId
  );

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

      {/* TODO: Add CoinStats component */}
      {/* TODO: Add PriceChanges component */}
      {/* TODO: Add CoinDescription component */}
    </div>
  );
}
