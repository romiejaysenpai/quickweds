-- Add production-safe entourage proposal customization fields.
-- This is intentionally additive so existing invitation rows remain valid.

alter table public.entourage_invitations
add column if not exists card_theme text default 'classic',
add column if not exists proposal_title text default null,
add column if not exists proposal_hero_image_url text default null,
add column if not exists response_details jsonb default '{}'::jsonb;

alter table public.entourage_invitations
drop constraint if exists entourage_invitations_template_key_check;

alter table public.entourage_invitations
add constraint entourage_invitations_template_key_check
check (template_key in ('heartfelt', 'elegant', 'simple', 'playful', 'formal'));

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'entourage_invitations_card_theme_check'
          and conrelid = 'public.entourage_invitations'::regclass
    ) then
        alter table public.entourage_invitations
        add constraint entourage_invitations_card_theme_check
        check (card_theme is null or card_theme in ('classic', 'blush', 'emerald', 'midnight', 'gold'));
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'entourage_invitations_proposal_title_check'
          and conrelid = 'public.entourage_invitations'::regclass
    ) then
        alter table public.entourage_invitations
        add constraint entourage_invitations_proposal_title_check
        check (proposal_title is null or length(proposal_title) <= 300);
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'entourage_invitations_response_details_check'
          and conrelid = 'public.entourage_invitations'::regclass
    ) then
        alter table public.entourage_invitations
        add constraint entourage_invitations_response_details_check
        check (response_details is null or jsonb_typeof(response_details) = 'object');
    end if;
end $$;

comment on column public.entourage_invitations.card_theme is
'Visual card theme selected for an entourage proposal email and response page.';

comment on column public.entourage_invitations.proposal_title is
'Custom title shown on an entourage proposal email and response page.';

comment on column public.entourage_invitations.proposal_hero_image_url is
'Optional hero image shown in the entourage proposal email.';

comment on column public.entourage_invitations.response_details is
'Optional structured response details submitted by an entourage invitee.';

notify pgrst, 'reload schema';
