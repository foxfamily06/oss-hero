// sw.js

const CACHE_NAME = 'oss-hero-cache-v4';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './index.js',
  './index.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Installa il service worker e mette in cache le risorse dell'app
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Intercetta le richieste di rete
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se la risorsa è in cache, la restituisce
        if (response) {
          return response;
        }
        // Altrimenti, la richiede dalla rete
        return fetch(event.request).catch(() => {
          // Gestione offline per le richieste non in cache (es. API)
          // In questo caso, per le richieste di navigazione non in cache, non facciamo nulla
          // Potrebbe essere utile restituire una pagina offline generica qui se necessario
        });
      }
    )
  );
});

// Rimuove le vecchie cache quando il service worker si attiva
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});