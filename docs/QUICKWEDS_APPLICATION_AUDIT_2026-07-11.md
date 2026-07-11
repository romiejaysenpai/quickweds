# QuickWeds full application audit

Audit date: 11 July 2026  
Final verification: 12 July 2026  
Repository: `quickweds`  
Audit basis: local source, production build, TypeScript, ESLint, Playwright smoke tests, local browser testing at desktop and mobile sizes, and read-only inspection of the connected Supabase project.

## Executive summary

QuickWeds has a broad, coherent wedding-planning product and its production build and existing smoke tests pass. The public landing page and all 19 template families represented by live sample data rendered without horizontal overflow or browser console errors at the tested desktop and mobile sizes. Authentication is consistently enforced on most app routes, and public wedding data is normally served through a deliberately restricted server endpoint.

The baseline audit nevertheless found several release-blocking risks. Anonymous database clients could select all RSVP rows and all wedding rows, public guest-book reads/writes bypassed the server route, settings rendered to signed-out visitors, password recovery pointed to a missing route, the reminder cron failed open without its secret, and the thank-you manager labeled records as sent without invoking delivery. Public slug pages also returned generic social metadata. The RSVP/guest-book exposure and these application defects were fixed and verified during this audit; unrestricted complete wedding-row reads remain the highest unresolved risk and require a separately staged analytics/public-read migration.

The safest immediate work is a narrow policy migration plus localized application fixes. A broad schema or architecture rewrite is not justified. The existing `supabase-production-hardening.sql` must not be applied wholesale: its storage path assumptions do not match every current upload flow.

## Scope and evidence

### Reviewed architecture

- Next.js 16 App Router application with React 19 and TypeScript.
- Supabase Auth, Postgres, Row Level Security, Storage, and Realtime usage.
- Stripe subscription and payment routes.
- Resend email delivery, Cloudinary support, Google Calendar integration, Sentry, and Capacitor/iOS packaging.
- 67 application routes in the production build, approximately 40 API route groups, 48 live public-schema tables, and 25 public wedding template components.
- Landing, authentication, onboarding, dashboard, builder, RSVP, guests, email automation, seating, budget, checklist, suppliers/vendors, collaborators, day mode, QR, photos, thank-you, settings, account/subscription, and public-template code paths.

### Checks completed before changes

| Check | Result | Notes |
| --- | --- | --- |
| `npx tsc --noEmit` | Pass | No TypeScript errors. |
| `npm run build` | Pass | All 67 routes compiled. The route manifest confirmed `/reset-password` was absent. |
| `npx playwright test` | Pass, 4/4 | Existing coverage is limited to auth visibility and builder protection on desktop/mobile. |
| `npm run lint` | Fail | 523 findings: 4 `prefer-const` errors and 519 warnings, mostly explicit `any`, unused symbols, raw images, and missing image alternatives. |
| `npm audit --omit=dev` | Fail | 37 production dependency findings: 5 high, 28 moderate, 4 low. Next.js 16.2.3 was inside multiple affected ranges. |
| Desktop browser smoke test | Partial pass | Landing, auth pages, public wedding pages, and signed-out route behavior tested. |
| Mobile browser smoke test | Partial pass | Landing and all live template families checked at 375 × 812; no horizontal overflow was found. |
| Connected Supabase security review | Fail | Anonymous data exposure and permissive policies confirmed by live policy inspection and anonymous-role counts. |

### Testing limitations

- No dedicated test couple, guest, collaborator, supplier, Stripe test subscription, mailbox, or production-safe upload fixture was supplied. Authenticated mutation flows were therefore audited from source and route contracts, but were not allowed to change real customer data.
- Email delivery, password email receipt, magic-link receipt, QR camera scanning, payment checkout/webhooks, calendar OAuth, Cloudinary uploads, and native iOS behavior were not exercised against external services.
- Nineteen template families had live public samples. Art Deco, Boho, Urban, Vogue, Film, and Glitch were reviewed statically because no live sample existed.
- A successful build proves compile-time integrity, not production environment completeness. Local environment presence checks cannot establish which secrets are configured in Vercel.

## Issues by priority

The evidence below records the baseline finding. Implementation status is called out in the heading and is supported by the final verification section.

### Critical

#### C-1 — Anonymous clients can read all RSVP rows — fixed and verified

