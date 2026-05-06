-- Add notification preference columns to weddings table
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS notify_on_rsvp BOOLEAN DEFAULT true;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS notify_on_updates BOOLEAN DEFAULT true;

-- Update RLS policies to allow owners to update these columns (already covered by existing policies)
-- NOTIFY pgrst, 'reload schema';
