import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const localChromeChannel = process.env.PLAYWRIGHT_CHANNEL
  || (process.platform === 'darwin' && existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') ? 'chrome' : undefined);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND || 'npm run dev';

// Keep browser checks independent of a developer's .env.local and production
// integrations. Tests mock browser requests and use the development-only
// template fixtures; these values are intentionally non-production placeholders.
const e2eSafeEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'e2e-test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'e2e-test-service-role-key',
  STRIPE_SECRET_KEY: 'sk_test_quickweds_e2e_only',
  RESEND_API_KEY: 're_e2e_test_key',
  RESEND_FROM_EMAIL: 'QuickWeds Tests <tests@example.invalid>',
  CRON_SECRET: 'e2e-test-cron-secret-that-is-not-production',
  E2E_TEST_MODE: 'true',
};

// Tests read the same public Supabase URL when seeding a browser session, so
// make the test runner and the child dev server agree on its storage key.
Object.assign(process.env, e2eSafeEnv);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: localChromeChannel,
      },
    },
  ],
  webServer: {
    command: webServerCommand,
    env: e2eSafeEnv,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
