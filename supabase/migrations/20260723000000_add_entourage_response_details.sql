-- Add response_details, card_theme, and proposal_title columns to entourage_invitations table
ALTER TABLE entourage_invitations ADD COLUMN IF NOT EXISTS card_theme TEXT DEFAULT 'classic';
ALTER TABLE entourage_invitations ADD COLUMN IF NOT EXISTS proposal_title TEXT DEFAULT NULL;
ALTER TABLE entourage_invitations ADD COLUMN IF NOT EXISTS proposal_hero_image_url TEXT DEFAULT NULL;
ALTER TABLE entourage_invitations ADD COLUMN IF NOT EXISTS response_details JSONB DEFAULT '{}'::jsonb;
