-- Browser code must not retain a general write policy for the QuickWeds
-- bucket. Authenticated uploads are now authorized per object by
-- /api/uploads/prepare, which issues a short-lived signed upload token.
--
-- Validate these policy names in staging before considering this migration for
-- production. Public read access remains unchanged because existing invitation
-- and supplier media URLs are public by design.

begin;

do $$
begin
    if not exists (select 1 from storage.buckets where id = 'quickweds') then
        raise exception 'The quickweds storage bucket must exist before applying this migration.';
    end if;
end;
$$;

-- The server-side route enforces purpose-specific limits. The bucket limit
-- must accommodate the builder's supported video size; public and supplier
-- paths remain limited by their respective API validation.
update storage.buckets
set
    file_size_limit = 52428800,
    allowed_mime_types = array[
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm',
        'audio/aac', 'audio/flac', 'audio/m4a', 'audio/mp4',
        'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm',
        'audio/x-m4a', 'audio/x-wav'
    ]::text[]
where id = 'quickweds';

-- Legacy policies created by the historical setup scripts. Remove only write
-- policies; public object delivery is governed by the bucket's existing public
-- setting and is intentionally preserved.
drop policy if exists "authenticated_upload_quickweds_media" on storage.objects;
drop policy if exists "authenticated_update_own_quickweds_media" on storage.objects;
drop policy if exists "quickweds_authenticated_own_prefix_insert" on storage.objects;
drop policy if exists "quickweds_authenticated_own_prefix_update" on storage.objects;
drop policy if exists "quickweds_authenticated_own_prefix_delete" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Auth Uploads" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;

-- Fail closed if a prior setup used a differently named QuickWeds-specific
-- authenticated write policy. This leaves read-only policies untouched.
do $$
declare
    policy_record record;
begin
    for policy_record in
        select policyname
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
          and (
              policyname ilike '%quickweds%'
              or coalesce(qual, '') ilike '%quickweds%'
              or coalesce(with_check, '') ilike '%quickweds%'
          )
    loop
        execute format('drop policy if exists %I on storage.objects', policy_record.policyname);
    end loop;
end;
$$;

commit;