- Evidence: live `public.rsvps` policy `anyone_can_view_rsvps` grants `SELECT` to `public` with `USING (true)`. An anonymous-role count returned 62 visible rows.
- User impact: names, contact details, attendance, dietary needs, messages, and other guest information can be enumerated through the Data API.
- Cause: a permissive public policy remains alongside owner/collaborator policies even though public RSVP operations already use server routes.
- Affected: Supabase `public.rsvps`; public RSVP privacy; guest management.
- Safe action: remove only the unconditional select policy. Preserve owner/collaborator access and public server APIs.

#### C-2 — Anonymous clients can read complete wedding rows

- Evidence: three live select policies allow anonymous/authenticated/public reads with `USING (true)`. An anonymous-role count returned 119 visible rows.
- User impact: the table includes public presentation data but also private/account-oriented columns such as couple email, bank/account gift details, planner/seat tokens, custom-domain state, and payment identifiers.
- Cause: the table is used as both a public page model and an application record, while RLS exposes the entire row rather than a restricted view or server response.
- Affected: Supabase `public.weddings`, analytics route, public pages, dashboard queries.
- Safe action: first move every legitimate public/server lookup to a field-whitelisted server client or restricted view; then remove unconditional table policies in a separately verified migration. Do not drop the policies before the analytics route is migrated, because its current POST path uses the anonymous client to verify a wedding.

### High

#### H-1 — Password recovery ends on a missing route — fixed and verified

- Evidence: `src/app/forgot-password/page.tsx` redirects recovery emails to `/reset-password`; the production route manifest and browser both returned a 404 for that path.
- Impact: users cannot complete password recovery.
- Cause: recovery request UI was implemented without the session-to-password completion screen.
- Affected: forgot password, login recovery, Supabase Auth session handling.

#### H-2 — Settings page is not guarded at page entry — fixed and verified

- Evidence: a signed-out browser remained on `/settings` and rendered account update/delete controls after authentication loading completed.
- Impact: misleading and potentially unsafe UI exposure; individual actions may still fail, but route protection is inconsistent with the rest of the app.
- Cause: the client page consumes `user` but does not redirect when authentication resolves to no user.
- Affected: `src/app/settings/page.tsx`.

#### H-3 — Event reminder cron fails open when `CRON_SECRET` is missing — fixed and verified

- Evidence: authorization is checked only inside `if (process.env.CRON_SECRET)`. The local environment does not define the secret.
- Impact: an unauthenticated caller could trigger production reminder processing and real email sends in any similarly misconfigured environment.
- Cause: optional-secret authorization pattern on a side-effecting endpoint.
- Affected: `src/app/api/planner/event-reminders/route.ts`, deployment environment contract.

#### H-4 — Thank-you UI reports “sent” without sending — fixed and verified for new sends

- Evidence: `ThankYouNoteManager` inserts a row with `status: 'sent'`; it never calls the existing `/api/weddings/thank-you/send` delivery route. No other caller of that route was found.
- Impact: couples receive false success feedback and guests receive no message.
- Cause: UI persistence and delivery implementation were built as disconnected paths.
- Affected: `src/components/dashboard/ThankYouNoteManager.tsx`, `src/app/api/weddings/thank-you/send/route.ts`.

#### H-5 — Public guest-book policies bypass server safeguards — fixed and verified

- Evidence: live policies `Enable insert for all` and `Enable read access for all` use unconditional expressions. An anonymous-role count returned 20 readable entries.
- Impact: database clients can bypass route validation, moderation expectations, and rate limiting; private or pending content may be enumerated.
- Cause: legacy direct-client access remains after server API adoption.
- Affected: Supabase `public.guest_book`, guest book API and public template section.

#### H-6 — Email HTML does not consistently escape user-controlled content — fixed and verified

- Evidence: RSVP confirmation, couple notification, reminder, and welcome templates interpolate names, messages, dietary notes, song requests, venue strings, and some URLs directly. Later thank-you/collaborator templates do use `escapeHtml`, demonstrating inconsistent handling.
- Impact: malformed or deceptive HTML can be placed in delivered email; the couple-notification template is especially exposed to guest-supplied text.
- Cause: templating evolved without a single escaped-value boundary.
- Affected: `src/lib/email-templates.ts`, RSVP and reminder delivery routes.

#### H-7 — Database migration history is materially incomplete

