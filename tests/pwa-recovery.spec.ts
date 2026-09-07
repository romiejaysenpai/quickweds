import { expect, test } from '@playwright/test';

test('does not serve a cached Next.js bundle after a deployment', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
  });

  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload();
  }

  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  const staleBundlePath = '/_next/static/chunks/obsolete-mobile-bundle.js';
  await page.evaluate(async (path) => {
    const cache = await caches.open('quickweds-pwa-v5-runtime');
    await cache.put(path, new Response('stale-mobile-bundle', {
      status: 200,
      headers: { 'Content-Type': 'application/javascript' },
    }));
  }, staleBundlePath);

  const response = await page.evaluate(async (path) => {
    const result = await fetch(path);
    return { status: result.status, body: await result.text() };
  }, staleBundlePath);

  expect(response.status).toBe(404);
  expect(response.body).not.toContain('stale-mobile-bundle');

  await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.filter((key) => key.startsWith('quickweds-pwa-')).map((key) => caches.delete(key)));
  });
});
