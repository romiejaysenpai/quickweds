-- DATABASE OPTIMIZATION: INDEXES & SOFT DELETE
-- Run this in the Supabase SQL Editor

-- 1. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_status ON rsvps(wedding_id, rsvp_status);
CREATE INDEX IF NOT EXISTS idx_weddings_user_created ON weddings(user_id, created_at DESC);

-- 2. Add soft delete column to weddings
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Notify Schema Cache
NOTIFY pgrst, 'reload schema';
