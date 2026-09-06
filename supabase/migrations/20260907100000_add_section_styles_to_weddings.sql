-- Add section_styles column to weddings table for per-section background, texture, and image customization
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS section_styles JSONB DEFAULT '{}'::jsonb;