- Evidence: the connected production project reports only two tracked migrations despite 48 public tables and numerous standalone SQL files in the repository.
- Impact: environments cannot be reproduced or rolled back reliably, and policy drift is difficult to review.
- Cause: production changes were applied outside the repository migration chain.
- Affected: `supabase/migrations`, root `supabase-*.sql` files, production change management.

#### H-8 — Production dependencies include high-severity advisories — fixed and verified

- Evidence: baseline production audit returned 5 high, 28 moderate, and 4 low findings. Next.js 16.2.3 was affected by denial-of-service, middleware/proxy bypass, cache poisoning, XSS, and related advisories.
- Impact: exploitable framework behavior and inherited findings in Sentry/Vercel packages.
- Cause: the lockfile predated patched framework/runtime releases.
- Affected: `package.json`, `package-lock.json`, Next.js/React and direct integration packages.
- Safe action taken: patch/minor updates only; no broad `npm audit fix --force` or breaking Stripe upgrade.

### Medium

#### M-1 — Slug wedding pages return generic metadata — fixed and verified

- Evidence: all 19 live slug samples returned `QuickWeds Invitation` because `src/app/w/[id]/layout.tsx` queries only by database `id`, while the page correctly resolves either ID or slug.
- Impact: poor social previews, bookmarks, and search presentation for the primary public URL.
- Affected: public wedding pages and sharing.

#### M-2 — Sixteen template images lack accessible alternatives — fixed and verified

- Evidence: ESLint flagged missing `alt` attributes in Cinematic, Elopement, Film, Garden, Glitch, Luxury, Midnight, Royal, Rustic, Sakura, Tropical, Vogue, and Whimsical templates; several templates contain more than one occurrence.
- Impact: screen-reader users lose meaningful context; lint quality gate remains noisy.

#### M-3 — Several templates render empty or broken image URLs — mitigated and verified for primary template media

- Evidence: live Luxury, Minimal, Rustic, and Whimsical samples displayed broken-image indicators. Static review found unconditional hero/gallery images in multiple families; Garden assumes at least two gallery entries.
- Impact: a sparse or partially configured wedding can look broken.
- Safe direction: conditionally render media frames and preserve an intentional text/gradient fallback rather than inventing placeholder content.

#### M-4 — Landing footer contains broken social links — fixed and verified

- Evidence: Instagram and Twitter/X icons use `href="#"`; three icon links have no accessible label.
- Impact: dead interactions and inaccessible navigation.
- Affected: `src/app/page.tsx`.

#### M-5 — Distributed abuse controls are incomplete

- Evidence: public notification/contact/signup paths use process-memory rate limiting. Serverless instances do not share that state. The public signup-notification endpoint can be asked to send messages for arbitrary submitted email addresses.
- Impact: burst abuse can span instances and consume email quota.
- Direction: use durable rate limiting and trigger welcome automation from a verified auth event.

#### M-6 — Supabase advisor reports broad policy and function risks

- Evidence after the narrow migration: 130 advisor findings (125 warning, 5 informational), including 5 RLS-enabled tables without policies, 6 mutable function search paths, 4 always-true write policies, public `pg_net`, broad bucket listing, GraphQL exposure, executable security-definer functions for anonymous/authenticated roles, and leaked-password protection disabled. The unchanged total reflects one new informational “no policy” notice for the intentionally server-only guest book replacing a permissive-policy warning.
- Impact: expanded attack surface and uncertain intent around system tables/functions.
- Direction: triage each object with owner/usage evidence; do not bulk-revoke or relocate extensions without dependency testing.

#### M-7 — Public storage policy does not match a single path convention

- Evidence: uploads use at least `userId/weddingId/...`, `planner-food/weddingId/...`, and `suppliers/userId/...`. The existing hardening script assumes the first path segment is always the authenticated user ID.
- Impact: applying the current script would break planner-food and supplier uploads while still leaving some legacy policies unaddressed.

#### M-8 — Large client components concentrate regression and performance risk

- Evidence: planner, builder, wedding dashboard, seating chart, and landing page components range from roughly 63 KB to 146 KB of source.
- Impact: slower review, larger client boundaries, duplicated state logic, and difficult targeted testing.
- Direction: extract stable feature panels/hooks incrementally, preserving API and route boundaries.

