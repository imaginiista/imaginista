const CACHE_NAME = 'fraternidade-264-v5'; // Mudamos a versão!
const urlsToCache = [
  './',
  './index.html',
  './site.webmanifest'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // OBRIGA O CELULAR A ATUALIZAR O APP NA HORA!
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // DELETA QUALQUER CACHE VELHO
          }
        })
      );
    })
  );
  self.clients.claim(); // Toma o controle do site na hora!
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});