-- QuickWeds Free vs Pro usage tracking
-- Run this in Supabase after the existing planner/power feature SQL files.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.planner_email_events (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    event_type text not null check (event_type in ('rsvp_reminder', 'seat_link', 'thank_you', 'manual_guest_message')),
    recipient_count integer not null default 0 check (recipient_count >= 0),
    success_count integer not null default 0 check (success_count >= 0),
    created_by_user_id uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

create index if not exists idx_planner_email_events_wedding
on public.planner_email_events(wedding_id, created_at desc);

alter table public.planner_email_events enable row level security;

drop policy if exists "owners_can_read_planner_email_events" on public.planner_email_events;
create policy "owners_can_read_planner_email_events"
on public.planner_email_events
for select
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = planner_email_events.wedding_id
        and w.user_id = auth.uid()
    )
);

drop policy if exists "owners_can_insert_planner_email_events" on public.planner_email_events;
create policy "owners_can_insert_planner_email_events"
on public.planner_email_events
for insert
to authenticated
with check (
    exists (
        select 1
        from public.weddings w
        where w.id = planner_email_events.wedding_id
        and w.user_id = auth.uid()
    )
);

notify pgrst, 'reload schema';
