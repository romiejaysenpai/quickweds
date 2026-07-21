-- Add logo_animation column to weddings table for monogram animations
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS logo_animation TEXT DEFAULT 'none';
