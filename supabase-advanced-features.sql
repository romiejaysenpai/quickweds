-- QuickWeds advanced feature support
-- Run this in your Supabase SQL editor before using analytics, collaborators, reminders, and template presets.

create extension if not exists pgcrypto;

create table if not exists public.wedding_analytics_events (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    event_type text not null,
    source text,
    session_id text,
    referrer text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists public.wedding_reminders (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    sent_by text,
    recipient_count integer not null default 0,
    success_count integer not null default 0,
    target_status text not null default 'pending',
    channel text not null default 'email',
    sent_at timestamptz not null default now()
);

create table if not exists public.wedding_collaborators (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    email text not null,
    role text not null check (role in ('partner', 'coordinator')),
    status text not null default 'pending' check (status in ('pending', 'accepted')),
    invited_by_user_id uuid,
    created_at timestamptz not null default now(),
    unique (wedding_id, email)
);

create table if not exists public.wedding_template_presets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    template_id text not null,
    description text,
    preset_data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.rsvps add column if not exists guest_email text;

create index if not exists idx_wedding_analytics_events_wedding_id on public.wedding_analytics_events (wedding_id);
create index if not exists idx_wedding_reminders_wedding_id on public.wedding_reminders (wedding_id);
create index if not exists idx_wedding_collaborators_email on public.wedding_collaborators (email);
create index if not exists idx_wedding_template_presets_user_id on public.wedding_template_presets (user_id);

alter table public.wedding_analytics_events enable row level security;
alter table public.wedding_reminders enable row level security;
alter table public.wedding_collaborators enable row level security;
alter table public.wedding_template_presets enable row level security;

drop policy if exists "Public can insert analytics events" on public.wedding_analytics_events;
create policy "Public can insert analytics events"
on public.wedding_analytics_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Owners and collaborators can read analytics events" on public.wedding_analytics_events;
create policy "Owners and collaborators can read analytics events"
on public.wedding_analytics_events
for select
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_analytics_events.wedding_id
        and (
            w.user_id = auth.uid()
            or exists (
                select 1
                from public.wedding_collaborators c
                where c.wedding_id = w.id
                and lower(c.email) = lower(auth.email())
                and c.status = 'accepted'
            )
        )
    )
);

drop policy if exists "Owners and collaborators can manage reminders" on public.wedding_reminders;
create policy "Owners and collaborators can manage reminders"
on public.wedding_reminders
for all
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_reminders.wedding_id
        and (
            w.user_id = auth.uid()
            or exists (
                select 1
                from public.wedding_collaborators c
                where c.wedding_id = w.id
                and lower(c.email) = lower(auth.email())
                and c.status = 'accepted'
            )
        )
    )
)
with check (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_reminders.wedding_id
        and (
            w.user_id = auth.uid()
            or exists (
                select 1
                from public.wedding_collaborators c
                where c.wedding_id = w.id
                and lower(c.email) = lower(auth.email())
                and c.status = 'accepted'
            )
        )
    )
);

drop policy if exists "Owners and invitees can manage collaborators" on public.wedding_collaborators;
create policy "Owners and invitees can manage collaborators"
on public.wedding_collaborators
for all
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_collaborators.wedding_id
        and w.user_id = auth.uid()
    )
    or lower(wedding_collaborators.email) = lower(auth.email())
)
with check (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_collaborators.wedding_id
        and w.user_id = auth.uid()
    )
    or lower(wedding_collaborators.email) = lower(auth.email())
);

drop policy if exists "Users manage own presets" on public.wedding_template_presets;
create policy "Users manage own presets"
on public.wedding_template_presets
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
