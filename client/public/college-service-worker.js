const { default: api } = require("@/utils/api");

// College Service Worker for Authority Users
const CACHE_NAME = 'college-data-cache-v1';
const COLLEGE_DATA_KEY = 'authority-college-data';

// Install event - set up cache
self.addEventListener('install', (event) => {
  console.log('College Service Worker: Install event');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('College Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('College Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Message event - handle requests from main thread
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'FETCH_COLLEGE_DATA':
      try {
        console.log('College Service Worker: Fetching college data for authority user');
        
        // Check if data exists in cache first
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/college-data');
        
        if (cachedResponse) {
          const cachedData = await cachedResponse.json();
          console.log('College Service Worker: Using cached college data');
          
          // Send cached data back to main thread
          event.ports[0].postMessage({
            type: 'COLLEGE_DATA_SUCCESS',
            data: cachedData
          });
          return;
        }

        // Fetch fresh data from API
        const response = await api.get('/api/college-names', {
          withCredentials: true
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Store in cache
        const responseToCache = new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=3600' // Cache for 1 hour
          }
        });
        
        await cache.put('/college-data', responseToCache);
        
        console.log('College Service Worker: College data fetched and cached');
        
        // Send data back to main thread
        event.ports[0].postMessage({
          type: 'COLLEGE_DATA_SUCCESS',
          data: data
        });

      } catch (error) {
        console.error('College Service Worker: Error fetching college data:', error);
        
        // Send error back to main thread
        event.ports[0].postMessage({
          type: 'COLLEGE_DATA_ERROR',
          error: error.message
        });
      }
      break;

    case 'CLEAR_COLLEGE_CACHE':
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete('/college-data');
        console.log('College Service Worker: College cache cleared');
        
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED'
        });
      } catch (error) {
        console.error('College Service Worker: Error clearing cache:', error);
        event.ports[0].postMessage({
          type: 'CACHE_CLEAR_ERROR',
          error: error.message
        });
      }
      break;

    default:
      console.log('College Service Worker: Unknown message type:', type);
  }
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  // Only handle college-related requests for authority users
  if (event.request.url.includes('/api/college-names')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached response if available
        if (response) {
          console.log('College Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        // Otherwise fetch from network
        console.log('College Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request);
      })
    );
  }
});