#### M-9 — Template date handling is duplicated and inconsistent

- Evidence: many families implement their own `Date` parsing and locale formatting.
- Impact: timezone edge cases and inconsistent public copy.
- Direction: adopt one tested formatter with explicit locale/timezone semantics, then migrate family-by-family.

#### M-10 — Subscription and external integration configuration cannot be fully verified locally

- Evidence: local presence checks found no Stripe webhook secret, Cloudinary URL, cron secret, or supplier review secret. Production may differ.
- Impact: affected integrations fail or become unsafe if the same omissions exist in deployment.
- Direction: validate required production variables and webhook health in the hosting environment without exposing values.

### Low

#### L-1 — Lint debt obscures new defects

- Four blocking errors are simple `prefer-const` cases. The 519 warnings are dominated by `any`, unused values, raw `<img>`, and accessibility findings.
- Establish a ratchet: fix errors and touched-file warnings now, then reduce warnings by feature area.

#### L-2 — Global console interception hides authentication diagnostics

- `src/lib/supabase.ts` monkey-patches `console.error` to suppress invalid-refresh-token messages.
- This can conceal unrelated failures and should be replaced with scoped auth error handling after session tests exist.

#### L-3 — Authentication callback logs unnecessary operational/user details

- Debug logging in the callback includes email/exchange details and adds production console noise.

#### L-4 — Public template variants converge after the hero

- The catalog presents distinct concepts, but many families reuse a nearly identical long section order and shared visual rhythm after the first sections.
- Differentiation can improve through section framing, typographic scale, and media treatment without changing stored content or available controls.

## User-flow review

| Flow | Audit result | Finding / limitation |
| --- | --- | --- |
| Landing → auth | Pass with UX issues | Responsive and error-free in tested sizes; footer has dead social links and unlabeled icons. |
| Create account | Partial | Form and route verified; no real account was created. Signup notification endpoint needs stronger provenance/rate limiting. |
| Onboarding → create wedding | Static/route pass | Signed-out protection works. Mutation not performed against customer-connected data. |
| Build, select template, publish | Static/route pass | Builder is protected; 25 templates map into renderer. Large component and sparse-image behavior raise regression risk. |
| Public wedding by slug | Functional with metadata bug | Content resolves; layout metadata does not resolve slug. |
| Add/manage guests | Static pass, privacy fail | Owner paths appear protected; permissive RSVP policy exposes data independently of UI. |
| Send invitations / automations | Static partial | Delivery endpoints exist; external email not sent. User-content escaping and durable throttling need work. |
| Submit/update RSVP | Static route pass, privacy fail | Public API pattern exists; direct table read policy is unsafe. Duplicate protection depends on route/database behavior and lacks an end-to-end test. |
| Seating planner | Static pass | Protected large client feature; no real drag/drop persistence run. |
| QR generation/check-in/day mode | Static pass | Routes/components present; no camera/device scan or production mutation test. Existing public token/link compatibility must be preserved. |
| Photo upload/share | Static partial | Storage and Cloudinary paths reviewed; no upload performed. Storage hardening needs path-aware policies. |
| Budget/checklist/vendors/collaborators | Static pass | Protected feature paths present. Cross-role permissions require dedicated fixture accounts. |
| Thank-you email/card | Fail | UI records sent state without delivery. Template selection is not connected to the send action. |
| Settings/account | Fail when signed out | `/settings` lacks route-level client guard. |
| Free/Pro restrictions | Static partial | Entitlement checks exist but no dual-account scenario was available. Stripe webhook state was not tested. |
| Logout/login/session | Partial pass | Protected redirects work for dashboard/builder/onboarding; settings exception found. |
| Password reset | Fail | Recovery target route is missing. |
| Magic link | Static partial | Callback code exists; receipt/callback could not be exercised. |

## Template-by-template review

All live families passed the tested desktop/mobile overflow and console-error checks. “Static only” means no production sample was available, not that the family is unused.

