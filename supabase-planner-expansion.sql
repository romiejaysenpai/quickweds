-- QuickWeds Planner Expansion
-- Checklist categories, calendar events, food/drinks planner, and calendar feed tokens.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

alter table public.weddings
add column if not exists planner_calendar_token text default (gen_random_uuid())::text;

update public.weddings
set planner_calendar_token = (gen_random_uuid())::text
where planner_calendar_token is null;

alter table public.planner_tasks
add column if not exists section text default 'General',
add column if not exists assigned_to text,
add column if not exists planner_vendor_id uuid references public.planner_vendors(id) on delete set null,
add column if not exists custom_supplier_name text,
add column if not exists notes text,
add column if not exists template_key text,
add column if not exists updated_at timestamptz default now();

update public.planner_tasks
set status = 'to_prepare'
where status is null or status = 'pending' or status = 'in-progress';

update public.planner_tasks
set status = 'prepared'
where status = 'completed';

create table if not exists public.planner_events (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    title text not null,
    starts_at timestamptz not null,
    ends_at timestamptz,
    location text,
    notes text,
    planner_task_id uuid references public.planner_tasks(id) on delete set null,
    reminder_minutes integer default 1440,
    reminder_sent_at timestamptz,
    google_event_id text,
    google_event_updated_at timestamptz,
    google_sync_error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.planner_events
add column if not exists google_event_id text,
add column if not exists google_event_updated_at timestamptz,
add column if not exists google_sync_error text;

create table if not exists public.planner_food_drinks (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    planner_vendor_id uuid references public.planner_vendors(id) on delete set null,
    item_type text not null default 'food' check (item_type in ('food', 'drink', 'dessert', 'other')),
    item_name text not null,
    serving_category text,
    reference_image_url text,
    estimated_cost numeric default 0,
    custom_supplier_name text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.planner_google_calendar_connections (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    google_calendar_id text not null default 'primary',
    access_token text,
    refresh_token text,
    token_expires_at timestamptz,
    scope text,
    connected_at timestamptz not null default now(),
    last_synced_at timestamptz,
    revoked_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (wedding_id, user_id)
);

create table if not exists public.planner_honeymoon_items (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    category text not null default 'destination' check (category in ('destination', 'flight', 'hotel', 'activity', 'transport', 'documents', 'packing', 'other')),
    title text not null,
    destination text,
    start_date date,
    end_date date,
    estimated_cost numeric default 0,
    status text not null default 'idea' check (status in ('idea', 'researching', 'booked', 'paid')),
    supplier_name text,
    booking_link text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_planner_events_wedding_id on public.planner_events(wedding_id);
create index if not exists idx_planner_events_starts_at on public.planner_events(starts_at);
create index if not exists idx_planner_food_drinks_wedding_id on public.planner_food_drinks(wedding_id);
create index if not exists idx_planner_google_calendar_connections_wedding_id on public.planner_google_calendar_connections(wedding_id);
create index if not exists idx_planner_honeymoon_items_wedding_id on public.planner_honeymoon_items(wedding_id);

alter table public.planner_events enable row level security;
alter table public.planner_food_drinks enable row level security;
alter table public.planner_google_calendar_connections enable row level security;
alter table public.planner_honeymoon_items enable row level security;

drop policy if exists "users_can_manage_planner_events" on public.planner_events;
create policy "users_can_manage_planner_events" on public.planner_events
for all
to authenticated
using (exists (select 1 from public.weddings w where w.id = planner_events.wedding_id and w.user_id = auth.uid()))
with check (exists (select 1 from public.weddings w where w.id = planner_events.wedding_id and w.user_id = auth.uid()));

drop policy if exists "users_can_manage_planner_food_drinks" on public.planner_food_drinks;
create policy "users_can_manage_planner_food_drinks" on public.planner_food_drinks
for all
to authenticated
using (exists (select 1 from public.weddings w where w.id = planner_food_drinks.wedding_id and w.user_id = auth.uid()))
with check (exists (select 1 from public.weddings w where w.id = planner_food_drinks.wedding_id and w.user_id = auth.uid()));

drop policy if exists "users_can_manage_planner_honeymoon_items" on public.planner_honeymoon_items;
create policy "users_can_manage_planner_honeymoon_items" on public.planner_honeymoon_items
for all
to authenticated
using (exists (select 1 from public.weddings w where w.id = planner_honeymoon_items.wedding_id and w.user_id = auth.uid()))
with check (exists (select 1 from public.weddings w where w.id = planner_honeymoon_items.wedding_id and w.user_id = auth.uid()));

-- Do not expose OAuth tokens through direct browser table access.
drop policy if exists "users_can_read_own_google_calendar_status" on public.planner_google_calendar_connections;
create policy "users_can_read_own_google_calendar_status" on public.planner_google_calendar_connections
for select
to authenticated
using (false);

notify pgrst, 'reload schema';
