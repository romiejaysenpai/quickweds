begin;

alter table public.weddings add column if not exists event_timezone text not null default 'UTC';
alter table public.weddings add column if not exists completed_at timestamptz;
alter table public.weddings add column if not exists archived_at timestamptz;
alter table public.weddings add column if not exists operations_settings jsonb not null default '{}'::jsonb;
alter table public.rsvps add column if not exists invited_party_size integer;
alter table public.rsvps add column if not exists responded_at timestamptz;
alter table public.rsvps add column if not exists response_version integer not null default 0;
alter table public.rsvps add column if not exists attendees jsonb not null default '[]'::jsonb;
alter table public.planner_vendors add column if not exists paid_amount numeric check (paid_amount >= 0);
alter table public.planner_budgets add column if not exists planner_vendor_id uuid references public.planner_vendors(id) on delete set null;

-- Private application records. API handlers validate wedding access before using service_role.
create table public.wedding_operations (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    kind text not null check (kind in ('task','vendor_brief','payment','incident','helper','closeout','audit')),
    title text not null,
    owner_email text,
    due_at timestamptz,
    status text not null default 'pending',
    data jsonb not null default '{}'::jsonb,
    token_hash text unique,
    version integer not null default 1,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index wedding_operations_attention on public.wedding_operations(wedding_id, status, due_at);
alter table public.wedding_operations enable row level security;
revoke all on public.wedding_operations from anon, authenticated;
grant all on public.wedding_operations to service_role;

create table public.wedding_deliveries (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    recipient text not null,
    kind text not null,
    dedupe_key text not null unique,
    payload jsonb not null,
    due_at timestamptz not null,
    status text not null default 'queued' check (status in ('queued','processing','accepted','failed','cancelled')),
    attempts integer not null default 0,
    last_error text,
    provider_id text,
    locked_at timestamptz,
    created_at timestamptz not null default now()
);
create index wedding_deliveries_due on public.wedding_deliveries(status, due_at);
alter table public.wedding_deliveries enable row level security;
revoke all on public.wedding_deliveries from anon, authenticated;
grant all on public.wedding_deliveries to service_role;

create table public.planning_playbooks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    tasks jsonb not null,
    created_at timestamptz not null default now()
);
alter table public.planning_playbooks enable row level security;
revoke all on public.planning_playbooks from anon, authenticated;
grant all on public.planning_playbooks to service_role;

