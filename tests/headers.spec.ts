import { expect, test } from '@playwright/test';

test.describe('response headers', () => {
  test('keeps public API requests same-origin by default', async ({ request }) => {
    const preflight = await request.fetch('/api/public/rsvp', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://evil.example',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });

    expect(preflight.status()).toBe(204);
    expect(preflight.headers()['access-control-allow-origin']).toBeUndefined();
    expect(preflight.headers().allow).toContain('POST');

    const publicWedding = await request.get('/api/public/weddings/no-such-wedding', {
      headers: { Origin: 'https://evil.example' },
    });

    expect(publicWedding.status()).toBe(404);
    expect(publicWedding.headers()['access-control-allow-origin']).toBeUndefined();
  });

  test('sets long-lived immutable cache headers for versioned public assets', async ({ request }) => {
    const icon = await request.get('/icons/icon-192.png');
    expect(icon.status()).toBe(200);
    expect(icon.headers()['cache-control']).toBe('public, max-age=31536000, immutable');

    const template = await request.get('/templates/classic.png');
    expect(template.status()).toBe(200);
    expect(template.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  test('keeps service worker and manifest revalidation friendly', async ({ request }) => {
    const serviceWorker = await request.get('/sw.js');
    expect(serviceWorker.status()).toBe(200);
    expect(serviceWorker.headers()['cache-control']).toContain('max-age=0');

    const manifest = await request.get('/manifest.webmanifest');
    expect(manifest.status()).toBe(200);
    expect(manifest.headers()['cache-control']).toContain('max-age=0');
  });
});
