import { expect, test, type Page } from '@playwright/test';
import { createRsvpEmbedCode, getRsvpEmbedPlatform } from '../src/lib/rsvp-embed';

const fakeUser = {
  id: '33333333-3333-4333-8333-333333333333',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'embed@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'Embed Couple' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

async function seedAuthSession(page: Page) {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  await page.addInitScript(
    ({ user, expiresAtValue }) => {
      const sessionData = JSON.stringify({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: expiresAtValue,
        user,
      });
      window.localStorage.setItem('sb-jioouyzzitvtlpzqqbkz-auth-token', sessionData);
      window.localStorage.setItem('sb-127-auth-token', sessionData);
      window.localStorage.setItem('supabase.auth.token', sessionData);
    },
    { user: fakeUser, expiresAtValue: expiresAt },
  );
}

async function mockAuthenticatedShell(page: Page) {
  await page.route('**/api/auth/check-admin', async (route) => route.fulfill({ json: { isAdmin: false } }));
  await page.route('**/api/collaborators/shared', async (route) => route.fulfill({ json: { sharedWeddings: [] } }));
  await page.route('**/rest/v1/weddings**', async (route) => route.fulfill({ json: [] }));
}

test.describe('public RSVP embed', () => {
  test('renders the reusable RSVP form without the full wedding website', async ({ page }) => {
    const response = await page.goto('/embed/rsvp/template-classic');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /Amelia Rose.*Mateo James/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /RSVP for our Special Day/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Enter your full name/i)).toBeVisible();
    await expect(page.getByText(/Our Story/i)).toHaveCount(0);
  });

  test('reports its content height for automatic iframe resizing', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { quickWedsResizeHeights?: number[] }).quickWedsResizeHeights = [];
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'quickweds:rsvp-resize') {
          (window as Window & { quickWedsResizeHeights?: number[] }).quickWedsResizeHeights?.push(event.data.height);
        }
      });
    });

    await page.goto('/embed/rsvp/template-classic');

    const readLatestHeight = () => page.evaluate(() => {
      const heights = (window as Window & { quickWedsResizeHeights?: number[] }).quickWedsResizeHeights || [];
      return heights.at(-1) || 0;
    });

    await expect.poll(readLatestHeight).toBeGreaterThan(360);
    const initialHeight = await readLatestHeight();

    await page.locator('input[type="number"]').first().fill('2');
    await expect.poll(readLatestHeight).toBeGreaterThan(initialHeight);
  });

  test('allows framing only on the embed route', async ({ request }) => {
    const response = await request.get('/embed/rsvp/template-classic');
    const csp = response.headers()['content-security-policy'] || '';

    expect(csp).toContain('frame-ancestors https:');
    expect(response.headers()['x-frame-options']).toBeUndefined();
  });
});

test.describe('RSVP embed installation guidance', () => {
  test('recommends a universal link for restricted builders and an embed for HTML builders', () => {
    expect(getRsvpEmbedPlatform('canva')?.recommendedMethod).toBe('link');
    expect(getRsvpEmbedPlatform('wordpress')?.recommendedMethod).toBe('embed');
    expect(getRsvpEmbedPlatform('unknown')).toBeNull();
  });

  test('generates a responsive embed with a fixed-height fallback and origin validation', () => {
    const code = createRsvpEmbedCode('https://quickweds.example/embed/rsvp/wedding-123', 'wedding-123');

    expect(code).toContain('height="1400"');
    expect(code).toContain('event.origin!=="https://quickweds.example"');
    expect(code).toContain('quickweds:rsvp-resize');
  });
});

test.describe('Embed & Share setup', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthSession(page);
    await mockAuthenticatedShell(page);
  });

  test('guides an owner from platform selection to activation', async ({ page }) => {
    let savedBody: Record<string, unknown> | null = null;
    let active = false;

    await page.route('**/api/weddings/wedding-123/rsvp-embed', async (route) => {
      if (route.request().method() === 'PATCH') {
        savedBody = JSON.parse(route.request().postData() || '{}');
        active = savedBody?.rsvp_embed_enabled === true;
        await route.fulfill({
          json: {
            canEdit: true,
            wedding: {
              id: 'wedding-123',
              public_slug: 'alex-and-sam',
              bride_name: 'Alex',
              groom_name: 'Sam',
              website_mode: 'external',
              external_platform: savedBody?.external_platform,
              external_website_url: savedBody?.external_website_url || null,
              rsvp_embed_enabled: active,
            },
          },
        });
        return;
      }

      await route.fulfill({
        json: {
          canEdit: true,
          wedding: {
            id: 'wedding-123',
            public_slug: 'alex-and-sam',
            bride_name: 'Alex',
            groom_name: 'Sam',
            website_mode: 'quickweds',
            external_platform: null,
            external_website_url: null,
            rsvp_embed_enabled: false,
          },
        },
      });
    });

    await page.goto('/dashboard/wedding-123/rsvp-embed');

    await expect(page.getByRole('heading', { name: 'Connect your existing website' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add the RSVP form' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Activate and test' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Activate RSVP form' })).toBeDisabled();

    await page.getByLabel('Website platform').selectOption('canva');
    await expect(page.getByText('Recommended for Canva')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy RSVP link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Activate RSVP form' })).toBeEnabled();

    await page.getByRole('button', { name: 'Activate RSVP form' }).click();

    await expect(page.getByText('RSVP form is live', { exact: true })).toBeVisible();
    expect(savedBody).toMatchObject({
      external_platform: 'canva',
      external_website_url: '',
      rsvp_embed_enabled: true,
    });
    expect(savedBody).not.toHaveProperty('website_mode');
  });

  test('keeps coordinator access view-only while allowing installation details to be copied', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.route('**/api/weddings/wedding-456/rsvp-embed', async (route) => {
      await route.fulfill({
        json: {
          canEdit: false,
          wedding: {
            id: 'wedding-456',
            public_slug: 'jamie-and-riley',
            bride_name: 'Jamie',
            groom_name: 'Riley',
            website_mode: 'external',
            external_platform: 'wordpress',
            external_website_url: 'https://example.com/rsvp',
            rsvp_embed_enabled: true,
          },
        },
      });
    });

    await page.goto('/dashboard/wedding-456/rsvp-embed');

    await expect(page.getByText(/only the wedding owner or partner can change them/i)).toBeVisible();
    await expect(page.getByLabel('Website platform')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Copy RSVP embed' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Pause RSVP form' })).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
