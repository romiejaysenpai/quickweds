begin;

create table if not exists public.photo_upload_intents (
    id uuid primary key,
    wedding_id text not null references public.weddings(id) on delete cascade,
    sharing_code_id uuid not null references public.photo_sharing_codes(id) on delete cascade,
    object_path text not null unique,
    public_url text not null,
    uploader_name text not null,
    caption text,
    guest_identifier text not null,
    file_type text not null,
    file_size integer not null check (file_size > 0),
    code_limit integer not null check (code_limit > 0),
    guest_limit integer check (guest_limit is null or guest_limit > 0),
    auto_approve boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
    status text not null default 'pending' check (status in ('pending', 'completed')),
    photo_id uuid references public.wedding_photos(id) on delete set null,
    expires_at timestamptz not null,
    completed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists photo_upload_intents_pending_expiry_idx
    on public.photo_upload_intents (expires_at)
    where status = 'pending';

alter table public.photo_upload_intents enable row level security;
revoke all on table public.photo_upload_intents from anon, authenticated;

create or replace function public.complete_photo_upload_intent(p_intent_id uuid)
returns table(success boolean, already_completed boolean, wedding_id text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    intent public.photo_upload_intents%rowtype;
    inserted_photo_id uuid;
begin
    select * into intent
    from public.photo_upload_intents
    where id = p_intent_id
    for update;

    if not found then
        raise exception 'This upload has expired. Please select the photo again.';
    end if;
    if intent.status = 'completed' then
        return query select true, true, intent.wedding_id;
        return;
    end if;
    if intent.expires_at <= now() then
        raise exception 'This upload link has expired. Please select the photo again.';
    end if;

    perform 1 from storage.objects where bucket_id = 'quickweds' and name = intent.object_path;
    if not found then
        raise exception 'The photo was not received by storage. Please retry.';
    end if;

    perform 1
    from public.photo_sharing_codes
    where id = intent.sharing_code_id
      and wedding_id = intent.wedding_id
      and is_active = true
    for update;
    if not found then
        raise exception 'This sharing code is no longer active.';
    end if;
    if (select current_uploads from public.photo_sharing_codes where id = intent.sharing_code_id) >= intent.code_limit then
        raise exception 'This sharing code has reached its upload limit.';
    end if;
    if intent.guest_limit is not null and exists (
        select 1
        from public.wedding_photos
        where wedding_id = intent.wedding_id
          and guest_identifier = intent.guest_identifier
          and status <> 'rejected'
        group by wedding_id, guest_identifier
        having count(*) >= intent.guest_limit
    ) then
        raise exception 'You have reached the photo limit for this roll.';
    end if;

    insert into public.wedding_photos (
        wedding_id, uploader_name, cloudinary_url, cloudinary_public_id,
        caption, message, guest_identifier, upload_source, status,
        is_approved, approved_at, file_size, metadata
    ) values (
        intent.wedding_id, intent.uploader_name, intent.public_url, intent.object_path,
        intent.caption, intent.caption, intent.guest_identifier, 'guest_upload',
        case when intent.auto_approve then 'approved' else 'pending' end,
        intent.auto_approve, case when intent.auto_approve then now() else null end,
        intent.file_size, intent.metadata || jsonb_build_object('file_type', intent.file_type, 'file_size', intent.file_size)
    ) returning id into inserted_photo_id;

    update public.photo_sharing_codes set current_uploads = current_uploads + 1 where id = intent.sharing_code_id;
    update public.photo_upload_intents
    set status = 'completed', photo_id = inserted_photo_id, completed_at = now()
    where id = intent.id;
    return query select true, false, intent.wedding_id;
end;
$$;

revoke all on function public.complete_photo_upload_intent(uuid) from public;
grant execute on function public.complete_photo_upload_intent(uuid) to service_role;

revoke all on function public.reserve_photo_upload(uuid, integer) from public;
revoke all on function public.release_photo_upload_reservation(uuid) from public;
grant execute on function public.reserve_photo_upload(uuid, integer) to service_role;
grant execute on function public.release_photo_upload_reservation(uuid) to service_role;

commit;
