# Migration source of truth

Files in `supabase/migrations/` are the ordered, deployable database history. Root-level SQL files are retained as historical recovery and audit material; they should not be rerun against production.

New changes must be additive where possible, use `if not exists` for safe rollout, preserve existing rows, explicitly set Data API grants, and verify row-level security after deployment.

The template/RSVP consolidation migration is `20260717143000_consolidate_template_rsvp_schema_and_grants.sql`. It adds only JSONB/text columns with safe defaults and narrows browser grants; public RSVP submissions continue through the rate-limited server endpoint.

## Current reconciliation gate

The repository still has 33 root-level `supabase-*.sql` historical scripts and only seven pre-existing ordered migrations. Those scripts contain overlapping schema and policy definitions, so they are not a reproducible baseline and must not be bulk-converted or executed as a batch.

Before applying any migration to a shared environment:

1. Provision or nominate a disposable staging Supabase project; do not link the active QuickWeds project unless it is explicitly confirmed as staging.
2. Capture the staging schema with `supabase db pull --linked`, compare it with this directory, and review every table, function, grant, storage policy, trigger, and RLS policy that the application exposes.
3. Apply pending migrations to staging only, then run two-user cross-wedding RLS and storage-policy tests using non-production accounts and data.
4. Capture the resulting schema as the reviewed migration baseline in a separate PR. Archive/reclassify the root-level scripts only after that baseline is verified.

`20260815120000_add_rsvp_and_email_idempotency.sql` is deliberately additive: it gives new RSVP records an atomic submission key and adds server-only delivery leases. It does not backfill or alter historical RSVP data. Deploy that migration before deploying the API code that depends on it.
