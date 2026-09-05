import { test, expect, type Page } from '@playwright/test';

const fakeUser = {
  id: '22222222-2222-4222-8222-222222222222',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'builder@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'Builder Couple' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function getSupabaseStorageKey() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jioouyzzitvtlpzqqbkz.supabase.co';
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  return `sb-${projectRef}-auth-token`;
}

async function seedAuthSession(page: Page) {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  await page.addInitScript(
    ({ storageKey, user, expiresAtValue }) => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: expiresAtValue,
          user,
        }),
      );
    },
    { storageKey: getSupabaseStorageKey(), user: fakeUser, expiresAtValue: expiresAt },
  );
}

test.describe('Wedding Builder', () => {
  test('should protect the builder behind login', async ({ page }) => {
    await page.goto('/builder');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  test('should keep the protected builder login usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/builder');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByPlaceholder('hello@example.com')).toBeVisible();
  });

  test('shows and clears the branded editor loading state', async ({ page }) => {
    await seedAuthSession(page);

    let releaseWeddingLoad: (() => void) | undefined;
    const weddingLoadGate = new Promise<void>((resolve) => {
      releaseWeddingLoad = resolve;
    });

    await page.route('**/api/auth/check-admin', async (route) => {
      await route.fulfill({ json: { isAdmin: false } });
    });
    await page.route('**/rest/v1/user_app_profiles**', async (route) => {
      await route.fulfill({ json: [] });
    });
    await page.route('**/rest/v1/weddings**', async (route) => {
      await route.fulfill({ json: [] });
    });
    await page.route('**/api/planner/load**', async (route) => {
      await weddingLoadGate;
      await route.fulfill({
        json: {
          wedding: { id: 'loading-test', user_id: fakeUser.id },
          accessRole: 'owner',
        },
      });
    });

    await page.goto('/builder?edit=loading-test', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Loading your wedding design…')).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Loading your wedding design…' })).toBeVisible();

    releaseWeddingLoad?.();

    await expect(page.getByText('Loading your wedding design…')).toBeHidden();
    await expect(page.getByText(/Tell us about your special day/i)).toBeVisible();
  });
});
