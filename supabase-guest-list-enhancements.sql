alter table public.rsvps
    add column if not exists guest_group text,
    add column if not exists table_assignment text,
    add column if not exists invitation_sent boolean not null default false,
    add column if not exists invitation_sent_at timestamptz,
    add column if not exists plus_one_allowed boolean not null default false,
    add column if not exists plus_one_name text,
    add column if not exists plus_one_email text,
    add column if not exists plus_one_rsvp_status text not null default 'not_invited';

do $$
begin
    begin
        alter table public.rsvps
            add constraint rsvps_guest_group_check
            check (guest_group is null or guest_group in (
                'bride_family',
                'groom_family',
                'bride_friends',
                'groom_friends',
                'mutual',
                'coworkers',
                'vip',
                'vendors'
            ));
    exception
        when duplicate_object then null;
    end;

    begin
        alter table public.rsvps
            add constraint rsvps_plus_one_rsvp_status_check
            check (plus_one_rsvp_status in ('not_invited', 'invited', 'confirmed', 'declined'));
    exception
        when duplicate_object then null;
    end;
end $$;

update public.rsvps
set plus_one_allowed = true
where coalesce(num_guests, 1) > 1
   or coalesce(nullif(trim(plus_one_names), ''), '') <> '';

update public.rsvps
set plus_one_name = nullif(split_part(plus_one_names, ',', 1), '')
where plus_one_name is null
  and coalesce(nullif(trim(plus_one_names), ''), '') <> '';

update public.rsvps r
set table_assignment = st.table_name
from public.seating_assignments sa
join public.seating_tables st on st.id = sa.table_id
where sa.rsvp_id = r.id
  and (r.table_assignment is null or r.table_assignment = '');

create index if not exists idx_rsvps_wedding_group on public.rsvps (wedding_id, guest_group);
create index if not exists idx_rsvps_wedding_invitation_sent on public.rsvps (wedding_id, invitation_sent);
create index if not exists idx_rsvps_wedding_table_assignment on public.rsvps (wedding_id, table_assignment);
