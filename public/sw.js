const CACHE_VERSION = 'quickweds-pwa-v5';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const MAX_RUNTIME_ENTRIES = 120;

const PRECACHE_URLS = [
  '/offline',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/maskable-192.png',
];

const DENYLIST_PREFIXES = [
  '/api/',
  '/auth/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/onboarding',
  '/payment/',
  '/dashboard',
  '/admin',
  '/builder',
  '/planner',
  '/settings',
  '/profile',
  '/supplier/',
  '/rsvp/manage',
  '/seat/',
  '/entourage/',
  '/_vercel/',
];

function isDeniedRequest(url, request) {
  if (request.method !== 'GET') return true;
  if (url.origin !== self.location.origin) return true;
  if (DENYLIST_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return true;
  return false;
}

function isCacheablePublicPage(url) {
  const path = url.pathname;
  if (path === '/' || path === '/offline' || path === '/templates' || path === '/reviews' || path === '/tips') {
    return true;
  }
  if (path.startsWith('/w/') && !path.includes('/photos')) {
    return true;
  }
  return false;
}

function isStaticAsset(url, request) {
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (url.pathname.startsWith('/icons/')) return true;
  if (url.pathname.startsWith('/templates/previews/') || url.pathname.startsWith('/templates/elements/')) return true;
  if (url.pathname.startsWith('/textures/')) return true;
  if (request.destination === 'font') return true;
  return false;
}

function isImageRequest(url, request) {
  return request.destination === 'image' || /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i.test(url.pathname);
}

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
    }
  } catch {
    // Ignore storage trim errors
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const cacheControl = response.headers.get('cache-control') || '';
        if (!cacheControl.includes('no-store') && !cacheControl.includes('private')) {
          cache.put(request, response.clone()).then(() => trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES)).catch(() => {});
        }
      }
      return response;
    })
    .catch(() => null);

  // Never return /offline HTML for non-navigation assets (scripts, styles, images).
  return cached || (await network) || Response.error();
}

async function networkFirstPage(request, url) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok && isCacheablePublicPage(url)) {
      const cacheControl = response.headers.get('cache-control') || '';
      if (!cacheControl.includes('no-store') && !cacheControl.includes('private')) {
        cache.put(request, response.clone()).catch(() => {});
      }
    }
    return response;
  } catch {
    if (isCacheablePublicPage(url)) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    return caches.match('/offline') || Response.error();
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
    event.respondWith(networkFirstPage(request, url));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidate(request));
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
  const rawUrl = event.notification.data?.url || '/dashboard';
  let targetUrl = '/dashboard';
  try {
    const resolved = new URL(rawUrl, self.location.origin);
    if (resolved.origin === self.location.origin) {
      targetUrl = resolved.href;
    }
  } catch {
    targetUrl = '/dashboard';
  }

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