| Template | Review | Recommended safe refinement |
| --- | --- | --- |
| Classic | Strong centered heirloom composition; reliable and readable. | Consolidate date formatting and increase distinction in later section dividers. |
| Minimal | Clean editorial whitespace and strong typography; a live sparse sample exposed a broken image. | Make every media block optional with a deliberate type-led fallback. |
| Romantic | Soft framing and warm visual tone feel appropriately wedding-focused. | Check text contrast over pale photography and keep motion restrained. |
| Luxury | Convincing black/gold drama; unconditional media and long reveal timing make sparse pages fragile. | Add image fallback and shorten/extinguish nonessential motion under reduced-motion settings. |
| Elopement | Intimate split layout supports a small-event story. | Add meaningful image alternative and validate narrow-screen crop behavior. |
| Traditional | Ornamental, ceremonial direction is distinct and content-rich. | Normalize form/button tokens while preserving decorative motifs. |
| Timeline | Schedule-first hierarchy is excellent for guest utility. | Improve timezone/date clarity and keep key event details available without animation. |
| RSVP Focus | Strong conversion-first concept and clear primary action. | Ensure RSVP state/error feedback is equally prominent after submission. |
| Cinematic | Filmic hero is visually distinct. | Add image alternative and no-image treatment; avoid text becoming unreadable on arbitrary footage/stills. |
| Elegance | Quiet luxury and restrained spacing feel premium. | Increase differentiation from Classic in gallery and RSVP section framing. |
| Art Deco | Strong geometry and period identity. Static only. | Test a live sparse-content fixture and verify ornamental contrast on mobile. |
| Boho | One of the richest bespoke structures and a clear organic identity. Static only. | Verify long-form mobile rhythm and optional-image behavior with real content. |
| Whimsical | Playful particles and illustration-like details are distinctive; live sparse media broke. | Add fallback media states and cap decorative motion for comfort/performance. |
| Urban | Industrial/neon direction creates a genuinely different option. Static only. | Add accessible media text and test high-contrast forms over dark backgrounds. |
| Tropical | Energetic destination palette and strong image emphasis. | Add missing image alternative and neutral fallback for incomplete galleries. |
| Midnight | Elegant dark/gold night-event direction. | Add image alternative; audit muted gold text against dark surfaces. |
| Sakura | Recognizable Japanese spring identity without changing content model. | Add image alternative and verify pale-pink contrast and font fallback. |
| Vogue | Fashion-editorial composition is premium and distinct. Static only. | Add both missing alternatives and make magazine crops resilient to portrait/landscape media. |
| Rustic | Warm texture and approachable tone; live sparse images broke. | Add image alternative and graceful image omission behavior. |
| Film | Analog framing offers a distinct nostalgic choice. Static only. | Add image alternative and ensure visual grain does not reduce text clarity. |
| Glitch | Deliberately niche cyber direction broadens catalog range. Static only. | Add alternative/fallback media and keep glitch animation away from forms and essential copy. |
| Vintage | Postcard/keepsake language is coherent and live rendering was stable. | Standardize form controls without losing the period treatment. |
| Editorial | Strong magazine hierarchy and premium restraint; live rendering was stable. | Strengthen later-section editorial layouts so they do not converge on the shared stack. |
| Royal | Formal dark/gold presentation is clear and appropriately grand. | Add image alternative and verify ornament/text contrast on lower-quality displays. |
| Garden | Botanical concept is romantic; it assumes two gallery images and has several missing alternatives. | Guard gallery indexes, add alternatives, and provide an intentional botanical text fallback. |

### Cross-template design recommendations

- Preserve the current content schema and all customization choices.
- Introduce shared primitives for safe media, date formatting, accessible RSVP states, and map links; allow each family to skin them.
- Test every family with four fixtures: complete content, text-only sparse content, one gallery image, and long names/locations.
- Keep family-specific hero/story/timeline composition. Differentiate later sections through typography, framing, and spacing rather than additional animation.
- Use semantic headings, visible keyboard focus, form labels, and WCAG AA text contrast as release criteria.
- Replace raw-image warnings incrementally only where optimization will not change externally hosted URL behavior.

## Email and thank-you template review

- Layouts use a sensible approximately 600 px email container and include a viewport declaration, but 48 px side padding and some table-like label/value rows are tight on small screens.
- Escaping is inconsistent. Thank-you/collaborator helpers are safer than RSVP/reminder/welcome helpers.
- Image and URL inputs need an allowlisted `http`/`https` boundary, plus escaped visible text.
- Personalization should fall back cleanly when a guest name, venue, schedule, image, or couple field is missing.
- Delivery status must represent the provider outcome, not an optimistic database insert.
- Thank-you templates exist but the manager does not apply a selected template to a targeted send.
- Add snapshot/render tests for long names, Unicode, malicious HTML text, missing images, and 320 px viewport email clients.

