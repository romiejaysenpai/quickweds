-- QuickWeds QR Seat Finder + Guest Check-In
-- Run this in Supabase SQL Editor before using QR seat links in production.

create extension if not exists pgcrypto with schema extensions;

alter table public.rsvps
add column if not exists phone text,
add column if not exists seat_lookup_token text,
add column if not exists guest_code text,
add column if not exists seat_link_sent_at timestamptz,
add column if not exists seat_link_last_sent_at timestamptz,
add column if not exists seat_assignment_version integer not null default 0,
add column if not exists checked_in_at timestamptz,
add column if not exists checked_in_by uuid references auth.users(id) on delete set null,
add column if not exists check_in_notes text;

alter table public.weddings
add column if not exists public_seat_finder_token text default (gen_random_uuid())::text,
add column if not exists seat_finder_enabled boolean not null default true,
add column if not exists seat_finder_require_code boolean not null default true,
add column if not exists seat_finder_show_map boolean not null default true;

update public.weddings
set public_seat_finder_token = (gen_random_uuid())::text
where public_seat_finder_token is null;

create table if not exists public.guest_check_ins (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    rsvp_id uuid references public.rsvps(id) on delete set null,
    checked_in_at timestamptz not null default now(),
    checked_in_by uuid references auth.users(id) on delete set null,
    source text not null default 'staff_search' check (source in ('personal_qr', 'public_lookup', 'staff_search')),
    notes text,
    created_at timestamptz not null default now()
);

create unique index if not exists idx_rsvps_seat_lookup_token
on public.rsvps(seat_lookup_token)
where seat_lookup_token is not null;

create index if not exists idx_rsvps_guest_code
on public.rsvps(wedding_id, guest_code)
where guest_code is not null;

create index if not exists idx_rsvps_checked_in
on public.rsvps(wedding_id, checked_in_at);

create index if not exists idx_guest_check_ins_wedding
on public.guest_check_ins(wedding_id, checked_in_at);

alter table public.guest_check_ins enable row level security;

drop policy if exists "owners_can_manage_guest_check_ins" on public.guest_check_ins;
create policy "owners_can_manage_guest_check_ins" on public.guest_check_ins
for all
to authenticated
using (exists (select 1 from public.weddings w where w.id = guest_check_ins.wedding_id and w.user_id = auth.uid()))
with check (exists (select 1 from public.weddings w where w.id = guest_check_ins.wedding_id and w.user_id = auth.uid()));

notify pgrst, 'reload schema';
