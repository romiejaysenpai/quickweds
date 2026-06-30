-- QuickWeds launch hardening / public wedding page repair
-- Safe to rerun. Keeps existing /w/{id} links working and adds stable /w/{slug} links.

alter table public.weddings
    add column if not exists public_slug text,
    add column if not exists custom_domain text,
    add column if not exists faq_items jsonb default '[]'::jsonb,
    add column if not exists is_save_the_date boolean default false,
    add column if not exists voice_greeting_url text,
    add column if not exists couple_email text;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'weddings_public_slug_format'
          and conrelid = 'public.weddings'::regclass
    ) then
        alter table public.weddings
            add constraint weddings_public_slug_format
            check (
                public_slug is null
                or (
                    public_slug ~ '^[a-z0-9][a-z0-9-]{2,79}$'
                    and public_slug !~ '--'
                    and public_slug not in (
                        'admin',
                        'api',
                        'auth',
                        'builder',
                        'dashboard',
                        'login',
                        'logout',
                        'privacy',
                        'qr',
                        'signup',
                        'supplier',
                        'suppliers',
                        'terms',
                        'w'
                    )
                )
            ) not valid;
    end if;
end $$;

with slug_candidates as (
    select
        id,
        left(
            trim(both '-' from regexp_replace(
                regexp_replace(
                    lower(
                        concat_ws(
                            ' and ',
                            nullif(trim(bride_name), ''),
                            nullif(trim(groom_name), '')
                        )
                    ),
                    '&',
                    ' and ',
                    'g'
                ),
                '[^a-z0-9]+',
                '-',
                'g'
            )),
            64
        ) as base_slug
    from public.weddings
    where public_slug is null
),
normalized as (
    select
        id,
        case
            when base_slug is null or length(base_slug) < 3 then 'wedding'
            when base_slug in (
                'admin',
                'api',
                'auth',
                'builder',
                'dashboard',
                'login',
                'logout',
                'privacy',
                'qr',
                'signup',
                'supplier',
                'suppliers',
                'terms',
                'w'
            ) then 'wedding'
            else base_slug
        end as base_slug
    from slug_candidates
)
update public.weddings w
set public_slug = normalized.base_slug || '-' || lower(left(regexp_replace(w.id, '[^a-zA-Z0-9]', '', 'g'), 6))
from normalized
where w.id = normalized.id
  and w.public_slug is null;

create unique index if not exists weddings_public_slug_unique_idx
    on public.weddings (public_slug)
    where public_slug is not null;

create index if not exists weddings_public_slug_lookup_idx
    on public.weddings (public_slug)
    where public_slug is not null
      and deleted_at is null;

alter table public.weddings validate constraint weddings_public_slug_format;

notify pgrst, 'reload schema';
