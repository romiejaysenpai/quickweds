begin;

-- Server-only idempotency records. Browser roles receive no table privileges.
create table if not exists public.signup_notification_events (
    user_id uuid primary key references auth.users(id) on delete cascade,
    status text not null default 'processing' check (status in ('processing', 'sent', 'failed')),
    last_attempt_at timestamptz not null default now(),
    sent_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.agentops_lifecycle_deliveries (
    task_id text primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    lifecycle_stage text not null,
    status text not null default 'processing' check (status in ('processing', 'sent', 'failed')),
    sent_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists agentops_lifecycle_deliveries_user_stage_idx
    on public.agentops_lifecycle_deliveries (user_id, lifecycle_stage, created_at desc);

-- Keep public RSVP duplicate protection separate from historic RSVP rows so
-- rollout cannot fail because legacy data contains duplicates.
create table if not exists public.public_rsvp_submission_keys (
    wedding_id text not null references public.weddings(id) on delete cascade,
    submission_key text not null,
    rsvp_id text,
    created_at timestamptz not null default now(),
    primary key (wedding_id, submission_key)
);

create index if not exists public_rsvp_submission_keys_rsvp_id_idx
    on public.public_rsvp_submission_keys (rsvp_id)
    where rsvp_id is not null;

-- Publication is explicit. The backfill preserves the app's prior behavior:
-- a valid public slug was the previous definition of a live wedding site.
alter table public.weddings add column if not exists is_published boolean;
update public.weddings
set is_published = coalesce(nullif(trim(public_slug), ''), '') <> ''
where is_published is null;
alter table public.weddings alter column is_published set default false;
alter table public.weddings alter column is_published set not null;

alter table public.signup_notification_events enable row level security;
alter table public.agentops_lifecycle_deliveries enable row level security;
alter table public.public_rsvp_submission_keys enable row level security;

revoke all on table public.signup_notification_events from anon, authenticated;
revoke all on table public.agentops_lifecycle_deliveries from anon, authenticated;
revoke all on table public.public_rsvp_submission_keys from anon, authenticated;

grant select, insert, update, delete on table public.signup_notification_events to service_role;
grant select, insert, update, delete on table public.agentops_lifecycle_deliveries to service_role;
grant select, insert, update, delete on table public.public_rsvp_submission_keys to service_role;

commit;
