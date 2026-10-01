// Поднимайте VERSION при каждом релизе: старый кэш будет удалён автоматически.
const VERSION = 'v0.5.0';
const CACHE = `kmg-${VERSION}`;
const ASSETS = [
  './',
  'games/chto-poyavilos.html',
  'games/chto-propalo.html',
  'games/kotik-i-shchenok.html',
  'games/posledovatelnost.html',
  'games/skolko.html',
  'games/tretiy-lishniy.html',
  'games/uzor.html',
  'index.html',
  'manifest.json',
  'shared/content/levels-memory.json',
  'shared/content/posledovatelnost.json',
  'shared/content/rounds-tretiy.json',
  'shared/content/skolko.json',
  'shared/content/uzor.json',
  'shared/css/base.css',
  'shared/css/cards.css',
  'shared/css/layout.css',
  'shared/img/icon-192.png',
  'shared/img/icon-512.png',
  'shared/img/icon-maskable-512.png',
  'shared/js/content/cards.js',
  'shared/js/content/loader.js',
  'shared/js/core/dom.js',
  'shared/js/core/progress.js',
  'shared/js/core/pwa.js',
  'shared/js/core/rng.js',
  'shared/js/core/settings.js',
  'shared/js/core/sound.js',
  'shared/js/core/storage.js',
  'shared/js/core/voice.js',
  'shared/js/logic/appeared.js',
  'shared/js/logic/count.js',
  'shared/js/logic/missing.js',
  'shared/js/logic/pattern.js',
  'shared/js/logic/progress-model.js',
  'shared/js/logic/sequence.js',
  'shared/js/logic/tictactoe.js',
  'shared/js/logic/tretiy.js',
  'shared/js/ui/adult.js',
  'shared/js/ui/boot.js',
  'shared/js/ui/card.js',
  'shared/js/ui/level-switch.js',
  'shared/js/ui/progress-ui.js',
  'shared/js/ui/reward.js',
  'stars.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('kmg-') && key !== CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Сначала кэш (работает офлайн), параллельно тихо обновляем из сети.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || (request.mode === 'navigate' ? caches.match('index.html') : undefined));
      return cached || network;
    })
  );
});
