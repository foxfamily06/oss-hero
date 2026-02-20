// sw.js

const CACHE_NAME = 'oss-hero-cache-v15';

// Service worker semplificato al massimo per evitare problemi di cache durante il debug degli stili
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Pass-through diretto alla rete
  event.respondWith(fetch(event.request));
});