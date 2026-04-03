-- QUICKWEDS: COMPLETE WEDDING PLANNER & RSVP SETUP (FIXED)
-- Copy and run this script in your Supabase SQL Editor

-- 1. Enable extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Base Wedding Planner Tables (Using TEXT for wedding_id to match your weddings table)
CREATE TABLE IF NOT EXISTS planner_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    category TEXT DEFAULT 'General',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    estimated_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhancement Columns
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS total_budget NUMERIC DEFAULT 0;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

ALTER TABLE planner_vendors ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE planner_vendors ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not paid';
ALTER TABLE planner_vendors ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'other';

ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS rsvp_status TEXT DEFAULT 'confirmed';
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS manual_entry BOOLEAN DEFAULT false;

-- 4. Enable RLS and Policies
ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_tasks" ON planner_tasks;
CREATE POLICY "public_all_tasks" ON planner_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_all_budgets" ON planner_budgets;
CREATE POLICY "public_all_budgets" ON planner_budgets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_all_vendors" ON planner_vendors;
CREATE POLICY "public_all_vendors" ON planner_vendors FOR ALL USING (true) WITH CHECK (true);

-- 5. Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
