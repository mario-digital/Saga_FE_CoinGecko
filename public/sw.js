/**
 * Service Worker for offline capability and performance optimization
 */

const CACHE_NAME = 'crypto-market-v2';
const API_CACHE_NAME = 'crypto-api-v2';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/robots.txt',
  '/images/placeholder-coin.svg',
];

// Cache API responses for 2 minutes (faster updates)
const API_CACHE_MAX_AGE = 2 * 60 * 1000;

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME;
          })
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, cache fallback strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with stale-while-revalidate strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async cache => {
        const cachedResponse = await cache.match(request);

        // Fetch fresh data in the background
        const fetchPromise = fetch(request).then(response => {
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        });

        // Return cached response immediately if available
        if (cachedResponse) {
          const cacheTime = cachedResponse.headers.get('sw-cache-time');
          const age = cacheTime ? Date.now() - parseInt(cacheTime) : Infinity;

          // If cache is fresh enough, return it
          if (age < API_CACHE_MAX_AGE) {
            return cachedResponse;
          }
        }

        // Wait for network response
        return fetchPromise.catch(() => {
          // If network fails and we have cache, use it
          return (
            cachedResponse ||
            new Response('{"error": "Offline"}', {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        });
      })
    );
    return;
  }

  // Handle static assets
  if (
    request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            // Update cache in background
            fetch(request).then(networkResponse => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse);
              }
            });
            return cachedResponse;
          }

          return fetch(request).then(networkResponse => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  // Default: network first, cache fallback
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for data refresh
self.addEventListener('sync', event => {
  if (event.tag === 'sync-crypto-data') {
    event.waitUntil(syncCryptoData());
  }
});

async function syncCryptoData() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();

    // Refresh cached API data
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.status === 200) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.error('Failed to sync:', request.url, error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Listen for messages from the app
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
