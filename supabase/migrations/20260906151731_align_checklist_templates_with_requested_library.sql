-- Align already-migrated environments with the requested seven-template
-- library and lock down the RLS helper used for collaborator lookups.

-- Ensure core and template columns exist on planner_tasks
alter table public.planner_tasks
    add column if not exists due_date date,
    add column if not exists assigned_to text,
    add column if not exists notes text,
    add column if not exists section text,
    add column if not exists template_key text,
    add column if not exists planner_vendor_id uuid,
    add column if not exists custom_supplier_name text,
    add column if not exists is_optional boolean not null default false,
    add column if not exists quantity numeric not null default 1,
    add column if not exists responsible_person text,
    add column if not exists location text,
    add column if not exists not_included boolean not null default false,
    add column if not exists source_template_id text,
    add column if not exists source_template_key text,
    add column if not exists box_status text not null default 'not_started',
    add column if not exists sort_order integer not null default 0,
    add column if not exists updated_at timestamptz default now();

create or replace function public.quickweds_is_collaborator(w_id text, u_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    user_email text;
begin
    if u_id is null or u_id is distinct from (select auth.uid()) then
        return false;
    end if;

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

revoke all on function public.quickweds_is_collaborator(text, uuid) from public, anon;
grant execute on function public.quickweds_is_collaborator(text, uuid) to authenticated;

update public.checklist_templates
set is_active = false,
    updated_at = now()
where key = 'master-box';

notify pgrst, 'reload schema';
