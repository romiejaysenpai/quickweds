-- Avoid direct auth.users reads from RLS. The authenticated JWT already
-- exposes the verified email through auth.email().

begin;

drop policy if exists "collaborators_view_own_invites" on public.wedding_collaborators;

create policy "collaborators_view_own_invites"
    on public.wedding_collaborators
    for select
    to authenticated
    using (lower(email) = lower(auth.email()));

commit;
