# QuickWeds implementation plans

## Current active plan: disposable Supabase staging and RLS verification

### Goal

Create an isolated staging project, establish a reproducible schema baseline, apply the approved additive idempotency migration, and prove cross-account RLS and storage isolation without touching production.

### Current behavior

- The repository is on `codex/production-readiness-audit`; the idempotency migration is committed and pushed in draft PR #4.
- The existing QuickWeds Supabase project is production-candidate and will not be linked or changed. Its catalog metadata was read once through the authenticated Supabase connector; no application rows, storage objects, or customer data were queried or copied.
- The Supabase organization has two active projects. The user explicitly approved creating an isolated `quickweds-staging` project in `ap-southeast-2` if it is needed.
- A preview-specific Vercel environment exposes a separate public Supabase URL but does not provide usable database/service credentials, so it cannot be used for schema or RLS tests.

### Scope

- In: project provisioning, local link/configuration, read-only schema capture, controlled staging migration application, non-production test identities/data, RLS/storage/advisor checks, and migration-reconciliation documentation.
- Out: production project linkage/mutation, historical production data migration, real customer email, Stripe charges/webhooks, OAuth production settings, production deployment, and merging to `main`.

### Proposed change

1. Provision `quickweds-staging` with a generated database password, verify its distinct project reference, and link only this workspace to it.
2. Capture its initial schema and migration history; apply the ordered migrations only after a dry run and record any failure caused by the incomplete historical baseline.
3. Use non-production User A/User B and disposable weddings/RSVPs to test ownership isolation, public RSVP constraints, service-only email reservation RPCs, and existing storage policies.
4. Run Supabase security advisors, retain a reviewed staging schema dump/reconciliation record, and update source documentation with verified versus blocked components.

### Data, security, and compatibility review

- Data model/migration: apply only ordered migrations to the new empty staging database. If the incomplete baseline prevents application, stop and record the exact first dependency rather than executing root-level scripts.
- RLS/grants: reservation table enables RLS, has no `anon`/`authenticated` policies or grants, and exposes execution only to `service_role`; no browser receives a privileged credential.
- Auth/authorization: public RSVP remains intentionally server mediated. Reminder sends retain wedding-management authorization before reservation/delivery.
- Secrets/webhooks: Resend remains server-side; new reservation data stores the selected RSVP identifier, not a recipient address.
- Public-site/template compatibility: no builder, template, or published-site field is changed.
- Cache/invalidation: RSVP counters invalidate only after a successful insert.
- External effects: a new isolated staging project, test accounts, and test data will be created. No real email will be sent, and the project is not linked to Vercel production.

### Risks and rollback

- Provisioning can incur project compute cost; user explicitly authorized it only for an isolated staging project.
- Root SQL remains historically conflicting. If the ordered migration set cannot bootstrap staging, do not run root scripts wholesale; capture the exact dependency failures and build a reviewed baseline in a separate change.

### Verification

- [x] Provision and confirm an isolated staging project/ref.
- [x] Capture schema/migration state and dry-run ordered migration application.
- [x] Verify the additive idempotency migration and security advisors in an isolated staging harness.
- [ ] Build and apply a reviewed schema-only baseline, then run two-user RLS/storage tests on disposable staging.
- [x] Verify `NODE_TLS_REJECT_UNAUTHORIZED=0` is absent from Vercel production/preview/development and GitHub Actions CI configuration.

### Completion notes

- Result: partial staging verification complete. `quickweds-staging` was temporarily linked for isolated tests; production was not linked or altered.
- Staging result: `quickweds-staging` was provisioned in `ap-southeast-2`. The ordered migration bootstrap fails immediately because `public.rsvps` is missing; source tracking contains no core `weddings`/`rsvps` table creation. The additive idempotency migration itself passed disposable-harness constraint, lease, grant/RLS, and security-advisor verification. See `supabase/STAGING_RECONCILIATION.md`.
- Remaining schema/RLS gate: production catalog metadata confirms 49 public tables, 99 public RLS policies, 8 storage-object policies, 13 public functions, 4 triggers, and a nine-entry remote migration history that does not match the eight local files. `weddings` alone has 14 simultaneous policies, including broad raw-row `SELECT USING (true)` policies. A schema-only dump is still required to construct a reviewed DDL baseline; do not copy production data or execute root-level SQL as a batch. Full User A/User B application-policy and storage tests remain blocked until that baseline is applied to staging.
- Current changes: `20260815120000_add_rsvp_and_email_idempotency.sql` adds a nullable RSVP submission key with a partial unique index plus RLS-protected service-role delivery leases. RSVP, thank-you, and photo-reminder routes now use those primitives. `supabase/MIGRATIONS.md` documents the required schema-reconciliation gate.
- Checks: PASS typecheck, clean-install lint (0 errors; 590 pre-existing warnings), production build on Next 16.3.0, full template matrix (5 Playwright tests), `npm audit --omit=dev` (0 production vulnerabilities), and diff whitespace check. `npm ci` exceeded the tool's 64-second foreground limit, but installed the declared Next 16.3.0 tree used by all subsequent checks.
- Blocking verification: Docker is not installed and the ordered migration set cannot bootstrap staging without the missing core schema baseline. Database migration execution against the full application schema, two-user RLS/storage tests, real auth, Resend, Stripe, OAuth, and webhooks remain intentionally unverified.
- TLS: the unsafe setting exists only in this agent process, not the repository or user/machine environment. It is absent from all linked Vercel environment-variable scopes, repository Actions variables/secrets, and `.github/workflows/verify.yml`; TLS verification was enabled in a clean validation process.
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
