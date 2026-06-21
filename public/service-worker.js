const CACHE_NAME = 'akn-global-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Cache dosyaları kurulumu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Eski cache'i temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network öncelikli stratejisi - API çağrıları için
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET isteklerine yanıt ver
  if (request.method !== 'GET') {
    return;
  }

  // API çağrıları için network önceliği
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Başarılı yanıtı cache'le
          if (response.ok) {
            const cacheResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Network hatası varsa cache'ten getir
          return caches.match(request);
        })
    );
    return;
  }

  // Statik dosyalar için cache önceliği
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((response) => {
        if (response.ok && response.status === 200) {
          const cacheResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheResponse);
          });
        }
        return response;
      });
    })
  );
});

// Background Sync (opsiyonel - gelecekte offline işlemler için)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      fetch('/api/sync')
        .then((response) => response.json())
        .catch(() => {
          console.log('Sync başarısız oldu, daha sonra denenir');
        })
    );
  }
});
