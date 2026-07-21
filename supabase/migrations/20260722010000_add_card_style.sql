-- Add card_style column to weddings table for customizable section container styles
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS card_style TEXT DEFAULT 'default';
