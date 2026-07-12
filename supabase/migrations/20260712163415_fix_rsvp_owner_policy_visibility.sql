-- The legacy owners_can_view_rsvps policy reads auth.users directly.
-- Authenticated Data API roles cannot SELECT auth.users, so every RSVP query
-- can fail with permission denied after the old public read policy was removed.
-- Valid owner and accepted-collaborator SELECT policies already exist, making
-- this duplicate policy both unsafe and unnecessary.

begin;

drop policy if exists "owners_can_view_rsvps" on public.rsvps;

commit;
