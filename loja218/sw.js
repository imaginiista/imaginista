const CACHE_NAME = 'loja-218-v1'; 
const urlsToCache = [
  './',
  './index.html',
  './site.webmanifest',
  './imagens/218.webp',
  './song/play.mp3'
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
  // Se for uma requisição de navegação (o arquivo HTML principal)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request) // Tenta pegar a versão mais nova da internet
        .catch(() => {
          // Se falhar (usuário offline), pega a versão salva no cache
          return caches.match(event.request);
        })
    );
    return; // Sai da função
  }

  // Para todo o resto (imagens, sons, arquivos pesados) -> Cache First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});