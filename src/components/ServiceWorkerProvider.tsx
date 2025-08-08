'use client';

/**
 * Client component to handle service worker registration
 */

import { useEffect } from 'react';

import { useServiceWorker } from '@/hooks/useServiceWorker';

export function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (isUpdateAvailable) {
      // Show update notification (could be a toast or banner)
      const shouldUpdate = window.confirm(
        'A new version is available. Would you like to update?'
      );
      if (shouldUpdate) {
        updateServiceWorker();
      }
    }
  }, [isUpdateAvailable, updateServiceWorker]);

  return <>{children}</>;
}
