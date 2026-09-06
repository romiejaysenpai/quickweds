# QuickWeds engineering loop

## Required local verification

Use Node 22 and the committed npm lockfile. Before opening a pull request, run:

```bash
npm run verify
```

This runs TypeScript checking, ESLint, the Playwright suite, and a production build in that order. It provides safe placeholder integration settings to every command and starts a fresh test server, so it overrides `.env.local` for the verification process only. `npm run test` executes the complete Playwright suite; `npm run test:smoke` is a faster public-route smoke subset.

Playwright starts its dev server with non-production placeholder credentials and `E2E_TEST_MODE=true`. The browser tests use development-only template fixtures and mock authenticated/public integrations where needed; in this mode unknown public wedding identifiers return `404` rather than querying Supabase. They must not use `.env.local`, production Supabase credentials, real Stripe keys, or Resend keys. The suite must never send email, create a charge, or write to production data.

## Safe change and bug-fix loop

1. Create a `feature/...` or `fix/...` branch from the current protected default branch.
2. Reproduce the issue and identify its root cause.
3. Add or update a focused regression test when practical, using mocks or a local/test Supabase project for anything that mutates data.
4. Implement the smallest safe fix, then run the focused test and `npm run verify`.
5. Review the complete diff for unrelated edits, secrets, debug code, weakened authorization/RLS, skipped tests, or changes that can affect existing weddings, RSVP data, guests, payments, or authentication.
6. Open a pull request. Wait for GitHub Actions, Vercel Preview, functional review, and a human approval before merging.

Do not force-push shared branches, rewrite unrelated history, reset databases, disable RLS, or apply destructive migrations as part of this workflow.

## CI and Vercel

`.github/workflows/verify.yml` runs `npm ci`, installs Chromium, and runs `npm run verify` for every pull request and pushes to `main`. It intentionally contains no production secrets.

Vercel should create a Preview deployment for each pull request. A human reviews that Preview and merges an approved pull request to `main`; the existing Vercel production deployment then runs only for that human-approved merge. Do not configure automated production promotion from other branches.

## Supabase and external-service safety

`supabase/migrations/` is the deployable history; root-level `supabase-*.sql` files are historical and must not be rerun. New migrations should be additive, preserve existing rows, explicitly verify grants/RLS, and be reviewed against a local or dedicated test project before production. CI does not run migrations or connect to Supabase.

Any integration test that needs real persistence must use a dedicated test Supabase project with separate URL, anon key, and service-role key stored as GitHub secrets. Use Stripe test-mode keys and Resend sandbox/test recipients only. Never add production Supabase service-role, Stripe secret, Resend, Vercel, or Sentry credentials to source code or Actions workflows.

## Required dashboard configuration

1. In GitHub, protect `main`: require pull requests, at least one human approval, and the **Verify / Typecheck, lint, test, and build** status check; restrict direct pushes and force pushes.
2. In Vercel, confirm the production branch is `main`, Preview deployments are enabled for pull requests, and only approved merges to `main` can reach production. Protect or limit production deployment access to maintainers.
3. In Supabase, keep production and test projects separate; never place a production service-role key in GitHub Actions. Review RLS and grants for every migration before applying it.
