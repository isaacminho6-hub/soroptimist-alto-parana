// Simple PWA cache con fallback para navegaciones (index y revista)
const CACHE = 'si-ap-v1';
const PRECACHE = [
  '/', '/index.html', '/revista.html',
  '/assets/revista/revista-soroptimist.pdf',
  '/assets/revista/portada.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Navegaciones (barra de direcciones / links internos)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() =>
        caches.match(req.url) ||
        caches.match('/revista.html') ||
        caches.match('/index.html')
      )
    );
    return;
  }

  // Assets: cache-first
  e.respondWith(
    caches.match(req).then(r => r || fetch(req))
  );
});
