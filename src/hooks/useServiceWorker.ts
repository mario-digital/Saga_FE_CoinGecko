/**
 * Hook for registering and managing service worker
 */

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setState(prev => ({ ...prev, isSupported: true }));

      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          setState(prev => ({
            ...prev,
            isRegistered: true,
            registration,
          }));

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setState(prev => ({ ...prev, isUpdateAvailable: true }));
                }
              });
            }
          });

          // Check for updates periodically
          setInterval(
            () => {
              registration.update();
            },
            60 * 60 * 1000
          ); // Every hour
        })
        .catch(error => {
          console.error('Service worker registration failed:', error);
        });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const clearCache = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  return {
    ...state,
    updateServiceWorker,
    clearCache,
  };
}
