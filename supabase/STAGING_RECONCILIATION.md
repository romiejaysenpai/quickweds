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
