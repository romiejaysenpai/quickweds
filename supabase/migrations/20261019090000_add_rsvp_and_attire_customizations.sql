-- Additive migration for RSVP configuration (plus-ones, children, guest search)
-- Existing wedding and RSVP rows are preserved; no tables, rows, or legacy columns are removed.

alter table public.weddings
    add column if not exists rsvp_allow_plus_ones boolean not null default true,
    add column if not exists rsvp_allow_children boolean not null default true,
    add column if not exists rsvp_search_guest_list boolean not null default true;

comment on column public.weddings.rsvp_allow_plus_ones is
    'Whether guests can indicate plus-ones/additional guests in public RSVP.';
comment on column public.weddings.rsvp_allow_children is
    'Whether guests can indicate children attending in public RSVP.';
comment on column public.weddings.rsvp_search_guest_list is
    'Whether guests can search the invited guest list during public RSVP.';
