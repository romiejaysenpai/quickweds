-- Canonical additive migration for template RSVP configuration and household replies.
-- Existing wedding and RSVP rows are preserved; no tables, rows, or legacy columns are removed.

alter table public.weddings
    add column if not exists rsvp_events jsonb not null default '[]'::jsonb;

alter table public.rsvps
    add column if not exists household_name text,
    add column if not exists household_members jsonb not null default '[]'::jsonb,
    add column if not exists event_responses jsonb not null default '[]'::jsonb;

comment on column public.weddings.rsvp_events is
    'Ordered public RSVP event definitions configured by the couple.';
comment on column public.rsvps.household_name is
    'Optional family or household label for a grouped RSVP.';
comment on column public.rsvps.household_members is
    'Sanitized names covered by the household RSVP.';
comment on column public.rsvps.event_responses is
    'Per-event attendance responses validated against the wedding event ids.';

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'weddings_rsvp_events_is_array') then
        alter table public.weddings add constraint weddings_rsvp_events_is_array
            check (jsonb_typeof(rsvp_events) = 'array');
    end if;
    if not exists (select 1 from pg_constraint where conname = 'rsvps_household_members_is_array') then
        alter table public.rsvps add constraint rsvps_household_members_is_array
            check (jsonb_typeof(household_members) = 'array');
    end if;
    if not exists (select 1 from pg_constraint where conname = 'rsvps_event_responses_is_array') then
        alter table public.rsvps add constraint rsvps_event_responses_is_array
            check (jsonb_typeof(event_responses) = 'array');
    end if;
end $$;

-- The public RSVP endpoint uses the server-side service role. Browser clients do
-- not need direct write access to RSVP records.
revoke all on table public.rsvps from anon;
revoke insert, update, delete, truncate, references, trigger on table public.weddings from anon;
grant select on table public.weddings to anon;

-- Authenticated access remains subject to the existing owner/collaborator RLS policies.
revoke truncate, references, trigger on table public.weddings from authenticated;
revoke truncate, references, trigger on table public.rsvps from authenticated;
grant select, insert, update, delete on table public.weddings to authenticated;
grant select, insert, update, delete on table public.rsvps to authenticated;

alter table public.weddings enable row level security;
alter table public.rsvps enable row level security;
