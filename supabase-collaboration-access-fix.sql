-- Collaboration Access schema repair
-- Run this in Supabase SQL Editor if collaborator invites show schema cache errors.

alter table public.wedding_collaborators
add column if not exists invited_by_user_id uuid;

update public.wedding_collaborators
set email = lower(email)
where email <> lower(email);

with ranked_collaborators as (
    select
        id,
        row_number() over (
            partition by wedding_id, email
            order by
                case when status = 'accepted' then 0 else 1 end,
                created_at desc nulls last,
                id
        ) as row_number
    from public.wedding_collaborators
)
delete from public.wedding_collaborators
where id in (
    select id
    from ranked_collaborators
    where row_number > 1
);

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'wedding_collaborators_wedding_id_email_key'
    ) then
        alter table public.wedding_collaborators
        add constraint wedding_collaborators_wedding_id_email_key unique (wedding_id, email);
    end if;
end $$;

create or replace function public.quickweds_is_collaborator(w_id text, u_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    user_email text;
begin
    select email into user_email from auth.users where id = u_id;

    return exists (
        select 1
        from public.wedding_collaborators
        where wedding_id = w_id
        and lower(email) = lower(user_email)
        and status = 'accepted'
    );
end;
$$;

create or replace function public.quickweds_is_partner_collaborator(w_id text, u_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    user_email text;
begin
    select email into user_email from auth.users where id = u_id;

    return exists (
        select 1
        from public.wedding_collaborators
        where wedding_id = w_id
        and lower(email) = lower(user_email)
        and status = 'accepted'
        and role = 'partner'
    );
end;
$$;

alter table public.weddings enable row level security;
alter table public.wedding_collaborators enable row level security;

drop policy if exists "quickweds_collaborators_can_view_weddings" on public.weddings;
create policy "quickweds_collaborators_can_view_weddings"
on public.weddings
for select
to authenticated
using (public.quickweds_is_collaborator(id, auth.uid()));

drop policy if exists "quickweds_partners_can_update_weddings" on public.weddings;
create policy "quickweds_partners_can_update_weddings"
on public.weddings
for update
to authenticated
using (public.quickweds_is_partner_collaborator(id, auth.uid()))
with check (public.quickweds_is_partner_collaborator(id, auth.uid()));

drop policy if exists "quickweds_invitees_can_view_own_invites" on public.wedding_collaborators;
create policy "quickweds_invitees_can_view_own_invites"
on public.wedding_collaborators
for select
to authenticated
using (lower(email) = lower(auth.email()));

drop policy if exists "quickweds_invitees_can_accept_own_invites" on public.wedding_collaborators;
create policy "quickweds_invitees_can_accept_own_invites"
on public.wedding_collaborators
for update
to authenticated
using (lower(email) = lower(auth.email()))
with check (lower(email) = lower(auth.email()));

notify pgrst, 'reload schema';
