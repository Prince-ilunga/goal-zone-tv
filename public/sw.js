// Service Worker GOAL ZONE TV — cache des pages visitées pour offline
const CACHE_NAME = 'goal-zone-tv-v1';
const STATIC_CACHE = 'gztv-static-v1';
const RUNTIME_CACHE = 'gztv-runtime-v1';

// Ressources statiques à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.jpg',
  '/icon-192.png',
  '/icon-512.png',
];

// Installation : cache les ressources statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activation : nettoie les vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch : strategy cache-first pour les assets, network-first pour les pages
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignore les requêtes vers les API (toujours réseau)
  if (url.pathname.startsWith('/api/')) return;

  // Strategy pour les pages HTML : network-first avec fallback cache
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache la page si valide
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback offline : page cachée ou accueil
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Strategy pour les images/static : cache-first
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
});

// Notifications push
self.addEventListener('push', (event) => {
  let data = { title: 'GOAL ZONE TV', body: 'Nouvel article publié' };
  try {
    data = event.data ? event.data.json() : data;
  } catch {
    data = { title: 'GOAL ZONE TV', body: event.data?.text() || data.body };
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Lire' },
      { action: 'close', title: 'Fermer' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const targetUrl = event.notification.data?.url || '/';
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
