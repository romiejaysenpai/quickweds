-- Additive website strategy and RSVP embed configuration.
-- Existing weddings retain the current QuickWeds-hosted website behavior.

alter table public.user_app_profiles
    add column if not exists website_mode text;

alter table public.user_app_profiles
    drop constraint if exists user_app_profiles_website_mode_check;

alter table public.user_app_profiles
    add constraint user_app_profiles_website_mode_check
    check (website_mode in ('quickweds', 'external', 'private') or website_mode is null);

alter table public.weddings
    add column if not exists website_mode text not null default 'quickweds',
    add column if not exists external_website_url text,
    add column if not exists external_platform text,
    add column if not exists rsvp_embed_enabled boolean not null default false;

alter table public.weddings
    drop constraint if exists weddings_website_mode_check;

alter table public.weddings
    add constraint weddings_website_mode_check
    check (website_mode in ('quickweds', 'external', 'private'));

comment on column public.user_app_profiles.website_mode is
    'Initial onboarding preference: QuickWeds-hosted site, external site, or private planning.';
comment on column public.weddings.website_mode is
    'Per-wedding website strategy. Existing weddings default to QuickWeds-hosted.';
comment on column public.weddings.external_website_url is
    'Optional website where the couple intends to place the QuickWeds RSVP embed.';
comment on column public.weddings.external_platform is
    'Optional website builder label such as gohighlevel, systeme, wordpress, canva, or other.';
comment on column public.weddings.rsvp_embed_enabled is
    'Explicit owner-controlled switch for rendering this wedding in the public RSVP embed route.';

notify pgrst, 'reload schema';
