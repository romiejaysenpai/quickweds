# Staging reconciliation record

`quickweds-staging` is an isolated Supabase project in `ap-southeast-2`. It is
not linked to Vercel production and contains only disposable verification data.

## Ordered-migration bootstrap result

On an empty staging database, `supabase db push --linked --dry-run` correctly
identified all eight ordered migrations. The actual push stopped at the first
migration with:

```text
ERROR: relation "public.rsvps" does not exist
drop policy if exists "anyone_can_view_rsvps" on public.rsvps
```

Static source inspection confirms no tracked migration or root-level
`supabase-*.sql` script creates the core `public.weddings` or `public.rsvps`
tables. Root scripts only alter or reference them. This proves that the current
source set cannot bootstrap a project and that the root scripts are not an
authoritative baseline.

Do not work around this by batch-running root-level scripts: they contain
overlapping schema/policy definitions and historically permissive RLS policies.

## Read-only production schema inventory

The authenticated Supabase catalog connector was used on 2026-08-15 to inspect
schema metadata only. No application rows, customer data, or storage objects
were queried or copied.

- Production contains **49** `public` tables, **99** `public` RLS policies,
  **8** `storage.objects` policies, **13** `public` functions, and **4**
  non-internal `public` triggers. RLS is enabled on every listed public table.
- Production records **9** migrations; the repository contains **8** ordered
  migration files, and their version numbers/names do not match the production
  history. This confirms out-of-band schema changes in addition to the missing
  baseline.
- `weddings` has 14 simultaneously active policies and `rsvps` has 5. The
  former includes broad `SELECT USING (true)` policies for `anon`,
  `authenticated`, and `public`; a future baseline must explicitly decide
  whether raw wedding rows are intentionally public or must be replaced by a
  safe public projection. Do not assume RLS being enabled makes the raw table
  private.
- Catalog privilege checks confirm that both `anon` and `authenticated` have
  `SELECT` on `public.weddings`; `authenticated` also has DML grants on
  `weddings` and `rsvps`. The policy expressions, not table grants alone,
  decide row access. This makes cross-account testing of the consolidated
  policy set a release gate.
- Storage has eight overlapping `storage.objects` policies for the
  `quickweds` bucket, including broad public read and authenticated upload
  policies. These must be consolidated and tested with real non-production
  accounts before release.

This inventory is authoritative enough to establish that the present migration
history is incomplete, but a catalog listing cannot create a faithful DDL
baseline by itself. The remaining baseline must include exact column defaults,
constraints, indexes, functions, grants, triggers, buckets, and policy
definitions, generated from a schema-only database dump and reviewed before it
is ever applied to a shared environment.

## Verified additive migration harness

To verify `20260815120000_add_rsvp_and_email_idempotency.sql` independently of
the missing baseline, a minimal disposable `weddings`/`rsvps` harness was
created directly in staging. The migration was applied as SQL, without adding
an entry to migration history.

- A duplicate `(wedding_id, submission_key)` insert failed with PostgreSQL
  `23505` on `rsvps_wedding_submission_key_unique`.
- `claim_email_delivery` returned a lease; after completion as `sent`, a second
  claim returned `NULL`.
- `email_delivery_reservations` has RLS enabled, no policies, no `anon` or
  `authenticated` table/RPC access, and the required `service_role` access.
- `supabase db advisors --linked --type security --level warn` returned no
  issues after the test harness tables were also RLS-enabled and had public
  grants revoked.

## Required next step

Obtain a **schema-only** export of the existing QuickWeds database using a
read-only database credential or a Supabase Dashboard export. Do not export or
copy production row data. Use that export to create and review one ordered
baseline migration, apply it to this staging project, then run genuine User
A/User B cross-wedding RLS and storage-policy tests.
