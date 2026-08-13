# QuickWeds implementation plans

## Current active plan: audit PR #2 release readiness

### Goal

Verify PR #2 is clean, current, and ready for human approval: inspect checks and the final diff, remove the known-empty repair Vercel project, and resolve safe in-scope issues found.

### Scope

- In: PR #2 checks, branch currency, final diff, the known-empty `quickweds-loopsetup-repair` Vercel project, and focused repairs identified by the audit.
- Out: production data, migrations/RLS, real email, Stripe, production deployment, merge, and unrelated application work.

### Data, security, and compatibility review

- Data model/migration and RLS/grants: none.
- Tests use only unreachable local Supabase placeholders, Stripe test-shaped placeholders, and a non-routable email domain; E2E mode prevents unknown public wedding reads from querying Supabase.
- Existing wedding rendering remains unchanged outside `E2E_TEST_MODE=true`.

### Verification

- [x] Inspect current GitHub Actions, Vercel Preview, branch protection, and PR state.
- [x] Verify PR branch currency with `origin/main` and repair any integration issue.
- [x] Remove the known-empty repair Vercel project without touching the intended `quickweds` project.
- [x] Run focused verification, inspect final diff/secrets, and report any remaining human-only gate.

### Completion notes

- Removed the unused vulnerable `kimi` package and updated the verified Next.js toolchain to `16.3.0`; `npm audit` now reports zero vulnerabilities.
- Hardened `npm run verify` against stale `.next/dev` route declarations left by interrupted development servers.
- Adjusted standalone output for Vercel builds after Vercel's Next.js adapter reported a missing legacy trace file; Docker and local standalone output are retained.
- The branch includes the current `origin/main`, full verification passes, and the remaining PR gate is human approval; no production operation was performed.

- Result: republished for review — the branch is rebuilt from current `main`, excludes the builder change, includes focused repairs for the baseline lint failures, and supplies the Linux-only Lightning CSS and Tailwind CSS native binaries missing from the Actions runner.
- Checks run: `npm run verify` passed locally (typecheck, lint with existing warnings only, 40 Playwright tests, and production build); targeted lint and typecheck passed. The first two GitHub Actions runs failed only because Windows-created lockfile entries omitted Linux optional dependencies; a replacement run is pending after both lockfile repairs.
- Follow-up: GitHub Actions, Vercel Preview, required human approval, and no merge before merging.

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
