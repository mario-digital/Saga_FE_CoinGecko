/**
 * Dynamic import wrapper for PullToRefresh
 * Used for code splitting to reduce mobile bundle size
 */

import dynamic from 'next/dynamic';

export const PullToRefreshDynamic = dynamic(
  () => import('@/components/PullToRefresh').then(mod => mod.PullToRefresh),
  {
    ssr: false, // Disable SSR for touch-based component
  }
);
