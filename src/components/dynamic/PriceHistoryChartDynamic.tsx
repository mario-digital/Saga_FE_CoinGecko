/**
 * Dynamic import wrapper for PriceHistoryChart
 * Reduces initial bundle size by lazy loading the heavy Recharts library
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ChartSkeleton = () => (
  <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
    <p className="text-gray-500 dark:text-gray-400">Loading chart...</p>
  </div>
);

export const PriceHistoryChartDynamic = dynamic(
  () => import('@/components/PriceHistoryChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
