const CACHE_VERSION = 'quickweds-pwa-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/templates/classic.png',
  '/templates/boho.png',
  '/templates/minimal.png',
];

const DENYLIST_PREFIXES = [
  '/api/',
  '/auth/callback',
  '/payment/',
  '/_vercel/',
];

function isDeniedRequest(url, request) {
  if (request.method !== 'GET') return true;
  if (DENYLIST_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return true;
  if (url.hostname.includes('supabase.co')) return true;
  if (url.hostname.includes('stripe.com')) return true;
  return false;
}

function isStaticAsset(url, request) {
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (url.pathname.startsWith('/icons/')) return true;
  if (url.pathname.startsWith('/templates/')) return true;
  if (url.pathname.startsWith('/textures/')) return true;
  if (request.destination === 'font' || request.destination === 'style' || request.destination === 'script') return true;
  return false;
}

function isImageRequest(url, request) {
  return request.destination === 'image' || /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i.test(url.pathname);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await network) || caches.match('/offline');
}

async function networkFirstAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || caches.match('/offline');
  }
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || caches.match('/offline');
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('quickweds-pwa-') && !key.startsWith(CACHE_VERSION))
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (isDeniedRequest(url, request)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(networkFirstAsset(request));
    return;
  }

  if (isStaticAsset(url, request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isImageRequest(url, request)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'QuickWeds',
    body: 'You have a new QuickWeds update.',
    url: '/dashboard',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/maskable-192.png',
      data: { url: payload.url || '/dashboard' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
