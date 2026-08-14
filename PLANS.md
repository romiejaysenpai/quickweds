# QuickWeds implementation plans

## Current active plan: production-readiness audit and stabilization

### Goal

Establish an evidence-based production-readiness gate for QuickWeds: inspect every application surface, run all locally safe checks, correct reproducible low-risk defects, and document anything that needs credentials, staging data, or human approval.

### Current behavior

- The repository is currently on `codex/production-readiness-audit`, created from clean branch `codex/loopsetup`.
- Existing test, build, deployment, data, and service configuration have not yet been audited in this pass.

### Scope

- In: repository structure, dependencies, Next.js configuration, routes/server actions, Supabase migrations and RLS, storage, auth, payment, email, public site/RSVP paths, automated tests, build, static security checks, responsive/E2E coverage, and deployment configuration.
- Out: production data mutation, destructive migrations, sending real customer email, production load testing, production deployment, and merging to `main`.

### Proposed change

1. Record a clean baseline; inspect application architecture, scripts, dependency health, Next.js guidance, environment requirements, and existing test coverage.
2. Run type, lint, unit/integration, E2E, and production-build checks; investigate each failure to its root cause and apply the smallest compatible fix.
3. Audit APIs, auth, data access, RLS/migrations, storage, payments, email, and public endpoints for ownership, validation, idempotency, rate limiting, secrets, and error handling.
4. Exercise safe local critical journeys and responsive states; perform non-destructive concurrency and performance analysis.
5. Re-run relevant checks, inspect the final diff, write this plan's evidence and remaining risks, commit the verified work, and prepare a PR-ready summary without merging or deploying.

### Data, security, and compatibility review

- Data model/migration: no changes planned unless a clearly verified additive, backward-compatible defect requires one.
- RLS/grants: inspect every migration/policy and application query; do not weaken RLS or use service-role credentials in clients.
- Auth/authorization: explicitly review tenant/wedding ownership for user, collaborator, guest, token, and public access paths.
- Secrets/webhooks: scan tracked code/configuration only; secrets will never be printed. Verify Stripe/Resend/Supabase boundaries and webhook validation without invoking production services.
- Public-site/template compatibility: public rendering, publishing, RSVP, upload, and cached paths will be inspected without altering existing wedding data.
- Cache/invalidation: review configuration and public-site invalidation paths if present.
- External effects: no real emails, payments, or production data mutations; any test requiring external credentials is documented as not verified.

### Risks and rollback

- This is an intentionally broad audit; untestable external integrations and production-only controls cannot be represented as verified by local checks.
- Every code change will remain small, reversible, and isolated on this branch; no production deployment or merge is authorized.

### Verification

- [x] Inspect routes, database/RLS, external integrations, environment contracts, and existing test coverage.
- [x] Run `npm run typecheck`, `npm run lint`, focused E2E groups, `npm run build`, and `git diff --check`.
- [x] Perform safe local API/auth/public journey and responsive verification where the environment supports it.
- [x] Review final diff, dependency/security findings, performance/concurrency analysis, and deployment configuration.

### Completion notes

- Result: completed with production blockers documented; do not deploy until the database/RLS and external-service gate is completed in a safe staging environment.
- Branch/baseline: `codex/production-readiness-audit`, created from a clean `codex/loopsetup` worktree; no production data, migration, email, payment, or deployment action was performed.
- Low-risk fixes made:
  1. Removed recipient addresses, subjects, and provider IDs from shared transactional-email logs (`src/lib/email.ts`).
  2. Isolated Playwright to `127.0.0.1:3100` and made server reuse opt-in, preventing tests from silently exercising an unrelated local application (`playwright.config.ts`).
  3. Normalized proxy host handling for localhost, IPv4/IPv6 loopback, root, and subdomains to prevent false custom-domain lookups (`src/proxy.ts`).
  4. Removed an inline `<html>` scroll-behavior mutation that produced a React hydration warning (`src/app/page.tsx`).
  5. Moved the disposable-camera per-guest photo limit before global upload reservation so rejected uploads cannot consume a sharing code's quota (`src/app/api/public/photos/upload/route.ts`).
  6. Added existing distributed email throttles to collaborator invites and wedding-day photo reminders (`src/app/api/collaborators/invite/route.ts`, `src/app/api/wedding-day/send-photo-reminder/route.ts`).
- Automated checks:
  - PASS `npm run typecheck` (initial baseline and final run).
  - PASS `npm run lint` (exit 0, but 590 repository warnings; focused changed-file lint has 0 errors and 15 existing warnings).
  - PASS `npm audit --omit=dev` (0 production dependency vulnerabilities).
  - PASS `npm run build` after all changes, but the local install runs Next `16.2.10` while `package.json`/lockfile require `16.3.0`; a clean CI install is required before treating this as release evidence.
  - PASS focused Playwright: auth/routing/onboarding (13), builder/dress/monogram/mobile/navigation (14), headers/RSVP/predeploy smoke (8), disposable camera (2), and template opt-out (1): 38 assertions total.
  - NOT VERIFIED four exhaustive 25-template responsive matrix tests; the suite exceeds the local 64-second command limit. Its test file has a 120-second per-test timeout and should run in CI.
  - PASS local standalone GET-only stress harness, 15 seconds each: 10 users (10,103 requests, p95 20 ms), 50 (12,085, 94 ms), 100 (14,374, 129 ms), 500 (13,990, 903 ms), and 1,000 (16,543, 1,369 ms), all with 0 failures. These runs excluded database-backed wedding routes and all mutations.
