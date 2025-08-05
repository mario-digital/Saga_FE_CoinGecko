export const registerServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      console.log(
        'Service Worker registered successfully:',
        registration.scope
      );

      // Check for updates immediately
      registration.update();

      // Check for updates every 30 seconds when the page is visible
      if (document.visibilityState === 'visible') {
        setInterval(() => {
          registration.update();
        }, 30000);
      }

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              console.log('New service worker available, refresh to update');

              // Auto-update after a short delay
              setTimeout(() => {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }, 5000);
            }
          });
        }
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker updated');
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const unregisterServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

export const clearServiceWorkerCache = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage({ type: 'CLEAR_CACHE' });
      console.log('Service Worker cache cleared');
    }
  }
};
