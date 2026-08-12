# QuickWeds Engineering Agent Rules

## Mission

You are working on **QuickWeds**, a production wedding website and wedding-planning SaaS.

Your responsibility is not only to write code.

Your responsibility is to:

**Understand → Plan → Implement → Test → Inspect → Fix → Re-test → Verify**

Do not consider a task complete simply because the code was written.

A task is complete only when the requested behavior is implemented and the relevant checks pass.

---

# Core Engineering Loop

For every meaningful feature, bug fix, refactor, or infrastructure change, follow this loop:

 1. Understand the request.

 2. Inspect the existing implementation.

 3. Identify affected components, APIs, database tables, policies, and dependencies.

 4. Create a short implementation plan.

 5. Implement the smallest safe change.

 6. Run relevant checks.

 7. Inspect the result.

 8. If a check fails:

    - find the root cause;

    - fix the problem;

    - run the checks again.

 9. Repeat until the relevant checks pass.

10. Review the final diff for unintended changes.

11. Report:

- what changed;

- why it changed;

- files affected;

- database changes;

- tests/checks performed;

- unresolved risks.

Never stop after the first implementation if verification has not been completed.

---

# QuickWeds Stack

QuickWeds primarily uses:

- Next.js

- React

- TypeScript

- Supabase

- PostgreSQL

- Supabase Auth

- Supabase Storage

- Row Level Security

- Resend

- Stripe

- Vercel

- GitHub

- Sentry

Before introducing another dependency, verify that the existing stack cannot reasonably solve the problem.

Avoid unnecessary packages.

---

# Production Safety

QuickWeds is a production application with real user data.

Treat production data as critical.

Never:

- reset the production database;

- delete production tables;

- truncate production tables;

- delete user records;

- remove RSVP records;

- remove wedding data;

- overwrite production environment variables;

- modify production data merely to make tests pass;

- run destructive migrations without explicit approval;

- deploy directly to production without approval.

Prefer backward-compatible changes.

When a migration is required, explain the migration before applying it.

---

# Git Safety

Do not make major changes directly on the production branch.

Preferred workflow:

Task\
→ branch\
→ implementation\
→ tests\
→ review\
→ preview deployment\
→ approval\
→ production

Before modifying code:

- inspect the current branch;

- inspect git status;

- understand recent relevant changes when necessary.

Do not revert unrelated work.

Do not overwrite newer code with an older implementation.

Do not perform broad formatting changes unless requested.

Keep diffs focused on the task.

---

# Before Coding

Before implementing a meaningful change, inspect:

- relevant routes;

- components;

- hooks;

- services;

- API handlers;

- Supabase queries;

- types;

- database relationships;

- RLS policies;

- existing tests;

- related functionality.

Do not assume architecture based only on filenames.

Read the existing implementation first.

For larger changes, summarize:

## Goal

What needs to change.

## Existing Behavior

How the system currently works.

## Proposed Change

What will be modified.

## Risk Areas

What could break.

Then implement.

---

# Verification Loop

After implementation, run the relevant checks available in the repository.

Prefer this sequence when applicable:

1. TypeScript/type checking

2. linting

3. targeted tests

4. broader tests

5. production build

6. database/RLS review

7. feature-specific verification

8. regression review

If a check fails:

**Do not ignore it.**

Use:

Failure\
→ investigate\
→ identify root cause\
→ fix\
→ rerun\
→ verify

Continue until the relevant checks pass or there is a genuine blocker.

If there is a blocker, explain exactly what prevented verification.

---

# Build Verification

A successful implementation should normally leave the project capable of completing its production build.

Run the repository's existing build command.

Do not modify configuration simply to hide legitimate build errors.

If the build fails because of your changes, fix them.

If the build was already failing before your changes, clearly distinguish pre-existing failures from new failures.

---

# Supabase Rules

Supabase changes require extra caution.

Before changing database behavior, inspect:

- table structure;

- foreign keys;

- indexes;

- triggers;

- functions;

- RLS policies;

- authentication assumptions;

- application queries that depend on the schema.

Never disable RLS simply to fix a permission issue.

Never solve authorization problems by exposing privileged credentials to the browser.

Service-role keys must remain server-side.

Client-side code must use appropriate user-scoped access.

For migrations:

1. understand the current schema;

2. create the smallest necessary migration;

3. preserve existing data;

4. check backward compatibility;

5. inspect RLS impact;

6. verify existing flows.

---

# Authentication

Protect authentication flows carefully.

Whenever auth-related code changes, verify relevant flows such as:

- signup;

- login;

- logout;

- session persistence;

- protected routes;

- onboarding;

- password reset where applicable;

- OAuth where applicable.

Existing users should not accidentally be treated as new users.

First-time users should receive the intended onboarding behavior.

Do not create redirect loops.

---

# RSVP Safety

RSVP information is important user data.

Changes involving RSVP functionality should inspect:

- RSVP creation;

- RSVP updates;

- duplicate submissions;

- guest records;

- QR generation;

- RSVP confirmation;

- email delivery;

- dashboard display;

- permissions;

- wedding ownership.

Do not delete or rewrite RSVP records during debugging.

When fixing RSVP issues, preserve existing records.

---

# Wedding Website Builder

Changes to templates or website-builder functionality must avoid breaking existing published wedding websites.

When changing template structures:

