-- QuickWeds staged production hardening
-- Run this only after deploying the app-side public APIs in this branch.
-- Test on a Supabase branch/dev project first, then run advisors before production.

-- 1) High-value indexes from Supabase advisors.
create index concurrently if not exists idx_guest_book_wedding_id on public.guest_book(wedding_id);
create index concurrently if not exists idx_guest_check_ins_checked_in_by on public.guest_check_ins(checked_in_by);
create index concurrently if not exists idx_guest_check_ins_rsvp_id on public.guest_check_ins(rsvp_id);
create index concurrently if not exists idx_planner_budgets_wedding_id on public.planner_budgets(wedding_id);
create index concurrently if not exists idx_planner_tasks_wedding_id on public.planner_tasks(wedding_id);
create index concurrently if not exists idx_planner_tasks_planner_vendor_id on public.planner_tasks(planner_vendor_id);
create index concurrently if not exists idx_planner_vendors_directory_supplier_id on public.planner_vendors(directory_supplier_id);
create index concurrently if not exists idx_rsvp_reminders_rsvp_id on public.rsvp_reminders(rsvp_id);
create index concurrently if not exists idx_rsvps_checked_in_by on public.rsvps(checked_in_by);
create index concurrently if not exists idx_seating_assignments_rsvp_id on public.seating_assignments(rsvp_id);
create index concurrently if not exists idx_user_notifications_wedding_id on public.user_notifications(wedding_id);
create index concurrently if not exists idx_wedding_collaborators_lookup on public.wedding_collaborators(wedding_id, lower(email), status, role);
create index concurrently if not exists idx_rsvps_wedding_guest_code on public.rsvps(wedding_id, upper(guest_code));
create index concurrently if not exists idx_rsvps_seat_lookup_token on public.rsvps(seat_lookup_token);
create index concurrently if not exists idx_photo_sharing_codes_lookup on public.photo_sharing_codes(wedding_id, code, is_active);

-- 2) Storage bucket limits. Keep the bucket public so existing image URLs continue rendering.
update storage.buckets
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']::text[]
where id = 'quickweds';

drop policy if exists "Allow public read access" on storage.objects;
drop policy if exists "Public View" on storage.objects;
drop policy if exists "public_read_quickweds_media" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Auth Uploads" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;

create policy "quickweds_authenticated_own_prefix_select"
on storage.objects for select to authenticated
using (bucket_id = 'quickweds' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "quickweds_authenticated_own_prefix_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'quickweds' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "quickweds_authenticated_own_prefix_update"
on storage.objects for update to authenticated
using (bucket_id = 'quickweds' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'quickweds' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "quickweds_authenticated_own_prefix_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'quickweds' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 3) Remove anonymous table access now replaced by server-side public APIs.
drop policy if exists "Public can view weddings" on public.weddings;
drop policy if exists "Authenticated can view weddings" on public.weddings;
drop policy if exists "anyone_can_view_weddings" on public.weddings;
drop policy if exists "Public can insert rsvps" on public.rsvps;
drop policy if exists "Authenticated can insert rsvps" on public.rsvps;
drop policy if exists "anyone_can_submit_rsvp" on public.rsvps;
drop policy if exists "anyone_can_view_rsvps" on public.rsvps;
drop policy if exists "Public can view guest book" on public.guest_book;
drop policy if exists "Public can sign guest book" on public.guest_book;
drop policy if exists "Public can view approved wedding photos" on public.wedding_photos;
drop policy if exists "Public can insert wedding photos" on public.wedding_photos;
drop policy if exists "Public can view active photo sharing codes" on public.photo_sharing_codes;

-- 4) Owner/collaborator policies for core app tables. Keep direct authenticated app flows working.
drop policy if exists "quickweds_weddings_owner_select" on public.weddings;
drop policy if exists "quickweds_weddings_owner_insert" on public.weddings;
drop policy if exists "quickweds_weddings_owner_update" on public.weddings;
drop policy if exists "quickweds_weddings_owner_delete" on public.weddings;

create policy "quickweds_weddings_owner_select"
on public.weddings for select to authenticated
using (user_id = (select auth.uid()));

create policy "quickweds_weddings_owner_insert"
on public.weddings for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "quickweds_weddings_owner_update"
on public.weddings for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "quickweds_weddings_owner_delete"
on public.weddings for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "quickweds_rsvps_owner_select" on public.rsvps;
drop policy if exists "quickweds_rsvps_owner_manage" on public.rsvps;

create policy "quickweds_rsvps_owner_select"
on public.rsvps for select to authenticated
using (
  exists (
    select 1
    from public.weddings w
    where w.id = rsvps.wedding_id
      and w.user_id = (select auth.uid())
  )
);

create policy "quickweds_rsvps_owner_manage"
on public.rsvps for all to authenticated
using (
  exists (
    select 1
    from public.weddings w
    where w.id = rsvps.wedding_id
      and w.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.weddings w
    where w.id = rsvps.wedding_id
      and w.user_id = (select auth.uid())
  )
);

-- 5) Security-definer functions: set fixed search_path and remove public RPC access.
alter function if exists public.check_analytics_abuse() set search_path = public, pg_temp;
alter function if exists public.set_updated_at_timestamp() set search_path = public, pg_temp;
alter function if exists public.check_is_wedding_owner(text, uuid) set search_path = public, pg_temp;
alter function if exists public.check_is_wedding_collaborator(text, uuid) set search_path = public, pg_temp;
alter function if exists public.cleanup_old_analytics() set search_path = public, pg_temp;

revoke execute on function public.check_is_wedding_owner(text, uuid) from anon, authenticated;
revoke execute on function public.check_is_wedding_collaborator(text, uuid) from anon, authenticated;
revoke execute on function public.quickweds_is_collaborator(text, uuid) from anon, authenticated;
revoke execute on function public.quickweds_is_partner_collaborator(text, uuid) from anon, authenticated;
revoke execute on function public.on_auth_signup() from anon, authenticated;

-- 6) Tables flagged as RLS-enabled with no policy should remain inaccessible to anon/authenticated unless explicitly needed.
revoke all on public.daily_error_fix_issues from anon, authenticated;
revoke all on public.daily_error_fix_reports from anon, authenticated;
revoke all on public.marketing_email_sends from anon, authenticated;
revoke all on public.user_marketing_campaigns from anon, authenticated;

-- 7) Re-run Supabase security and performance advisors after this script.
