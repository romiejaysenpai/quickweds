-- QuickWeds public-data hardening.
--
-- Public RSVP and guest-book interactions already go through authenticated or
-- service-role server routes. These legacy policies bypass those routes and
-- expose every RSVP/guest-book row through the Data API.
--
-- This migration deliberately leaves owner/collaborator policies, public API
-- routes, wedding URLs, RSVP URLs, and storage policies unchanged.

begin;

drop policy if exists "anyone_can_view_rsvps" on public.rsvps;
drop policy if exists "Enable insert for all" on public.guest_book;
drop policy if exists "Enable read access for all" on public.guest_book;

commit;

-- Rollback (run only if the server routes must be bypassed temporarily):
--
-- begin;
-- create policy "anyone_can_view_rsvps"
--     on public.rsvps for select to public using (true);
-- create policy "Enable insert for all"
--     on public.guest_book for insert to public with check (true);
-- create policy "Enable read access for all"
--     on public.guest_book for select to public using (true);
-- commit;
