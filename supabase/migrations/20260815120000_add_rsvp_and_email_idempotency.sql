-- Additive idempotency primitives for server-mediated RSVP and transactional email flows.
-- Existing RSVP rows deliberately retain a NULL submission_key: this migration does
-- not rewrite or attempt to deduplicate historical guest records.

alter table public.rsvps
    add column if not exists submission_key text;

create unique index if not exists rsvps_wedding_submission_key_unique
    on public.rsvps (wedding_id, submission_key)
    where submission_key is not null;

comment on column public.rsvps.submission_key is
    'Server-generated SHA-256 key used to atomically deduplicate new public RSVP submissions.';

-- This table contains no recipient address. recipient_key is the selected RSVP id
-- for the delivery and is unique only within a wedding and delivery type.
create table if not exists public.email_delivery_reservations (
    wedding_id text not null references public.weddings(id) on delete cascade,
    delivery_type text not null check (char_length(delivery_type) between 1 and 100),
    recipient_key text not null check (char_length(recipient_key) between 1 and 200),
    status text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
    lease_token uuid not null,
    lease_expires_at timestamptz,
    attempt_count integer not null default 0 check (attempt_count >= 0),
    provider_message_id text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (wedding_id, delivery_type, recipient_key)
);

alter table public.email_delivery_reservations enable row level security;

-- Only server-side service-role calls can use the reservation table/functions.
revoke all on table public.email_delivery_reservations from anon, authenticated;
grant select, insert, update on table public.email_delivery_reservations to service_role;

create or replace function public.claim_email_delivery(
    p_wedding_id text,
    p_delivery_type text,
    p_recipient_key text,
    p_lease_seconds integer default 86400
)
returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
    v_lease_token uuid;
begin
    if p_lease_seconds < 60 or p_lease_seconds > 604800 then
        raise exception 'p_lease_seconds must be between 60 and 604800';
    end if;

    insert into public.email_delivery_reservations as reservation (
        wedding_id,
        delivery_type,
        recipient_key,
        status,
        lease_token,
        lease_expires_at,
        attempt_count
    ) values (
        p_wedding_id,
        p_delivery_type,
        p_recipient_key,
        'sending',
        gen_random_uuid(),
        now() + (p_lease_seconds * interval '1 second'),
        1
    )
    on conflict (wedding_id, delivery_type, recipient_key) do update
        set status = 'sending',
            lease_token = gen_random_uuid(),
            lease_expires_at = now() + (p_lease_seconds * interval '1 second'),
            attempt_count = reservation.attempt_count + 1,
            provider_message_id = null,
            updated_at = now()
        where reservation.status = 'failed'
           or (reservation.status = 'sending' and reservation.lease_expires_at < now())
    returning lease_token into v_lease_token;

    return v_lease_token;
end;
$$;

create or replace function public.complete_email_delivery(
    p_wedding_id text,
    p_delivery_type text,
    p_recipient_key text,
    p_lease_token uuid,
    p_succeeded boolean,
    p_provider_message_id text default null
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
    v_completed boolean;
begin
    update public.email_delivery_reservations
       set status = case when p_succeeded then 'sent' else 'failed' end,
           lease_expires_at = null,
           provider_message_id = case when p_succeeded then p_provider_message_id else null end,
           updated_at = now()
     where wedding_id = p_wedding_id
       and delivery_type = p_delivery_type
       and recipient_key = p_recipient_key
       and lease_token = p_lease_token
       and status = 'sending'
    returning true into v_completed;

    return coalesce(v_completed, false);
end;
$$;

revoke all on function public.claim_email_delivery(text, text, text, integer) from public, anon, authenticated;
revoke all on function public.complete_email_delivery(text, text, text, uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.claim_email_delivery(text, text, text, integer) to service_role;
grant execute on function public.complete_email_delivery(text, text, text, uuid, boolean, text) to service_role;

comment on table public.email_delivery_reservations is
    'Server-only delivery leases that prevent duplicate sends across concurrent API requests.';
