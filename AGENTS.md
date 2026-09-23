# QuickWeds engineering guide

## Product and operating principle

QuickWeds is a production wedding website and wedding-planning platform. Couples build and publish wedding sites, manage RSVP and guest data, plan their wedding, and use wedding-day tools. Suppliers, collaborators, guests, and administrators have distinct access paths.

Protect user data and published wedding sites first. Prefer the smallest backward-compatible change that solves the request. A change is complete only after the requested behavior, appropriate checks, and a focused diff review are complete.

## Repository map

| Area | Location | Notes |
| --- | --- | --- |
| Application routes | `src/app/` | Next.js App Router pages, layouts, route handlers, and server actions. |
| Legacy API endpoints | `src/pages/api/` | Still active for RSVP notifications, cron, and debugging helpers; do not remove or migrate casually. |
| Browser auth/data client | `src/lib/supabase.ts` | Uses the public Supabase anon key only. |
| Privileged server data client | `src/lib/supabase-admin.ts` | Service-role client; import and execute only on the server. |
| Public wedding delivery | `src/lib/public-wedding.ts`, `src/lib/public-wedding-lookup.ts` | Field allowlist, slug/ID lookup, caching, and compatibility fallbacks. |
| UI | `src/components/`, `src/components/templates/`, `src/components/wedding/` | Shared UI, template renderers, and public wedding sections. |
| Domain logic | `src/lib/` | Validation, rate limits, Stripe, email, planner, guest, supplier, and cache helpers. |
| Database history | `supabase/migrations/` | Ordered deployable schema history and source of truth. See `supabase/MIGRATIONS.md`. |
| Historical SQL | root `supabase-*.sql` | Recovery/audit material; do not rerun against production. |
| End-to-end tests | `tests/` | Playwright coverage for auth, onboarding, builder, templates, and public-site features. |
| Native shell | `ios/`, `capacitor.config.ts` | Capacitor iOS shell loads `https://quickweds.site`; web changes can affect the app. |

## Current stack and conventions

- Next.js 16 App Router, React 19, TypeScript (strict mode), Tailwind CSS 4, and Framer Motion.
- Supabase provides PostgreSQL, Auth, Storage, and Row Level Security (RLS).
- Resend sends transactional email; Stripe handles checkout and webhooks.
- Cloudinary stores media; Upstash Redis supports cache and rate-limit features.
- OpenAI is used for product AI features; Sentry, Vercel Analytics, and Speed Insights provide observability.
- The `@/` alias maps to `src/`.
- `next.config.ts` uses standalone output. The production build is `npm run build` and includes `scripts/prepare-standalone.mjs`.

Before adding a dependency, confirm the existing stack cannot meet the need. Keep module boundaries and established route patterns intact.

## Required workflow

For meaningful code, database, configuration, or infrastructure work:

1. Inspect `git status -sb`, current branch, related routes/components, dependent libraries, relevant migrations, and existing tests before editing.
2. Write a short plan using `PLANS.md` for multi-step, risky, or cross-cutting work. State the goal, current behavior, proposed change, risks, and verification.
3. Implement the smallest focused change. Do not refactor unrelated code or overwrite user work.
4. Run the checks that exercise the changed path. Investigate and fix failures caused by the change; distinguish pre-existing failures clearly.
5. Review `git diff --check` and the final diff for scope, regressions, secrets, and user-data impact.
6. Report completed work, files changed, checks actually run, database/RLS impact, and any remaining risks.

Use a feature branch for changes. Never commit unrelated work, force-push shared branches, or deploy/promote production without explicit approval.

## Routing and data boundaries

