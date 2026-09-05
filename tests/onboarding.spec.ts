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
    ({ user, expiresAtValue }) => {
      window.localStorage.removeItem('quickweds_onboarding_survey_draft_v1');
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

test.describe('Couple onboarding survey', () => {
  test('redirects unauthenticated users to login with onboarding next path', async ({ page }) => {
    await page.goto('/onboarding/account-type');

    await expect(page).toHaveURL(/\/login\?next=/);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  test('shows and clears the branded loading state while account data is pending', async ({ page }) => {
    await seedAuthSession(page);
    await mockCommonAuthenticatedRoutes(page);

    let releaseProfile: (() => void) | undefined;
    const profileGate = new Promise<void>((resolve) => {
      releaseProfile = resolve;
    });

    await page.route('**/api/account/profile', async (route) => {
      await profileGate;
      await route.fulfill({ json: { profile: { user_id: fakeUser.id, account_type: null, onboarding_completed: false } } });
    });

    await page.goto('/onboarding/account-type', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Loading your account…')).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Loading your account…' })).toBeVisible();

    releaseProfile?.();

    await expect(page.getByText('Loading your account…')).toBeHidden({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /I am a Couple/i })).toBeVisible({ timeout: 10000 });
  });

  test('couple account selection enters 3-step survey and completes successfully', async ({ page }) => {
    await seedAuthSession(page);
    await mockCommonAuthenticatedRoutes(page);

    let savedSurveyData: any = null;

    await page.route('**/api/account/profile', async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = JSON.parse(route.request().postData() || '{}');
        savedSurveyData = body;
        await route.fulfill({
          json: {
            profile: {
              user_id: fakeUser.id,
              account_type: 'couple',
              onboarding_completed: body.onboarding_completed ?? false,
              ...body,
            },
          },
        });
        return;
      }

      await route.fulfill({ json: { profile: { user_id: fakeUser.id, account_type: null, onboarding_completed: false } } });
    });

    await page.goto('/onboarding/account-type');
    await page.getByRole('button', { name: /I am a Couple/i }).click();

    // Step 1: Your Wedding
    await expect(page.getByRole('heading', { name: /Tell us about your wedding/i })).toBeVisible();
    await expect(page.getByText(/Step 1 of 3/i)).toBeVisible();
    
    // Select not decided yet
    await page.getByRole('button', { name: /Not Decided/i }).click();
    // Select guest count
    await page.getByRole('button', { name: /101–200/i }).click();
    
    // Move to Step 2
    await page.getByRole('button', { name: /Next: Planning Journey/i }).click();

    // Step 2: Planning Journey
    await expect(page.getByRole('heading', { name: /Your Planning Journey/i })).toBeVisible();
    await expect(page.getByText(/Step 2 of 3/i)).toBeVisible();
    
    // Select stage
    await page.getByRole('button', { name: /Planning already/i }).click();
    // Select primary needs
    await page.getByRole('button', { name: /Seating arrangement/i }).click();

    // Move to Step 3
    await page.getByRole('button', { name: /Next: About You/i }).click();

    // Step 3: About You
    await expect(page.getByRole('heading', { name: /Almost done! Tell us about you/i })).toBeVisible();
    await expect(page.getByText(/Step 3 of 3/i)).toBeVisible();

    // Select role and source
    await page.getByRole('button', { name: /Bride/i }).click();
    await page.getByRole('button', { name: /Instagram/i }).click();

    // Complete survey
    await page.getByRole('button', { name: /Complete Setup/i }).click();

    // Celebration / Ready screen
    await expect(page.getByRole('heading', { name: /Your QuickWeds space is ready/i })).toBeVisible();
    expect(savedSurveyData?.onboarding_completed).toBe(true);
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
    await page.getByRole('button', { name: /I am a Wedding Supplier/i }).click();

    await expect(page).toHaveURL(/\/supplier\/dashboard/);
  });

  test('dashboard shows personalized recommendations and handles checklist', async ({ page }) => {
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
              planning_stage: 'Planning already',
              primary_needs: ['Seating arrangement', 'Budget tracking'],
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
            planning_stage: 'Planning already',
            primary_needs: ['Seating arrangement', 'Budget tracking'],
          },
        },
      });
    });

    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: /Recommended Next Steps/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Your first QuickWeds wins/i })).toBeVisible();
    await page.getByRole('button', { name: /Complete/i }).click();
    await expect(page.getByRole('heading', { name: /Your first QuickWeds wins/i })).toBeHidden();
  });
});
