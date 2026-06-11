import { expect, test, type Page } from '@playwright/test';

const fakeUser = {
  id: '11111111-1111-4111-8111-111111111111',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'couple@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'Taylor Couple' },
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

async function mockCommonAuthenticatedRoutes(page: Page) {
  await page.route('**/api/auth/check-admin', async (route) => {
    await route.fulfill({ json: { isAdmin: false } });
  });
  await page.route('**/api/collaborators/shared', async (route) => {
    await route.fulfill({ json: { sharedWeddings: [] } });
  });
  await page.route('**/rest/v1/weddings**', async (route) => {
    await route.fulfill({ json: [] });
  });
}

test.describe('Couple onboarding', () => {
  test('redirects unauthenticated users to login with onboarding next path', async ({ page }) => {
    await page.goto('/onboarding/account-type');

    await expect(page).toHaveURL(/\/login\?next=/);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  test('couple account selection enters the guided goal sequence', async ({ page }) => {
    await seedAuthSession(page);
    await mockCommonAuthenticatedRoutes(page);

    await page.route('**/api/account/profile', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          json: {
            profile: {
              user_id: fakeUser.id,
              account_type: 'couple',
              onboarding_completed: false,
            },
          },
        });
        return;
      }

      await route.fulfill({ json: { profile: { user_id: fakeUser.id, account_type: null, onboarding_completed: false } } });
    });

    await page.goto('/onboarding/account-type');
    await page.getByRole('button', { name: /I am a couple/i }).click();

    await expect(page.getByRole('heading', { name: /What would feel best to set up first/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create our wedding site/i })).toBeVisible();
  });

  test('supplier account selection redirects to supplier dashboard', async ({ page }) => {
    await seedAuthSession(page);
    await mockCommonAuthenticatedRoutes(page);

    await page.route('**/api/account/profile', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          json: {
            profile: {
              user_id: fakeUser.id,
              account_type: 'supplier',
              onboarding_completed: false,
            },
          },
        });
        return;
      }

      await route.fulfill({ json: { profile: { user_id: fakeUser.id, account_type: null, onboarding_completed: false } } });
    });

    await page.goto('/onboarding/account-type');
    await page.getByRole('button', { name: /I am a supplier/i }).click();

    await expect(page).toHaveURL(/\/supplier\/dashboard/);
  });

  test('dashboard onboarding section can be completed and hidden', async ({ page }) => {
    await seedAuthSession(page);
    await mockCommonAuthenticatedRoutes(page);

    let onboardingCompleted = false;

    await page.route('**/api/account/profile', async (route) => {
      if (route.request().method() === 'PATCH') {
        onboardingCompleted = true;
        await route.fulfill({
          json: {
            profile: {
              user_id: fakeUser.id,
              account_type: 'couple',
              onboarding_completed: true,
            },
          },
        });
        return;
      }

      await route.fulfill({
        json: {
          profile: {
            user_id: fakeUser.id,
            account_type: 'couple',
            onboarding_completed: onboardingCompleted,
          },
        },
      });
    });

    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: /Your first QuickWeds wins/i })).toBeVisible();
    await page.getByRole('button', { name: /Complete/i }).click();
    await expect(page.getByRole('heading', { name: /Your first QuickWeds wins/i })).toBeHidden();
  });
});
