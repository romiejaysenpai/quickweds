-- Adds optional visual style variants for existing QuickWeds templates.
-- This preserves the current template IDs while allowing opt-in reference-inspired looks.

alter table public.weddings
add column if not exists template_style text not null default 'default';

comment on column public.weddings.template_style is
'Optional visual variant for the selected template. default preserves the existing template design.';

alter table public.weddings
add column if not exists gallery_layout text not null default 'auto';

comment on column public.weddings.gallery_layout is
'Optional gallery preview layout. auto uses the selected template default.';

alter table public.weddings
add column if not exists reception_venue_name text,
add column if not exists reception_venue_address text,
add column if not exists reception_maps_link text,
add column if not exists reception_venue_photos text[] not null default '{}',
add column if not exists section_title_font_style text not null default 'default',
add column if not exists section_title_color_style text not null default 'motif';

comment on column public.weddings.reception_venue_name is
'Optional reception or main venue name, separate from the ceremony location fields.';

comment on column public.weddings.reception_venue_address is
'Optional reception or main venue address, separate from the ceremony location fields.';

comment on column public.weddings.reception_maps_link is
'Optional public maps link for the reception or main venue.';

comment on column public.weddings.reception_venue_photos is
'Optional public photo URLs for the reception or main venue details section.';

comment on column public.weddings.section_title_font_style is
'Preset id for public wedding section heading typography.';

comment on column public.weddings.section_title_color_style is
'Preset id for public wedding section heading color or gradient styling.';
