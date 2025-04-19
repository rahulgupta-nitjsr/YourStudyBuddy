// Basic Service Worker

const CACHE_NAME = 'study-buddy-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/images/icons/icon-192x192.png' // Add other essential assets
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Install completed');
        return self.skipWaiting(); // Activate worker immediately
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
        console.log('Service Worker: Activation completed');
        return self.clients.claim(); // Take control of open clients
    })
  );
});

self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  // Basic cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      })
  );
}); 