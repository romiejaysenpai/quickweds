import { expect, test } from '@playwright/test';

const origin = 'https://www.quickweds.site';
const guide = '/tips/wedding-rsvp-wording';
const crawler = { 'user-agent': 'Googlebot' };

test('robots and sitemap point crawlers to canonical, indexable public pages', async ({ request }) => {
  const [robots, sitemap] = await Promise.all([
    request.get('/robots.txt'),
    request.get('/sitemap.xml'),
  ]);
  await expect(robots).toBeOK();
  await expect(sitemap).toBeOK();
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);

  const locations = Array.from((await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g), ([, url]) => url);
  expect(new Set(locations).size).toBe(locations.length);
  expect(locations).toEqual(expect.arrayContaining([
    `${origin}/`,
    `${origin}/templates`,
    `${origin}/templates/classic`,
    `${origin}/reviews`,
    `${origin}/wedding-rsvp`,
    `${origin}/wedding-planner-philippines`,
    `${origin}/tips/philippines-wedding-budget-breakdown`,
    `${origin}${guide}`,
  ]));

  for (const url of locations) {
    const canonical = new URL(url);
    expect(canonical.origin).toBe(origin);
    expect(canonical.pathname).not.toMatch(/^\/(?:w|seat|entourage|rsvp|dashboard)(?:\/|$)/);
  }

  for (const path of [
    '/',
    '/templates',
    '/templates/classic',
    '/reviews',
    '/demo',
    '/wedding-website-builder',
    '/wedding-rsvp',
    '/wedding-planner-philippines',
    '/user-guide',
    '/user-guide/seating-planner',
    '/tips/philippines-wedding-budget-breakdown',
    guide,
  ]) {
    const response = await request.get(path, { headers: crawler, maxRedirects: 0 });
    await expect(response).toBeOK();
    const html = await response.text();
    const canonicals = Array.from(html.matchAll(/<link rel="canonical" href="([^"]+)"/g), ([, url]) => new URL(url).href);
    expect(canonicals, path).toEqual([new URL(path, origin).href]);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
    expect(title, `${path} should not duplicate QuickWeds suffix`).not.toContain('| QuickWeds | QuickWeds');
    const robotsMeta = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
    expect(robotsMeta, path).not.toContain('noindex');
    expect(response.headers()['x-robots-tag'] ?? '').not.toContain('noindex');
    if (path === '/templates' || path === '/templates/classic') {
      expect(response.headers()['cache-control'] ?? '').not.toContain('immutable');
    }
  }

  const ogImage = await request.get('/opengraph-image');
  await expect(ogImage).toBeOK();
  expect(ogImage.headers()['content-type']).toContain('image/png');

  const asset = await request.get('/templates/classic.png');
  await expect(asset).toBeOK();
  expect(asset.headers()['cache-control']).toContain('immutable');
});

test('the template gallery and RSVP guide are useful without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1');
    await page.getByRole('link', { name: 'Online Wedding RSVP' }).click();
    await page.getByRole('link', { name: 'Wedding RSVP wording and deadline guide' }).click();
    await expect(page).toHaveURL(new RegExp(`${guide}$`));
    await expect(page.getByRole('heading', { level: 1, name: 'Wedding RSVP Wording: English & Tagalog Examples' })).toBeVisible();
    await expect(page.locator('blockquote[lang="tl"]')).toContainText('Kumusta po');
    await expect(page.getByRole('heading', { name: 'When should wedding RSVPs be due?' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.getByRole('link', { name: 'Browse wedding website templates' }).click();
    await expect(page).toHaveTitle(/Wedding Website Templates & Invitation Designs/);
    await expect(page.getByRole('heading', { level: 1, name: 'Wedding website templates' })).toBeVisible();
    await expect(page.locator('main article').first()).toBeVisible();
  } finally {
    await context.close();
  }
});

test('guest tools are reachable by link and send a noindex directive', async ({ request }) => {
  const [seat, proposal, rsvp, photos, builder, resetPassword, signup] = await Promise.all([
    request.get('/seat/seo-test-token', { headers: crawler }),
    request.get('/entourage/respond/seo-test-token', { headers: crawler }),
    request.get('/rsvp/manage', { headers: crawler }),
    request.get('/w/seo-test-missing-wedding/photos', { headers: crawler }),
    request.get('/builder', { headers: crawler }),
    request.get('/reset-password', { headers: crawler }),
    request.get('/signup', { headers: crawler }),
  ]);

  for (const response of [seat, proposal, builder, resetPassword]) {
    await expect(response).toBeOK();
    expect(response.headers()['x-robots-tag']).toContain('noindex');
  }
  for (const response of [rsvp, photos, signup]) {
    await expect(response).toBeOK();
    expect((await response.text()).match(/<meta name="robots" content="([^"]+)"/)?.[1]).toBe('noindex, nofollow');
  }
});
