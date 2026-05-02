-- ============================================================================
-- QUICKWEDS MASTER FIX — Run this in Supabase SQL Editor
-- This is the single source of truth for all RLS policies & missing columns
-- Created: April 2026 — QA Audit Fix
-- ============================================================================

-- ============================================================================
-- STEP 1: ENSURE ALL REQUIRED COLUMNS EXIST
-- These columns are used by the frontend but may be missing from some DBs
-- ============================================================================

-- RSVPs table: ensure all expected columns exist
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS meal_preference TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS dietary_details TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS plus_one_names TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS song_request TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS manual_entry BOOLEAN DEFAULT false;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS rsvp_status TEXT DEFAULT 'confirmed';
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS message TEXT;

-- Weddings table: ensure budget/currency columns exist
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS total_budget NUMERIC DEFAULT 0;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ============================================================================
-- STEP 2: ADVANCED FEATURE TABLES (if they don't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS wedding_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'partner',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wedding_collaborators
ADD COLUMN IF NOT EXISTS invited_by_user_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'wedding_collaborators_wedding_id_email_key'
    ) THEN
        ALTER TABLE wedding_collaborators
        ADD CONSTRAINT wedding_collaborators_wedding_id_email_key UNIQUE (wedding_id, email);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS wedding_template_presets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id TEXT NOT NULL,
    preset_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wedding_analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    source TEXT,
    session_id TEXT,
    referrer TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wedding_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    recipient_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    target_status TEXT,
    channel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rsvp_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rsvp_id UUID REFERENCES rsvps(id) ON DELETE CASCADE,
    reminder_type TEXT DEFAULT 'email',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: WEDDINGS TABLE — RLS POLICIES
-- CRITICAL: Must allow public READ for guest wedding pages (/w/[id])
-- while keeping write operations restricted to owners
-- ============================================================================

ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "public_update_weddings" ON weddings;
DROP POLICY IF EXISTS "public_select_weddings" ON weddings;
DROP POLICY IF EXISTS "users_can_view_own_weddings" ON weddings;
DROP POLICY IF EXISTS "users_can_update_own_weddings" ON weddings;
DROP POLICY IF EXISTS "users_can_insert_weddings" ON weddings;
DROP POLICY IF EXISTS "users_can_delete_own_weddings" ON weddings;
DROP POLICY IF EXISTS "collaborators_can_view_weddings" ON weddings;
DROP POLICY IF EXISTS "anyone_can_view_weddings" ON weddings;

-- ✅ PUBLIC READ: Anyone can view weddings (needed for /w/[id] guest pages)
-- This is INTENTIONAL — wedding pages are meant to be public (like a shared link)
CREATE POLICY "anyone_can_view_weddings" ON weddings
FOR SELECT
USING (true);

-- ✅ OWNER INSERT: Only authenticated users can create weddings (sets their own user_id)
CREATE POLICY "users_can_insert_weddings" ON weddings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ✅ OWNER UPDATE: Only the owner can update their wedding
CREATE POLICY "users_can_update_own_weddings" ON weddings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ✅ OWNER DELETE: Only the owner can delete their wedding
CREATE POLICY "users_can_delete_own_weddings" ON weddings
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: RSVPs TABLE — RLS POLICIES
-- Guests can submit RSVPs without auth; owners can manage them
-- ============================================================================

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_rsvps" ON rsvps;
DROP POLICY IF EXISTS "owners_can_view_rsvps" ON rsvps;
DROP POLICY IF EXISTS "owners_can_update_rsvps" ON rsvps;
DROP POLICY IF EXISTS "owners_can_delete_rsvps" ON rsvps;
DROP POLICY IF EXISTS "anyone_can_submit_rsvp" ON rsvps;
DROP POLICY IF EXISTS "anyone_can_view_rsvps" ON rsvps;
DROP POLICY IF EXISTS "collaborators_can_view_rsvps" ON rsvps;

-- ✅ ANYONE CAN READ RSVPs (needed for duplicate check in RSVPForm)
CREATE POLICY "anyone_can_view_rsvps" ON rsvps
FOR SELECT
USING (true);

-- ✅ ANYONE CAN INSERT RSVPs (guests submitting responses — no auth required)
CREATE POLICY "anyone_can_submit_rsvp" ON rsvps
FOR INSERT
WITH CHECK (true);

-- ✅ OWNER UPDATE: Wedding owners can update RSVPs
CREATE POLICY "owners_can_update_rsvps" ON rsvps
FOR UPDATE
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- ✅ OWNER DELETE: Wedding owners can delete RSVPs
CREATE POLICY "owners_can_delete_rsvps" ON rsvps
FOR DELETE
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- STEP 5: PLANNER TABLES — RLS POLICIES
-- ============================================================================

-- PLANNER TASKS
ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_tasks" ON planner_tasks;
DROP POLICY IF EXISTS "users_can_view_tasks" ON planner_tasks;
DROP POLICY IF EXISTS "users_can_insert_tasks" ON planner_tasks;
DROP POLICY IF EXISTS "users_can_update_tasks" ON planner_tasks;
DROP POLICY IF EXISTS "users_can_delete_tasks" ON planner_tasks;
DROP POLICY IF EXISTS "collaborators_can_view_tasks" ON planner_tasks;

