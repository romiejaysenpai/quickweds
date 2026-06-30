-- QuickWeds background music for public wedding invitation pages.
-- Run this once in the Supabase SQL editor before using the builder controls.

alter table public.weddings
    add column if not exists background_music_url text,
    add column if not exists background_music_title text,
    add column if not exists background_music_enabled boolean not null default false;

comment on column public.weddings.background_music_url is 'Public Supabase Storage URL for the invitation background music file.';
comment on column public.weddings.background_music_title is 'Display title for the invitation background music player.';
comment on column public.weddings.background_music_enabled is 'Whether the uploaded background music player should appear on the public invitation page.';
