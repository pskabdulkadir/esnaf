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

// Network öncelikli stratejisi - HTML/Navigasyon ve API çağrıları için
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET isteklerine yanıt ver
  if (request.method !== 'GET') {
    return;
  }

  // HTML navigasyon veya html kabul eden istekleri belirle
  const isHtml = request.mode === 'navigate' || 
                 request.url.endsWith('/') || 
                 request.url.endsWith('.html') ||
                 request.url.includes('/index.html') ||
                 (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  // API çağrıları ve HTML sayfaları için NETWORK ÖNCELİĞİ (Network-First)
  if (isHtml || request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Başarılı yanıtı cache'le
          if (response.ok && response.status === 200) {
            const cacheResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Network hatası/çevrimdışı ise cache'ten getir
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Eğer ana sayfa ise '/' veya 'index.html' cache'i dönmeye çalış
            if (isHtml) {
              return caches.match('/') || caches.match('/index.html');
            }
          });
        })
    );
    return;
  }

  // Diğer statik dosyalar (JS, CSS, Görseller vb.) için CACHE ÖNCELİĞİ (Cache-First)
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
