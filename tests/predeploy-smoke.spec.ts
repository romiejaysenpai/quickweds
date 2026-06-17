import { expect, test, type Page } from '@playwright/test';

const HYDRATION_PATTERN = /hydration|server rendered HTML|didn't match/i;

async function collectPageProblems(page: Page) {
  const problems: string[] = [];

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' || HYDRATION_PATTERN.test(text)) {
      problems.push(`${message.type()}: ${text.slice(0, 700)}`);
    }
  });

  page.on('pageerror', (error) => {
    problems.push(`pageerror: ${error.message.slice(0, 700)}`);
  });

  return problems;
}

test.describe('pre-deploy smoke', () => {
  test('public marketing, auth, and protected entry routes load', async ({ page }) => {
    const problems = await collectPageProblems(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/QuickWeds/i);
    await expect(page.getByRole('link', { name: /start/i }).first()).toBeVisible();

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();

    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();

    await page.goto('/builder', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByPlaceholder('hello@example.com')).toBeVisible();

    expect(problems).toEqual([]);
  });

  test('public wedding page hydrates and keeps guest sections available', async ({ page }) => {
    const problems = await collectPageProblems(page);

    await page.addInitScript(() => {
      window.sessionStorage.setItem('quickweds_entrance_seen_template-classic', '1');
      window.sessionStorage.setItem('quickweds_visit_template-classic', '1');
    });

    await page.route('**/api/public/guest-book**', async (route) => {
      await route.fulfill({ json: { entries: [] } });
    });

    await page.route('**/api/analytics/track', async (route) => {
      await route.fulfill({ json: { ok: true } });
    });

    await page.goto('/w/template-classic', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#details')).toBeVisible();
    await expect(page.locator('#timeline')).toBeVisible();
    await expect(page.locator('#gallery')).toBeVisible();
    await expect(page.locator('#gift')).toBeVisible();
    await expect(page.locator('#venue')).toBeVisible();
    await expect(page.locator('#entourage')).toBeVisible();
    await expect(page.locator('#rsvp')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    expect(problems).toEqual([]);
  });

  test('public API and critical static assets respond correctly', async ({ request }) => {
    const publicWedding = await request.get('/api/public/weddings/template-classic');
    expect(publicWedding.status()).toBe(200);
    await expect(publicWedding).toBeOK();

    const missingWedding = await request.get('/api/public/weddings/not-a-real-wedding');
    expect(missingWedding.status()).toBe(404);

    const manifest = await request.get('/manifest.webmanifest');
    await expect(manifest).toBeOK();

    const logo = await request.get('/logo.png');
    await expect(logo).toBeOK();
  });

  test('core public routes meet local responsiveness budget', async ({ page }) => {
    const routes = ['/', '/login', '/signup', '/w/template-classic'];

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.goto('about:blank');

      const startedAt = performance.now();
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const elapsedMs = performance.now() - startedAt;

      expect(elapsedMs, `${route} should reach DOMContentLoaded quickly`).toBeLessThan(5_000);
    }
  });
});
