import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Next writes generated type declarations to .next. Start clean so a prior
// interrupted development server cannot affect type-checking or production.
rmSync('.next', { recursive: true, force: true });

// These values intentionally target no real integration. They override a
// developer's .env.local only for `npm run verify`, so verification cannot
// query or mutate production services while it typechecks, tests, or builds.
const verificationEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'e2e-test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'e2e-test-service-role-key',
  STRIPE_SECRET_KEY: 'sk_test_quickweds_e2e_only',
  RESEND_API_KEY: 're_e2e_test_key',
  RESEND_FROM_EMAIL: 'QuickWeds Tests <tests@example.invalid>',
  CRON_SECRET: 'e2e-test-cron-secret-that-is-not-production',
  E2E_TEST_MODE: 'true',
  // Do not reuse a developer server that might have loaded .env.local.
  CI: '1',
};

for (const script of ['typecheck', 'lint', 'test', 'build']) {
  // Playwright starts a Next development server that writes generated route
  // types under .next/dev. Remove that disposable output before the production
  // build so it never reads partial development-server artifacts.
  if (script === 'build') {
    rmSync('.next', { recursive: true, force: true });
  }

  const result = spawnSync(npmCommand, ['run', script], {
    stdio: 'inherit',
    env: { ...process.env, ...verificationEnv },
    shell: process.platform === 'win32',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
