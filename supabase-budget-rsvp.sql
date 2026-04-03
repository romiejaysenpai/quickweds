-- Wedding Planner: Budget & RSVP Enhancements Migration
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- 1. Add budget fields to weddings table
ALTER TABLE weddings 
ADD COLUMN IF NOT EXISTS total_budget NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- 2. Add payment fields to planner_vendors table
ALTER TABLE planner_vendors 
ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not paid', -- 'paid', 'pending', 'not paid'
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'other'; -- 'cash', 'g-cash', 'bank transfer', 'others'

-- 3. Add guest management fields to rsvps table
ALTER TABLE rsvps 
ADD COLUMN IF NOT EXISTS rsvp_status TEXT DEFAULT 'confirmed', -- 'pending', 'confirmed', 'declined'
ADD COLUMN IF NOT EXISTS manual_entry BOOLEAN DEFAULT false;

-- Update existing RSVPs to have rsvp_status based on attendance
UPDATE rsvps SET rsvp_status = 'confirmed' WHERE attendance = 'Yes' AND rsvp_status IS NULL;
UPDATE rsvps SET rsvp_status = 'declined' WHERE attendance = 'No' AND rsvp_status IS NULL;