- preserve existing stored data;

- provide sensible fallbacks for older weddings;

- do not require users to recreate existing sites;

- check desktop and mobile rendering.

Existing wedding websites should remain functional after new template features are introduced.

---

# Email

QuickWeds uses transactional email.

Email-related changes should verify:

- correct recipient;

- correct wedding/user context;

- duplicate-send prevention;

- required variables;

- failure handling;

- correct sending domain/configuration;

- server-side execution.

Do not send test emails to real users unless explicitly requested.

Use safe test recipients or development environments.

---

# Stripe and Payments

Treat payment logic as high risk.

Do not change payment behavior casually.

When working with Stripe:

- verify server-side validation;

- verify webhook signatures;

- prevent duplicate processing;

- use idempotency where appropriate;

- verify user/account ownership;

- never expose secret keys client-side.

Never mark a user as paid based solely on client-side state.

Payment status should come from trusted server-side verification.

---

# Security

Never expose:

- Supabase service role key;

- Stripe secret key;

- Resend API key;

- database credentials;

- OAuth client secrets;

- signing secrets;

- private environment variables.

If sensitive values appear in committed code, report the issue.

Use environment variables for secrets.

Validate user-controlled inputs.

Check authorization, not just authentication.

---

# RLS Review

Whenever database access changes, ask:

1. Who can read this?

2. Who can create this?

3. Who can update this?

4. Who can delete this?

5. Can one wedding owner access another wedding's data?

6. Can a guest access organizer-only information?

7. Can unauthenticated users access only intentionally public data?

Prefer explicit ownership checks.

---

# Mobile-First UI

QuickWeds should remain mobile-friendly.

For UI changes, verify:

- mobile layout;

- desktop layout;

- text overflow;

- long names;

- loading states;

- empty states;

- error states;

- button accessibility;

- form validation;

- responsive images.

Do not fix desktop at the expense of mobile.

---

# Error Handling

Do not swallow exceptions silently.

When appropriate:

- provide user-safe error messages;

- log useful developer context;

- avoid leaking secrets;

- preserve enough information for debugging.

If Sentry is available, maintain compatibility with existing monitoring patterns.

---

# Performance

Avoid premature optimization, but watch for:

- unnecessary client requests;

- repeated database queries;

- unbounded queries;

- large images;

- excessive re-renders;

- unnecessary client components;

- duplicate API calls.

Prefer server-side work when appropriate.

Do not introduce caching without understanding invalidation.

---

# Refactoring

Do not perform broad refactors while implementing an unrelated feature.

First solve the requested problem.

Refactor only when:

- necessary for the implementation;

- explicitly requested;

- or clearly required for correctness.

Keep refactors separate when practical.

---

# Existing Features Are Contracts

Before changing shared components, determine which features depend on them.

A new feature should not silently break:

- wedding websites;

- RSVP;

- guest management;

- seating planner;

- budget tracker;

- vendor management;

- photo features;

- collaboration;

- authentication;

- onboarding;

- emails;

- QR functionality;

- public pages.

Regression prevention is part of the task.

---

# Bug-Fix Loop

For bugs use:

**Reproduce → Diagnose → Fix → Regression Test → Verify**

Do not patch symptoms without understanding the likely root cause.

Whenever possible:

1. reproduce the issue;

2. locate the responsible code path;

3. determine why it happens;

4. make the smallest reliable fix;

5. add or improve a regression test;

6. verify related functionality.

---

# Feature Loop

For new features use:

**Requirements → Inspect → Plan → Implement → Test → Review → Verify**

Do not invent major requirements when the request is ambiguous.

Use the existing QuickWeds product patterns wherever possible.

---

# Database Loop

For database changes use:

**Inspect Schema → Plan Migration → Check RLS → Apply Safely → Verify Queries → Regression Check**

Preserve existing data.

Never use destructive schema changes as the default solution.

---

# Final Self-Review

Before declaring a task complete, inspect the final diff and ask:

- Did I solve the actual request?

- Did I modify unrelated files?

- Could this break existing users?

- Could this cause data loss?

- Did I introduce a security problem?

- Did I check permissions?

- Did I test the important path?

- Did the build pass?

- Did I leave debugging code behind?

- Did I expose secrets?

- Is there a simpler implementation?

Fix problems discovered during this review before finishing.

---

# Definition of Done

A task is **not done** when coding stops.

A task is done when:

\*\*Requirement satisfied

- implementation complete

- relevant tests pass

- build/checks pass

- security/data implications reviewed

- regression risk reviewed

- final diff reviewed\*\*

If verification cannot be completed, say so explicitly.

Never claim something was tested if it was not actually tested.

---

# Completion Report

At the end of every substantial task provide:

## Completed

Short explanation of what was implemented.

## Changed

Important files/components affected.

## Verification

Commands and checks actually performed.

Use:

PASS\
FAIL\
NOT RUN

Never mark something PASS without executing or inspecting the relevant check.

## Database Impact

State:

- none;

- migration added;

- RLS changed;

- schema changed;

- or data migration required.

## Risks / Follow-up

Only list meaningful remaining concerns.

---

# Prime Directive

Protect existing QuickWeds users and their data first.

Then optimize for:

**correctness → security → reliability → maintainability → speed of implementation**

When uncertain whether a shortcut could damage production data or existing functionality, choose the safer implementation.