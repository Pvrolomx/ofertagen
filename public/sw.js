// Bump de versión: fuerza el activate a purgar la caché envenenada anterior (v1 servía JS viejo).
const CACHE_NAME = 'ofertagen-v2';

// Estrategia (T1):
//  - Navegación / app shell (HTML) → network-first: cada deploy llega con un simple reload.
//  - Assets inmutables /_next/static/ → cache-first: van hasheados por Next, cachearlos es seguro y da offline.
//  - Resto (/api/, iconos, manifest, etc.) → network-first con fallback a caché para offline.
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo GET es cacheable; lo demás pasa directo a la red.
  if (req.method !== 'GET') return;

  // Assets inmutables hasheados → cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return resp;
      }))
    );
    return;
  }

  // Navegación (HTML) y todo lo demás → network-first, con fallback a caché offline.
  event.respondWith(
    fetch(req).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, clone));
      return resp;
    }).catch(() =>
      caches.match(req).then(cached =>
        cached || (req.mode === 'navigate' ? caches.match('/') : undefined)
      )
    )
  );
});

// Activa el SW nuevo de inmediato, sin esperar a que se cierren las pestañas viejas.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(n => Promise.all(n.filter(x => x !== CACHE_NAME).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});