create or replace function public.qw_respond_to_invitation(p_wedding text, p_token text, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare guest public.rsvps; wedding public.weddings; max_party integer;
begin
    select * into wedding from public.weddings where id = p_wedding and is_published and deleted_at is null;
    if not found then raise exception 'Invitation unavailable'; end if;
    if wedding.rsvp_deadline is not null and now() > ((wedding.rsvp_deadline::date + 1)::timestamp at time zone wedding.event_timezone) then
        raise exception 'RSVP deadline has passed';
    end if;
    select * into guest from public.rsvps where wedding_id = p_wedding and seat_lookup_token = p_token for update;
    if not found then raise exception 'Invitation unavailable'; end if;
    if p_data->>'response_version' is not null and (p_data->>'response_version')::integer <> guest.response_version then raise exception 'Response changed. Refresh before editing.'; end if;
    max_party := coalesce(guest.invited_party_size, greatest(coalesce(guest.num_guests,1), case when guest.plus_one_allowed then 2 else 1 end));
    if (p_data->>'num_guests')::integer > max_party then raise exception 'Party exceeds invitation allowance'; end if;
    insert into public.wedding_operations(wedding_id,kind,title,status,data)
    values(p_wedding,'audit','Guest RSVP updated','done',jsonb_build_object('guestId',guest.id,'previousAttendance',guest.attendance,'previousCount',guest.num_guests,'attendance',p_data->>'attendance','count',p_data->'num_guests'));
    if (guest.num_guests is distinct from (p_data->>'num_guests')::integer or guest.attendance is distinct from p_data->>'attendance') and exists(select 1 from public.seating_assignments where rsvp_id=guest.id) then
        insert into public.wedding_operations(wedding_id,kind,title,data) values(p_wedding,'task','Review seating after RSVP change',jsonb_build_object('guestId',guest.id,'guestName',guest.guest_name));
    end if;
    update public.rsvps set
        attendance = p_data->>'attendance', rsvp_status = p_data->>'rsvp_status',
        num_guests = (p_data->>'num_guests')::integer,
        guest_email = nullif(p_data->>'guest_email',''),
        meal_preference = p_data->>'meal_preference', dietary_details = p_data->>'dietary_details',
        message = p_data->>'message', plus_one_names = p_data->>'plus_one_names',
        plus_one_name = p_data->>'plus_one_name', plus_one_rsvp_status = p_data->>'plus_one_rsvp_status',
        children_count = coalesce((p_data->>'children_count')::integer,0),
        household_name = p_data->>'household_name',
        household_members = coalesce(p_data->'household_members','[]'::jsonb),
        attendees = coalesce(p_data->'attendees','[]'::jsonb),
        event_responses = coalesce(p_data->'event_responses','[]'::jsonb),
        invited_party_size = max_party, responded_at = now(), response_version = response_version + 1
    where id = guest.id returning * into guest;
    return to_jsonb(guest);
end $$;
revoke execute on function public.qw_respond_to_invitation(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.qw_respond_to_invitation(text,text,jsonb) to service_role;

create or replace function public.qw_assign_seat(p_wedding text, p_guest uuid, p_table uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare guest public.rsvps; target public.seating_tables; used integer; party integer;
begin
    -- One lock per wedding serializes cross-table moves and avoids deadlocks.
    perform 1 from public.weddings where id = p_wedding for update;
    select * into guest from public.rsvps where id = p_guest and wedding_id = p_wedding for update;
    if not found then raise exception 'Guest unavailable'; end if;
    if p_table is null then
        delete from public.seating_assignments where rsvp_id = p_guest and wedding_id = p_wedding;
        update public.rsvps set table_assignment = null where id = p_guest;
        return;
    end if;
    select * into target from public.seating_tables where id = p_table and wedding_id = p_wedding for update;
    if not found then raise exception 'Table unavailable'; end if;
    party := greatest(coalesce(guest.num_guests,1),case when guest.plus_one_allowed and nullif(guest.plus_one_name,'') is not null and guest.plus_one_rsvp_status is distinct from 'declined' then 2 else 1 end);
    select coalesce(sum(greatest(coalesce(r.num_guests,1),case when r.plus_one_allowed and nullif(r.plus_one_name,'') is not null and r.plus_one_rsvp_status is distinct from 'declined' then 2 else 1 end)),0)
      into used from public.seating_assignments a join public.rsvps r on r.id = a.rsvp_id
      where a.table_id = p_table and a.rsvp_id <> p_guest;
    if used + party > target.capacity then raise exception 'Table capacity changed. Choose another table.'; end if;
    delete from public.seating_assignments where rsvp_id = p_guest and wedding_id = p_wedding;
    insert into public.seating_assignments(wedding_id,table_id,rsvp_id,guest_name,guest_email)
      values(p_wedding,p_table,p_guest,guest.guest_name,guest.guest_email);
    update public.rsvps set table_assignment = target.table_name where id = p_guest;
end $$;
revoke execute on function public.qw_assign_seat(text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.qw_assign_seat(text,uuid,uuid) to service_role;

create or replace function public.qw_update_seating_table(p_wedding text,p_table uuid,p_name text,p_shape text,p_capacity integer)
returns public.seating_tables language plpgsql security invoker set search_path=public as $$
declare target public.seating_tables; used integer;
begin
    perform 1 from public.weddings where id=p_wedding for update;
    select * into target from public.seating_tables where id=p_table and wedding_id=p_wedding for update;
    if target.id is null then raise exception 'table not found'; end if;
    select coalesce(sum(greatest(1,r.num_guests)),0)::integer into used from public.seating_assignments a join public.rsvps r on r.id=a.rsvp_id where a.table_id=p_table;
    if p_capacity < used then raise exception 'capacity below assigned party total'; end if;
    update public.seating_tables set table_name=p_name,table_shape=p_shape,capacity=p_capacity,updated_at=now() where id=p_table returning * into target;
    update public.rsvps r set table_assignment=p_name from public.seating_assignments a where a.rsvp_id=r.id and a.table_id=p_table;
    return target;
end $$;
revoke all on function public.qw_update_seating_table(text,uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.qw_update_seating_table(text,uuid,text,text,integer) to service_role;

create or replace function public.qw_delete_seating_table(p_wedding text,p_table uuid)
returns void language plpgsql security invoker set search_path=public as $$
begin
    perform 1 from public.weddings where id=p_wedding for update;
    if not exists(select 1 from public.seating_tables where id=p_table and wedding_id=p_wedding for update) then raise exception 'table not found'; end if;
    update public.rsvps r set table_assignment=null from public.seating_assignments a where a.rsvp_id=r.id and a.table_id=p_table;
    delete from public.seating_assignments where table_id=p_table and wedding_id=p_wedding;
    delete from public.seating_tables where id=p_table and wedding_id=p_wedding;
end $$;
revoke all on function public.qw_delete_seating_table(text,uuid) from public,anon,authenticated;
grant execute on function public.qw_delete_seating_table(text,uuid) to service_role;

create or replace function public.qw_claim_deliveries(p_limit integer default 25)
returns setof public.wedding_deliveries language sql security invoker set search_path = '' as $$
    update public.wedding_deliveries set status='processing', locked_at=now(), attempts=attempts+1
    where id in (
        select id from public.wedding_deliveries
        where due_at <= now() and attempts < 5 and (status in ('queued','failed') or (status='processing' and locked_at < now()-interval '10 minutes'))
        order by due_at for update skip locked limit least(p_limit,50)
    ) returning *;
$$;
revoke execute on function public.qw_claim_deliveries(integer) from public, anon, authenticated;
grant execute on function public.qw_claim_deliveries(integer) to service_role;
create table public.wedding_drafts (
    user_id uuid not null references auth.users(id) on delete cascade,
    draft_key text not null,
    data jsonb not null,
    updated_at timestamptz not null default now(),
    primary key(user_id,draft_key)
);
alter table public.wedding_drafts enable row level security;
revoke all on public.wedding_drafts from anon,authenticated;
grant all on public.wedding_drafts to service_role;

create or replace function public.qw_record_payment(p_wedding text,p_vendor uuid,p_amount numeric,p_title text,p_user uuid,p_key uuid)
returns uuid language plpgsql security invoker set search_path='' as $$
declare vendor public.planner_vendors; payment_id uuid; total_paid numeric;
begin
    if p_amount <= 0 then raise exception 'Amount must be positive'; end if;
    select * into vendor from public.planner_vendors where id=p_vendor and wedding_id=p_wedding for update;
    if not found then raise exception 'Vendor unavailable'; end if;
    select id into payment_id from public.wedding_operations where id=p_key and wedding_id=p_wedding and kind='payment';
    if found then return payment_id; end if;
    total_paid := coalesce(vendor.paid_amount,case when lower(vendor.payment_status)='paid' then vendor.amount else 0 end) + p_amount;
    if total_paid > vendor.amount then raise exception 'Payments would exceed the recorded contract total'; end if;
    insert into public.wedding_operations(id,wedding_id,kind,title,status,data,created_by)
      values(p_key,p_wedding,'payment',p_title,'done',jsonb_build_object('vendorId',p_vendor,'amount',p_amount),p_user) returning id into payment_id;
    update public.planner_vendors set paid_amount=total_paid,payment_status=case when total_paid>=amount then 'paid' else 'pending' end where id=p_vendor;
    return payment_id;
end $$;
revoke execute on function public.qw_record_payment(text,uuid,numeric,text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.qw_record_payment(text,uuid,numeric,text,uuid,uuid) to service_role;
create or replace function public.qw_rebase_tasks(p_wedding text,p_date date,p_expected_date text,p_ids uuid[])
returns void language plpgsql security invoker set search_path='' as $$
declare original date; delta integer;
begin
    select wedding_date into original from public.weddings where id=p_wedding for update;
    if original is null or original::text <> p_expected_date then raise exception 'Wedding date changed. Preview again.'; end if;
    delta := p_date-original;
    update public.wedding_operations set due_at=due_at+delta*interval '1 day',version=version+1,updated_at=now()
      where wedding_id=p_wedding and id=any(p_ids) and kind='task' and status='pending';
    update public.weddings set wedding_date=p_date where id=p_wedding;
    -- Approved queued messages refer to the old plan: require explicit rescheduling.
    update public.wedding_deliveries set status='cancelled' where wedding_id=p_wedding and status in ('queued','failed');
    insert into public.wedding_operations(wedding_id,kind,title,data) values(p_wedding,'task','Review supplier briefings and reminders after date change',jsonb_build_object('previousDate',original,'newDate',p_date));
end $$;
revoke execute on function public.qw_rebase_tasks(text,date,text,uuid[]) from public,anon,authenticated;
grant execute on function public.qw_rebase_tasks(text,date,text,uuid[]) to service_role;
create table public.product_events(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete set null,wedding_id text references public.weddings(id) on delete cascade,event text not null,created_at timestamptz not null default now());
create index product_events_funnel on public.product_events(event,created_at);
alter table public.product_events enable row level security;
revoke all on public.product_events from anon,authenticated;
grant all on public.product_events to service_role;
commit;
