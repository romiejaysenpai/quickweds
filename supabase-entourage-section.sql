alter table public.weddings
add column if not exists include_entourage_section boolean not null default true;

comment on column public.weddings.include_entourage_section is
'Controls whether the wedding_party / entourage section appears on the public wedding page.';

create table if not exists public.entourage_invitations (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    member_key text not null check (length(member_key) between 1 and 120),
    name text not null check (length(name) between 1 and 160),
    email text not null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    role text check (role is null or length(role) <= 120),
    message text check (message is null or length(message) <= 2000),
    template_key text not null default 'heartfelt' check (template_key in ('heartfelt', 'elegant', 'simple')),
    status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
    token_hash text,
    sent_at timestamptz,
    responded_at timestamptz,
    created_by_user_id uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (wedding_id, member_key)
);

create index if not exists idx_entourage_invitations_wedding_id
on public.entourage_invitations(wedding_id);

create index if not exists idx_entourage_invitations_email
on public.entourage_invitations(lower(email));

create unique index if not exists idx_entourage_invitations_token_hash
on public.entourage_invitations(token_hash)
where token_hash is not null;

alter table public.entourage_invitations enable row level security;

drop policy if exists "quickweds_entourage_owner_partner_select" on public.entourage_invitations;
create policy "quickweds_entourage_owner_partner_select"
on public.entourage_invitations
for select
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = entourage_invitations.wedding_id
        and w.user_id = (select auth.uid())
    )
    or exists (
        select 1
        from public.wedding_collaborators c
        where c.wedding_id = entourage_invitations.wedding_id
        and lower(c.email) = lower((select auth.email()))
        and c.status = 'accepted'
        and c.role = 'partner'
    )
);

drop policy if exists "quickweds_entourage_owner_partner_manage" on public.entourage_invitations;
create policy "quickweds_entourage_owner_partner_manage"
on public.entourage_invitations
for all
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = entourage_invitations.wedding_id
        and w.user_id = (select auth.uid())
    )
    or exists (
        select 1
        from public.wedding_collaborators c
        where c.wedding_id = entourage_invitations.wedding_id
        and lower(c.email) = lower((select auth.email()))
        and c.status = 'accepted'
        and c.role = 'partner'
    )
)
with check (
    exists (
        select 1
        from public.weddings w
        where w.id = entourage_invitations.wedding_id
        and w.user_id = (select auth.uid())
    )
    or exists (
        select 1
        from public.wedding_collaborators c
        where c.wedding_id = entourage_invitations.wedding_id
        and lower(c.email) = lower((select auth.email()))
        and c.status = 'accepted'
        and c.role = 'partner'
    )
);

notify pgrst, 'reload schema';
