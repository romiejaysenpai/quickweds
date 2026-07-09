-- QuickWeds Post-Wedding Thank You Card Email Builder
-- Run this in Supabase before using /dashboard/[weddingId]/thank-you.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.thank_you_email_logs (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    rsvp_id uuid references public.rsvps(id) on delete set null,
    recipient_email text not null,
    recipient_name text,
    template_id text not null,
    subject text not null,
    message text not null,
    couple_signature text not null,
    style jsonb not null default '{}'::jsonb,
    photo_url text,
    status text not null check (status in ('sent', 'failed', 'test')),
    provider_message_id text,
    error_message text,
    sent_at timestamptz,
    created_by_user_id uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

create unique index if not exists idx_thank_you_email_logs_unique_sent_email
on public.thank_you_email_logs (wedding_id, lower(recipient_email))
where status = 'sent';

create index if not exists idx_thank_you_email_logs_wedding_created
on public.thank_you_email_logs (wedding_id, created_at desc);

create index if not exists idx_thank_you_email_logs_wedding_status
on public.thank_you_email_logs (wedding_id, status);

create index if not exists idx_thank_you_email_logs_rsvp
on public.thank_you_email_logs (rsvp_id)
where rsvp_id is not null;

grant select, insert, update, delete on public.thank_you_email_logs to service_role;
grant select, insert on public.thank_you_email_logs to authenticated;

alter table public.thank_you_email_logs enable row level security;

drop policy if exists "owners_can_read_thank_you_email_logs" on public.thank_you_email_logs;
create policy "owners_can_read_thank_you_email_logs"
on public.thank_you_email_logs
for select
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = thank_you_email_logs.wedding_id
          and w.user_id = (select auth.uid())
    )
);

drop policy if exists "collaborators_can_read_thank_you_email_logs" on public.thank_you_email_logs;
create policy "collaborators_can_read_thank_you_email_logs"
on public.thank_you_email_logs
for select
to authenticated
using (
    exists (
        select 1
        from public.wedding_collaborators wc
        join auth.users u on u.email = wc.email
        where wc.wedding_id = thank_you_email_logs.wedding_id
          and wc.status = 'accepted'
          and wc.role in ('partner', 'coordinator')
          and u.id = (select auth.uid())
    )
);

drop policy if exists "owners_can_insert_thank_you_email_logs" on public.thank_you_email_logs;
create policy "owners_can_insert_thank_you_email_logs"
on public.thank_you_email_logs
for insert
to authenticated
with check (
    exists (
        select 1
        from public.weddings w
        where w.id = thank_you_email_logs.wedding_id
          and w.user_id = (select auth.uid())
    )
);

drop policy if exists "collaborators_can_insert_thank_you_email_logs" on public.thank_you_email_logs;
create policy "collaborators_can_insert_thank_you_email_logs"
on public.thank_you_email_logs
for insert
to authenticated
with check (
    exists (
        select 1
        from public.wedding_collaborators wc
        join auth.users u on u.email = wc.email
        where wc.wedding_id = thank_you_email_logs.wedding_id
          and wc.status = 'accepted'
          and wc.role in ('partner', 'coordinator')
          and u.id = (select auth.uid())
    )
);

notify pgrst, 'reload schema';