## Feature improvement recommendations

### 1. Wedding readiness checklist

- Problem: couples can publish while important public sections or delivery prerequisites are incomplete.
- Users: couples and collaborators.
- Location: builder publish panel and dashboard overview.
- Connection: website content, RSVP settings, venue, email sender status, and QR links.
- Tier: Free core checks; Pro automation/delivery diagnostics.
- Difficulty: Medium.
- Data/API: mostly computed from existing fields; optional dismissed-warning preference.
- Risk: checks must be advisory and must not block established public links unexpectedly.

### 2. Delivery center with explicit recipient/status history

- Problem: invitation/reminder/thank-you sends are fragmented, and current thank-you feedback is false.
- Users: couples, planners, collaborators with permission.
- Location: email automation and guest detail panels.
- Connection: guests, RSVP reminders, thank-you notes, Resend/provider IDs.
- Tier: basic transactional history Free; scheduled/bulk automation Pro.
- Difficulty: Medium–High.
- Data/API: normalize delivery attempt/status/provider ID/error fields; idempotency key per recipient/template/event.
- Risk: migration/backfill and provider webhook reconciliation; never mark success before provider acceptance.

### 3. Role-permission preview

- Problem: couples cannot easily understand what collaborators, coordinators, or guests can see and change.
- Users: wedding owners and collaborators.
- Location: collaborator settings and share dialogs.
- Connection: existing owner/collaborator RLS and feature access rules.
- Tier: Free.
- Difficulty: Medium.
- Data/API: preferably no new tables initially; derive from canonical permission definitions.
- Risk: UI claims must stay synchronized with RLS and server authorization.

### 4. RSVP duplicate/reconciliation assistance

- Problem: name variations and repeated submissions can create confusing guest state.
- Users: couples and coordinators.
- Location: RSVP inbox/guest management.
- Connection: guest records, households, RSVP updates, seating.
- Tier: Free duplicate warnings; Pro bulk reconciliation suggestions.
- Difficulty: Medium.
- Data/API: optional normalized name/email/phone keys and merge audit log.
- Risk: false-positive merges; require confirmation and reversible history.

### 5. Wedding Day health screen

- Problem: coordinators need an immediate view of offline/stale check-in, unresolved seating, and QR readiness.
- Users: coordinators and couples.
- Location: Wedding Day Mode home.
- Connection: QR check-in, guests, seating, day schedule, sync state.
- Tier: Pro, with essential check-in remaining available under current entitlement rules.
- Difficulty: Medium.
- Data/API: aggregate existing counts; optional last-sync telemetry.
- Risk: avoid exposing private guest data on unattended devices; support safe screen locking.

### 6. Storage/upload diagnostics

- Problem: photo/food/supplier uploads follow different path conventions and failures are hard to distinguish.
- Users: couples, planners, suppliers, support.
- Location: upload controls and an internal diagnostic panel.
- Connection: Supabase Storage and Cloudinary paths.
- Tier: Free user feedback; internal diagnostics operational.
- Difficulty: Medium.
- Data/API: standardized typed upload result; no path migration initially.
- Risk: do not rename existing objects or invalidate saved URLs.

### 7. Template content resilience preview

- Problem: a template can look excellent with demo content but break with sparse or unusually long real content.
- Users: couples and designers.
- Location: template picker/builder preview.
- Connection: existing template renderer and customization model.
- Tier: Free.
- Difficulty: Low–Medium.
- Data/API: none; deterministic preview fixtures and warnings.
- Risk: preview must never overwrite user content.

## Affected pages and files

Primary immediate-fix files:

- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/api/planner/event-reminders/route.ts`
- `src/components/dashboard/ThankYouNoteManager.tsx`
- `src/app/api/weddings/thank-you/send/route.ts`
- `src/app/w/[id]/layout.tsx`
- `src/lib/email-templates.ts`
- `src/app/page.tsx`
- `src/app/api/planner/items/route.ts`
- `src/lib/email.ts`
- `src/components/BuilderForm.tsx`
- `src/components/wedding/SafeWeddingImage.tsx`
- Template files under `src/components/templates/`
- `supabase/migrations/20260711154011_lock_down_public_rsvp_and_guest_book_access.sql`
- `package.json` and `package-lock.json`
- `.gitignore` and `.env.example`
- `tests/auth.spec.ts`, `tests/builder.spec.ts`, `tests/security.spec.ts`, `tests/email-templates.spec.ts`, and `tests/ui-smoke.spec.ts`

Secondary follow-up areas:

- `src/app/api/analytics/track/route.ts`
- `src/lib/supabase.ts`
- `src/lib/api-auth.ts`
- `src/lib/rate-limiter.ts`
- Storage upload callers in builder, planner-food, and supplier features
- Root standalone Supabase SQL scripts and production migration history
- Large client components for builder, planner, dashboard, seating, and landing

## Safe implementation plan

### Group 1 — Account and endpoint safety

1. Add the missing recovery completion page using the Supabase recovery session and `updateUser`.
2. Redirect signed-out settings visitors only after auth loading resolves.
3. Make reminder cron authorization fail closed and escape email values.
4. Add focused unauthenticated Playwright coverage.
5. Run TypeScript, lint, tests, build, and browser checks.

### Group 2 — Correct delivery and sharing behavior

1. Change thank-you creation to a draft.
2. Allow the existing send API to target exactly that draft note.
3. Show provider-backed sending/success/error state.
4. Resolve public metadata through the same ID-or-slug server resolver as the page.
5. Remove dead social links and label the configured one.
6. Run focused and full checks.

### Group 3 — Narrow database privacy migration

1. Drop only the unconditional RSVP select policy and unconditional guest-book read/insert policies.
2. Preserve all owner/collaborator policies and server API behavior.
3. Include exact rollback SQL.
4. Apply through tracked Supabase migration tooling.
5. Re-run anonymous-role counts and public-page/API smoke checks.

### Group 4 — Accessibility and lint ratchet

1. Fix blocking `prefer-const` findings.
2. Add missing alternatives in template/media code touched by this audit.
3. Do not mass-convert image components or rewrite template structure.
4. Record remaining lint warnings as debt and establish per-feature reduction.

### Deferred hardening sequence

1. Move analytics and any remaining public reads away from direct `weddings` table access.
2. Replace unconditional wedding policies with a restricted public view or server-only whitelist.
3. Inventory every live function, system table policy, and storage prefix before changing grants.
4. Reconstruct an authoritative baseline migration from production and reconcile it with standalone SQL history.
5. Enable leaked-password protection in Supabase Auth after user messaging/support review.

## Changes applied

### Account, authentication, and endpoint safety

- Added `/reset-password` with recovery-session validation, password confirmation, Supabase `updateUser`, safe expired-link feedback, and local sign-out after success.
- Guarded `/settings` after auth loading resolves and preserved the original destination in the login query.
- Changed the planner reminder cron to reject requests when `CRON_SECRET` is missing or incorrect.
- Added `CRON_SECRET` to the documented/validated environment contract and escaped all reminder email values.

### Delivery, metadata, and public navigation

- Connected the thank-you manager to the existing delivery API. New records begin as drafts, target one note, claim the row as `sending` before delivery to prevent duplicate sends, and display provider-backed success/error state.
- Preserved historical `sent` records rather than automatically resending them.
- Resolved wedding metadata through the same ID-or-slug server resolver as the public page; deleted rows remain excluded.
- Removed unconfigured footer social links and added an accessible name to the configured Facebook link.
- Sanitized email subjects, escaped RSVP/reminder/welcome personalization, preserved safe line breaks, and allowlisted only HTTP(S) email links.

### Template and builder resilience

- Added all previously missing image alternatives in template and builder upload previews.
- Added accessible names to builder file inputs and media removal buttons.
- Added a reusable primary-media component that renders a branded fallback for missing or failed wedding images without replacing saved URLs or user content.
- Applied the safe media behavior across Classic, Boho, Editorial, Urban, RSVP Focus, Cinematic, Elopement, Film, Garden, Glitch, Luxury, Midnight, Royal, Rustic, Sakura, Tropical, Vogue, Whimsical, and the shared biography section.
- Guarded Garden’s first two gallery positions so one-image and empty galleries do not render invalid image sources.

### Database privacy

- Created and applied tracked migration `20260711154011_lock_down_public_rsvp_and_guest_book_access`.
- Removed only `anyone_can_view_rsvps`, `Enable insert for all`, and `Enable read access for all`.
- Preserved owner/collaborator policies, service-role public APIs, public wedding links, RSVP links, QR codes, storage paths, and all data.
- Included exact rollback SQL in the migration file.

### Dependencies and lint gate

- Updated Next.js 16.2.3 → 16.2.10, React/React DOM 19.2.3 → 19.2.7, and aligned `eslint-config-next` 16.2.10.
- Updated patched compatible releases of Sentry, Supabase JS, Resend, UUID 13, and Capacitor CLI.
- Fixed the four blocking `prefer-const` findings. Full lint now exits successfully with 0 errors and 459 warnings, down from 519 warnings.
- Production dependency audit now reports 0 critical, 0 high, 7 moderate, and 1 low finding. Remaining findings are transitive/current-package advisories without a reported non-breaking fix; no forced major upgrade was applied.

## Final verification

| Check | Final result | Evidence |
| --- | --- | --- |
| TypeScript | Pass | `npx tsc --noEmit` exited 0. |
| Full lint | Pass with debt | 0 errors, 459 warnings across 238 files; baseline was 4 errors/519 warnings. |
| Playwright | Pass, 14/14 | Auth, reset, settings, builder desktop/mobile, email escaping, endpoint authorization, and desktop/mobile UI checks. |
| Production build | Pass | Next.js 16.2.10 compiled, type-checked, generated 68 pages, and included `/reset-password`. |
| Browser console | Pass for tested flows | Landing, mobile reset, and builder/preview iframe produced no console or page errors after the media fallback fix. |
| Responsive layout | Pass for tested flows | Landing/reset passed automated desktop/mobile overflow assertions; all 19 live template families had already passed the manual 1280 px and 375 px overflow sweep. |
| Slug metadata | Pass | Rendered slug HTML returned HTTP 200, a couple-specific invitation title, and no generic fallback title. |
| Footer links | Pass | Rendered landing HTML and browser test found zero footer `href="#"` links and one accessible Facebook link. |
| Cron authorization | Pass | Unauthenticated GET returns 401 even with no local cron secret. |
| Supabase migration | Pass | Live migration list contains version `20260711154011`; the three permissive policies no longer exist. |
| Anonymous data access | Pass for migrated tables | RSVP Data API read returns 401 / Postgres `42501`; guest-book direct read returns HTTP 200 with `Content-Range: */0`. |
| Public API regression | Pass | Production public wedding resolves, guest-book API returns 200, and deliberately invalid RSVP returns 400 without inserting data. |
| Dependency audit | Pass for release-blocking severities | 0 critical/high; 7 moderate and 1 low remain and are documented. |

### Verification limitations

- No real email was sent, no historical thank-you row was resent, and no production customer record was mutated for flow testing.
- Password email receipt, magic-link receipt, Stripe webhook/checkout, QR camera scanning, real uploads, collaborator role matrices, native iOS, and Free-versus-Pro end-to-end scenarios still require dedicated fixture accounts/services.
- The connected production migration history is still incomplete despite the new migration being tracked correctly.
- Application code is changed locally but was not deployed by this audit; the database policy migration is the only live mutation applied.

## Remaining risks and recommended order

1. Prepare and separately verify wedding-table lockdown. First migrate the analytics POST and any remaining legitimate public reads away from the anonymous `weddings` table query; anonymous access to complete wedding rows remains the highest unresolved issue.
2. Reconcile the production schema into an authoritative baseline migration and retire/reclassify standalone SQL files without replaying destructive operations.
3. Address the remaining Supabase advisor findings object-by-object: GraphQL grants, security-definer function execution, function search paths, broad storage listing, always-true system write policies, `pg_net`, and leaked-password protection.
4. Configure and verify a strong production `CRON_SECRET`; the endpoint intentionally returns 401 when it is absent.
5. Reconcile historical thank-you records that were previously marked `sent` without provider delivery. Do not bulk resend without owner review.
6. Add fixture-based end-to-end coverage for owner, collaborator, coordinator, guest, Free, and Pro scenarios, including real provider sandboxes.
7. Replace process-memory public rate limiting with a durable distributed store and move signup automation behind a verified auth event.
8. Continue the lint/type ratchet, shared date formatter, storage-prefix inventory, and incremental decomposition of the largest client components.