CREATE POLICY "users_can_view_tasks" ON planner_tasks FOR SELECT USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_insert_tasks" ON planner_tasks FOR INSERT WITH CHECK (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_update_tasks" ON planner_tasks FOR UPDATE USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
) WITH CHECK (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_delete_tasks" ON planner_tasks FOR DELETE USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);

-- PLANNER BUDGETS
ALTER TABLE planner_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_budgets" ON planner_budgets;
DROP POLICY IF EXISTS "users_can_view_budgets" ON planner_budgets;
DROP POLICY IF EXISTS "users_can_insert_budgets" ON planner_budgets;
DROP POLICY IF EXISTS "users_can_update_budgets" ON planner_budgets;
DROP POLICY IF EXISTS "users_can_delete_budgets" ON planner_budgets;
DROP POLICY IF EXISTS "collaborators_can_view_budgets" ON planner_budgets;

CREATE POLICY "users_can_view_budgets" ON planner_budgets FOR SELECT USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_insert_budgets" ON planner_budgets FOR INSERT WITH CHECK (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_update_budgets" ON planner_budgets FOR UPDATE USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
) WITH CHECK (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_delete_budgets" ON planner_budgets FOR DELETE USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);

-- PLANNER VENDORS
ALTER TABLE planner_vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_vendors" ON planner_vendors;
DROP POLICY IF EXISTS "users_can_view_vendors" ON planner_vendors;
DROP POLICY IF EXISTS "users_can_insert_vendors" ON planner_vendors;
DROP POLICY IF EXISTS "users_can_update_vendors" ON planner_vendors;
DROP POLICY IF EXISTS "users_can_delete_vendors" ON planner_vendors;
DROP POLICY IF EXISTS "collaborators_can_view_vendors" ON planner_vendors;

CREATE POLICY "users_can_view_vendors" ON planner_vendors FOR SELECT USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_insert_vendors" ON planner_vendors FOR INSERT WITH CHECK (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_update_vendors" ON planner_vendors FOR UPDATE USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
) WITH CHECK (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "users_can_delete_vendors" ON planner_vendors FOR DELETE USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);

-- ============================================================================
-- STEP 6: ADVANCED FEATURE TABLES — RLS POLICIES
-- ============================================================================

-- WEDDING COLLABORATORS
ALTER TABLE wedding_collaborators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owners_can_manage_collaborators" ON wedding_collaborators;
CREATE POLICY "owners_can_manage_collaborators" ON wedding_collaborators FOR ALL USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
) WITH CHECK (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);

-- WEDDING TEMPLATE PRESETS
ALTER TABLE wedding_template_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_can_view_own_presets" ON wedding_template_presets;
DROP POLICY IF EXISTS "users_can_insert_own_presets" ON wedding_template_presets;
DROP POLICY IF EXISTS "users_can_update_own_presets" ON wedding_template_presets;
DROP POLICY IF EXISTS "users_can_delete_own_presets" ON wedding_template_presets;
CREATE POLICY "users_can_view_own_presets" ON wedding_template_presets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_can_insert_own_presets" ON wedding_template_presets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_can_update_own_presets" ON wedding_template_presets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_can_delete_own_presets" ON wedding_template_presets FOR DELETE USING (auth.uid() = user_id);

-- WEDDING ANALYTICS EVENTS
ALTER TABLE wedding_analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_can_insert_analytics" ON wedding_analytics_events;
DROP POLICY IF EXISTS "users_can_view_analytics" ON wedding_analytics_events;
DROP POLICY IF EXISTS "collaborators_can_view_analytics" ON wedding_analytics_events;
CREATE POLICY "anyone_can_insert_analytics" ON wedding_analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "users_can_view_analytics" ON wedding_analytics_events FOR SELECT USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);

-- WEDDING REMINDERS
ALTER TABLE wedding_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_can_view_reminders" ON wedding_reminders;
DROP POLICY IF EXISTS "system_can_insert_reminders" ON wedding_reminders;
CREATE POLICY "users_can_view_reminders" ON wedding_reminders FOR SELECT USING (
  wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
);
CREATE POLICY "system_can_insert_reminders" ON wedding_reminders FOR INSERT WITH CHECK (true);

-- RSVP REMINDERS
ALTER TABLE rsvp_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_can_view_rsvp_reminders" ON rsvp_reminders;
DROP POLICY IF EXISTS "system_can_insert_rsvp_reminders" ON rsvp_reminders;
CREATE POLICY "users_can_view_rsvp_reminders" ON rsvp_reminders FOR SELECT USING (
  rsvp_id IN (
    SELECT id FROM rsvps 
    WHERE wedding_id IN (SELECT id FROM weddings WHERE user_id = auth.uid())
  )
);
CREATE POLICY "system_can_insert_rsvp_reminders" ON rsvp_reminders FOR INSERT WITH CHECK (true);

-- ============================================================================
-- STEP 7: FORCE SCHEMA CACHE REFRESH
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- ✅ DONE! All policies are now correctly configured:
--   • Wedding pages (/w/[id]) → PUBLIC READ ✅
--   • RSVP submissions → PUBLIC INSERT ✅
--   • RSVP duplicate check → PUBLIC SELECT ✅ 
--   • Dashboard data → OWNER-ONLY ✅
--   • Wedding CRUD → OWNER-ONLY ✅
--   • Planner data → OWNER-ONLY ✅
-- ============================================================================