- Prefer server route handlers in `src/app/api/**/route.ts` for new HTTP APIs. Keep `src/pages/api` endpoints compatible while they remain in use.
- Treat all client-provided identifiers, form fields, webhook payloads, and public tokens as untrusted. Validate with the existing helpers in `src/lib/validations.ts` and domain-specific helpers where applicable.
- Browser code must use the anon-key client and RLS-protected access. Do not import `getSupabaseAdminClient`, `server-only` modules, service-role keys, or other secrets into a client component.
- Verify authorization, not only authentication: users must not access another wedding's planner, guest, supplier, collaborator, or admin data.
- Public data must be explicitly allowlisted. Extend `PUBLIC_WEDDING_FIELDS` only after reviewing every field for guest-safe disclosure.
- Public wedding reads are cached through Next cache and Redis. After changing published wedding data, use the existing invalidation path (`invalidateWeddingPublicCache`) so `/w/[id]` and public APIs do not remain stale.
- Preserve public-wedding compatibility fallbacks for older schema states unless the related migration has been safely deployed everywhere.

## Supabase and migrations

Before changing database behavior, inspect the affected schema, migration history, application queries, foreign keys, indexes, triggers/functions, grants, and RLS policies.

- Add new migrations under `supabase/migrations/` with a sortable timestamp prefix. Do not edit deployed migration files.
- Prefer additive, idempotent changes (`if exists` / `if not exists` where appropriate), safe defaults, and explicit backfills that preserve existing rows.
- Do not reset, truncate, drop production data, disable RLS, or use the service role in browser code.
- Treat root-level `supabase-*.sql` files as historical artifacts, not the migration source of truth.
- For any data-access change, answer: who can select, insert, update, and delete; can an owner cross wedding boundaries; and what can guests or unauthenticated users access?
- Public RSVP, guest-book, photo, seat-finder, check-in, and invitation-token flows need extra scrutiny for rate limits, token scope, duplicate handling, and unintended disclosure.

## Critical feature safeguards

### Auth and roles

Preserve Supabase session behavior, protected-route handling, onboarding, password reset, and role boundaries for couples, suppliers, collaborators, guests, and admins. Existing users must not be routed through first-time onboarding, and invalid sessions must not create redirect loops.

### Wedding websites and builder

Published sites, templates, and stored wedding settings are product contracts. New fields must have sensible fallback values; existing weddings must not require rebuilding. Verify the public site and builder on desktop and mobile, including long names, missing media, RSVP states, and old records.

### RSVP, guests, seating, and wedding day

Never delete or rewrite RSVP/guest records to troubleshoot. Protect duplicate submission behavior, wedding ownership, check-in integrity, QR/seat-token scope, confirmations, notifications, and dashboard visibility.

### Payments, email, and webhooks

Stripe status must come from trusted server-side verification. Validate webhook signatures, retain idempotency/duplicate protection, and never expose secret keys. Email changes must verify recipient, wedding context, template variables, server-only execution, and duplicate-send prevention. Never send test email to real users without explicit approval.

### Media, cache, and scheduled work

Use existing Cloudinary/upload helpers and avoid exposing private upload credentials. Review cache invalidation whenever changing public output. Cron endpoints must authenticate with the existing secret and be safe to retry.

## UI, reliability, and observability

- Keep pages mobile-first and test relevant phone and desktop states. Include loading, empty, error, and long-content states; maintain accessible labels, keyboard operation, focus, contrast, and touch targets.
- Use existing error-handling and Sentry patterns. Give users safe messages, preserve useful developer context, and never log secrets or sensitive wedding/guest data unnecessarily.
- Avoid unbounded data queries, duplicate network calls, excessive client components, and unnecessary large media. Do not add caching without defining invalidation.

## Verification commands

Choose the smallest meaningful set, then expand for high-risk or cross-cutting work:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx playwright test tests/<relevant>.spec.ts
npm run test:smoke
npm run test:predeploy
git diff --check
```

`npm run test:predeploy` runs lint, the production build, smoke tests, and the stress suite with a server. It is appropriate only when its required services/configuration are available. For documentation-only work, validate Markdown content, `git diff --check`, and the focused diff; do not claim runtime checks were run.

## Completion report

For substantial work, report:

```text
Completed: <outcome>
Changed: <key files/components>
Verification: PASS/FAIL/NOT RUN — <commands and results actually observed>
Database impact: none | migration added | RLS/grants changed | data migration required
Risks / follow-up: <only meaningful remaining items>
```

When verification is blocked, state the exact blocker and what was not run. Do not represent a check as passing unless it was executed or directly inspected.
