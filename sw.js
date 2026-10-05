// Service worker: guarda el juego en el dispositivo para que funcione sin conexión.
// Responde desde la copia guardada y, en paralelo, la actualiza desde la red:
// después de publicar cambios, se ven a partir de la segunda vez que se abre el juego.

const CACHE = 'bosque-v1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/sprites.js', 'js/forest.js', 'js/audio.js', 'js/game.js',
  'js/level1.js', 'js/level2.js', 'js/level3.js', 'js/main.js',
  'fonts/fredoka-latin.woff2', 'fonts/press-start-2p-latin.woff2',
  'sounds/vaca.mp3', 'sounds/gallina.mp3', 'sounds/pato.mp3', 'sounds/cerdo.mp3', 'sounds/oveja.mp3', 'sounds/loba.mp3',
  'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(request, { ignoreSearch: true });
    const fresh = fetch(request)
      .then(response => {
        if (response.status === 200 && response.type === 'basic') cache.put(request, response.clone()).catch(() => {});
        return response;
      })
      .catch(() => cached);
    return cached || fresh;
  }));
});
