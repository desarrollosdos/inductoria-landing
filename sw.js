// Service worker mínimo de Inductoria.
// Su único propósito es cumplir el requisito técnico de Chrome/Android
// para poder "instalar" el sitio como app (no hace nada de offline
// complejo, solo cachea el shell básico para que la instalación sea
// posible y la carga sea un poco más rápida en visitas repetidas).

const CACHE_NAME = 'inductoria-shell-v1';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icono-inductoria-512.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // No tocar llamadas a la API (precio, visita): siempre a la red.
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
