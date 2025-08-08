/**
 * Dynamic import wrapper for SwipeableCoinCard
 * Used for code splitting to reduce mobile bundle size
 */

import dynamic from 'next/dynamic';

import { CoinCardSkeleton } from '@/components/CoinCardSkeleton';

export const SwipeableCoinCardDynamic = dynamic(
  () => import('@/components/SwipeableCoinCard'),
  {
    loading: () => <CoinCardSkeleton />,
    ssr: false, // Disable SSR for touch-based component
  }
);
