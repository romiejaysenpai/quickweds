-- Migration: Add post-wedding recap customization options
-- Enables couples to showcase approved disposable camera photos and guestbook opt-ins on the post-wedding site.
-- Safe, additive migration preserving all existing wedding rows and defaults.

ALTER TABLE public.weddings
    ADD COLUMN IF NOT EXISTS show_photos_in_thank_you_mode BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS show_guestbook_in_thank_you_mode BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS photo_recap_style TEXT NOT NULL DEFAULT 'polaroid';

COMMENT ON COLUMN public.weddings.show_photos_in_thank_you_mode IS
    'Whether to display approved disposable camera / guest photos on the wedding page in post-wedding mode.';

COMMENT ON COLUMN public.weddings.show_guestbook_in_thank_you_mode IS
    'Whether to display guestbook notes and opt-in on the wedding page in post-wedding mode.';

COMMENT ON COLUMN public.weddings.photo_recap_style IS
    'Display style for post-wedding photos (e.g. polaroid or grid).';
