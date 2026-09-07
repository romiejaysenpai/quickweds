-- Public wedding routes require an explicit publication state.
-- Preserve the legacy behavior where assigning a public slug made a wedding live.
alter table public.weddings add column if not exists is_published boolean;

update public.weddings
set is_published = coalesce(nullif(trim(public_slug), ''), '') <> ''
where is_published is null;

alter table public.weddings alter column is_published set default false;
alter table public.weddings alter column is_published set not null;
