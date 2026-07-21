# Migration source of truth

Files in `supabase/migrations/` are the ordered, deployable database history. Root-level SQL files are retained as historical recovery and audit material; they should not be rerun against production.

New changes must be additive where possible, use `if not exists` for safe rollout, preserve existing rows, explicitly set Data API grants, and verify row-level security after deployment.

The template/RSVP consolidation migration is `20260717143000_consolidate_template_rsvp_schema_and_grants.sql`. It adds only JSONB/text columns with safe defaults and narrows browser grants; public RSVP submissions continue through the rate-limited server endpoint.
