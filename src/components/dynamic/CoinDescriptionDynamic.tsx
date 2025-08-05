/**
 * Dynamic import wrapper for CoinDescription
 * Lazy loads the description component which can contain large text
 */

import dynamic from 'next/dynamic';

export const CoinDescriptionDynamic = dynamic(
  () => import('@/components/CoinDescription').then(mod => mod.CoinDescription),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    ),
    ssr: true, // Keep SSR for SEO
  }
);