- Audit findings and blockers:
  - CRITICAL: the repository contains 33 root-level `supabase-*.sql` setup/fix files but only 7 ordered `supabase/migrations/` files. The root scripts include conflicting broad policies such as `FOR ALL USING (true)`, historical public RSVP access, and privileged functions. The deployed schema, grants, RLS, storage policies, indexes, functions, and triggers cannot be reproduced or safely audited from source. `supabase migration list --local` could not connect because no local database is running. Do not infer production safety from the newer hardening scripts; consolidate a tested, ordered migration history and run cross-account RLS tests in staging first.
  - HIGH: public RSVP duplicate prevention is a non-atomic read-then-insert by guest name; simultaneous submissions can create duplicates unless an already-deployed database constraint prevents it. Thank-you and photo-reminder emails are sent before their dedupe log is written, so concurrent requests can send duplicate mail even if log constraints later reject one write. These require reviewed additive schema/idempotency changes and staging verification, not an untested production migration.
  - HIGH: no safe local/staging Supabase project was available, so User-A/User-B RLS isolation, real auth/OAuth/reset/session behavior, storage policy enforcement, database constraints/indexes, Stripe webhooks, Resend delivery/deduplication, cron authorization, and deployed Sentry/Vercel configuration are NOT VERIFIED.
  - HIGH: the local dependency tree is inconsistent (`next@16.2.10` installed versus `16.3.0` declared/locked). Run `npm ci` in CI or a disposable clean checkout before release.
  - HIGH: the current process environment sets `NODE_TLS_REJECT_UNAUTHORIZED=0` (not found in tracked code or `.env.local`), and both local builds warned that TLS certificate verification is disabled. Remove this from CI/Vercel/runtime environment before any deployment.
  - MEDIUM: authenticated email endpoints now have throttling, but several batch email flows remain dependent on service/database logging for true idempotency; verify their unique constraints and provider idempotency behavior in staging.
  - MEDIUM: static analysis found no tracked production secret value and `.env*` is ignored; however, a deployment secret/configuration review remains required.
- Follow-up: create a disposable staging Supabase project from a single reconciled migration history, execute two-user ownership/RLS and storage tests, add database constraints/idempotency reservations for RSVP/email flows, run the complete template matrix in CI after `npm ci`, validate real Stripe/Resend/Google OAuth/Sentry/Vercel settings, and review the TLS environment setting.

Use this file for a concise, current plan before multi-step, risky, cross-cutting, or production-facing work. It is a working document, not a changelog: replace the active plan when a task is complete. Small, isolated edits can skip it.

## When a plan is required

Create or update a plan when work affects any of the following:

- more than one route, component, library, or external service;
- Supabase schema, RLS, grants, storage, migrations, or public data exposure;
- authentication, onboarding, roles, collaborators, supplier/admin access, or account deletion;
- RSVP, guests, seating, QR/check-in, invitation tokens, public wedding pages, or wedding-day tools;
- Stripe, Resend, webhooks, cron, Cloudinary uploads, Upstash/Next cache, domains, or the Capacitor iOS shell;
- template data/rendering, a published wedding site's compatibility, or a change that could require a rollout/rollback.

## Active plan template

Copy this template for the current task and delete completed plan content before starting the next unrelated task.

```md
# <Short task title>

## Goal

<The user-visible outcome and the success condition.>

## Current behavior

<What the relevant code, database, and user flow do today. Cite paths and facts, not assumptions.>

## Scope

- In: <routes, components, APIs, libraries, migrations, tests>
- Out: <nearby work intentionally excluded>

## Proposed change

1. <Small safe implementation step>
2. <Data/API/UI/cache change and compatibility behavior>
3. <Validation or rollout step>

## Data, security, and compatibility review

- Data model/migration: none | <additive migration name and backfill plan>
- RLS/grants: <who can read/create/update/delete and why>
- Auth/authorization: <ownership, roles, public/token access>
- Secrets/webhooks: <server-only secrets, signature/idempotency/rate-limit needs>
- Public-site/template compatibility: <fallbacks for existing wedding records>
- Cache/invalidation: <affected keys/tags and invalidation path>
- External effects: <emails, payments, cron, domains, uploads, native app>

## Risks and rollback

- <Risk, mitigation, and safe rollback or feature-flag path>

## Verification

- [ ] `git diff --check`
- [ ] <targeted lint/type/build command>
- [ ] <targeted Playwright or manual desktop/mobile flow>
- [ ] <database/RLS/API/webhook verification where relevant>
- [ ] <final diff and deployment/preview review>

## Completion notes

- Result: <implemented / blocked>
- Checks run: <commands and actual result>
- Follow-up: <only remaining work or `none`>
```

## Quick planning checklist

Before implementation, answer the questions that match the task:

| Area | Questions to answer |
| --- | --- |
| Public wedding site | Does a new field belong in the public allowlist? Will older records still render? Is cache invalidation required? |
| Database | Is the change additive and ordered in `supabase/migrations/`? What are the grants and RLS effects? |
| Authorization | Can another couple, supplier, collaborator, guest, or unauthenticated visitor reach this data or action? |
| RSVP/guest/seating | Are duplicates, ownership, token scope, confirmation, notification, and check-in states preserved? |
| Payments/email | Is the action server-verified, idempotent, and correctly scoped to the wedding and recipient? |
| UI | Are mobile, desktop, loading, error, empty, long-name, and accessibility states covered? |
| Deployment | Does the change affect Vercel, cron, custom domains, cache, Cloudinary, or the Capacitor iOS wrapper? |

## Plan quality bar

A useful plan names real files and behaviors discovered in the repository, limits the change set, calls out backward compatibility, and lists checks that can actually be run. It does not invent schema, APIs, or product requirements.
