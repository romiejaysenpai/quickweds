# QuickWeds implementation plans

## Current active plan: reconcile the engineering loop with updated main

### Goal

Reconcile PR #2 with the updated `main` branch, retain the newer root guidance, exclude the unrelated builder change, and verify the engineering loop before republishing the PR branch.

### Scope

- In: the engineering-loop scripts, Playwright isolation, CI, documentation, focused regression tests, root planning guidance, conflict resolution, branch update, and PR.
- Out: the pre-existing `src/components/BuilderForm.tsx` edit; production data, migrations/RLS, real email, Stripe, deployment, and merge.

### Data, security, and compatibility review

- Data model/migration and RLS/grants: none.
- Tests use only unreachable local Supabase placeholders, Stripe test-shaped placeholders, and a non-routable email domain; E2E mode prevents unknown public wedding reads from querying Supabase.
- Existing wedding rendering remains unchanged outside `E2E_TEST_MODE=true`.

### Verification

- [x] Retain `main`'s newer `AGENTS.md` and the restored non-empty `PLANS.md`.
- [x] Exclude the unrelated `src/components/BuilderForm.tsx` commit from the rebuilt PR branch.
- [x] Run `npm run verify` and repair failures found in the updated `main` baseline.
- [x] Review the final diff, secrets, migration scope, and excluded BuilderForm change.
- [x] Force-update only `codex/loopsetup` with the conflict-free engineering-loop commits; do not merge or deploy.
- [x] Diagnose the first GitHub Actions failure and add the pinned Linux-only CSS binary required by the Ubuntu runner.
- [ ] Confirm the replacement GitHub Actions run passes, then require it plus one human approval for `main`.

### Completion notes

- Result: republished for review — the branch is rebuilt from current `main`, excludes the builder change, includes focused repairs for the baseline lint failures, and supplies the Linux-only CSS binary missing from the first Actions run.
- Checks run: `npm run verify` passed locally (typecheck, lint with existing warnings only, 40 Playwright tests, and production build); targeted lint and typecheck passed. The first GitHub Actions run failed only because its Linux optional dependency was absent; a replacement run is pending after the lockfile repair.
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
