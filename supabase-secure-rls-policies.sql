-- QUICKWEDS: SECURE ROW LEVEL SECURITY POLICIES
-- This script replaces open policies with proper user-scoped access control
-- Run in Supabase SQL Editor

-- ============================================================================
-- PREREQUISITE: Ensure auth.uid() is available (Supabase Auth must be enabled)
-- ============================================================================

-- ============================================================================
-- STEP 0: Create missing tables if they don't exist
-- ============================================================================

-- Create wedding_collaborators table if it doesn't exist
CREATE TABLE IF NOT EXISTS wedding_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'partner', -- 'partner', 'coordinator'
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_template_presets table if it doesn't exist
CREATE TABLE IF NOT EXISTS wedding_template_presets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id TEXT NOT NULL,
    preset_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_analytics_events table if it doesn't exist
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

-- Create wedding_reminders table if it doesn't exist
CREATE TABLE IF NOT EXISTS wedding_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    recipient_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    target_status TEXT,
    channel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rsvp_reminders table if it doesn't exist
CREATE TABLE IF NOT EXISTS rsvp_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rsvp_id UUID REFERENCES rsvps(id) ON DELETE CASCADE,
    reminder_type TEXT DEFAULT 'email',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 1: WEDDINGS TABLE
-- Users can only access weddings they own or are collaborators on
-- ============================================================================

ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- Drop existing open policies
DROP POLICY IF EXISTS "public_update_weddings" ON weddings;
DROP POLICY IF EXISTS "public_select_weddings" ON weddings;

-- Users can view weddings they own
CREATE POLICY "users_can_view_own_weddings" ON weddings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update weddings they own
CREATE POLICY "users_can_update_own_weddings" ON weddings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can insert weddings (sets their own user_id)
CREATE POLICY "users_can_insert_weddings" ON weddings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete weddings they own
CREATE POLICY "users_can_delete_own_weddings" ON weddings
FOR DELETE
USING (auth.uid() = user_id);

-- Collaborators can view weddings they're invited to
CREATE POLICY "collaborators_can_view_weddings" ON weddings
FOR SELECT
USING (
  id IN (
    SELECT wedding_id 
    FROM wedding_collaborators 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'accepted'
  )
);

-- ============================================================================
-- 2. RSVPs TABLE
-- Users can manage RSVPs for their own weddings
-- Guests can submit RSVPs without auth (public wedding pages)
-- ============================================================================

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Drop existing open policies if any
DROP POLICY IF EXISTS "public_all_rsvps" ON rsvps;

-- Wedding owners can view RSVPs for their weddings
CREATE POLICY "owners_can_view_rsvps" ON rsvps
FOR SELECT
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Wedding owners can update RSVPs for their weddings
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

-- Wedding owners can delete RSVPs for their weddings
CREATE POLICY "owners_can_delete_rsvps" ON rsvps
FOR DELETE
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Anyone can insert RSVPs (guests submitting responses)
CREATE POLICY "anyone_can_submit_rsvp" ON rsvps
FOR INSERT
WITH CHECK (true);

-- Collaborators can view RSVPs for weddings they're collaborating on
CREATE POLICY "collaborators_can_view_rsvps" ON rsvps
FOR SELECT
USING (
  wedding_id IN (
    SELECT wedding_id 
    FROM wedding_collaborators 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'accepted'
  )
);

-- ============================================================================
-- 3. PLANNER_TASKS TABLE
-- Users can only access tasks for their own weddings
-- ============================================================================

ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_tasks" ON planner_tasks;

-- Users can view tasks for their weddings
CREATE POLICY "users_can_view_tasks" ON planner_tasks
FOR SELECT
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Users can insert tasks for their weddings
CREATE POLICY "users_can_insert_tasks" ON planner_tasks
FOR INSERT
WITH CHECK (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Users can update tasks for their weddings
CREATE POLICY "users_can_update_tasks" ON planner_tasks
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

-- Users can delete tasks for their weddings
CREATE POLICY "users_can_delete_tasks" ON planner_tasks
FOR DELETE
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Collaborators can view tasks for collaborating weddings
CREATE POLICY "collaborators_can_view_tasks" ON planner_tasks
FOR SELECT
USING (
  wedding_id IN (
    SELECT wedding_id 
    FROM wedding_collaborators 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'accepted'
  )
);

-- ============================================================================
-- 4. PLANNER_BUDGETS TABLE
-- Users can only access budgets for their own weddings
-- ============================================================================

ALTER TABLE planner_budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_budgets" ON planner_budgets;

-- Users can view budgets for their weddings
CREATE POLICY "users_can_view_budgets" ON planner_budgets
FOR SELECT
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Users can insert budgets for their weddings
CREATE POLICY "users_can_insert_budgets" ON planner_budgets
FOR INSERT
WITH CHECK (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Users can update budgets for their weddings
CREATE POLICY "users_can_update_budgets" ON planner_budgets
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

-- Users can delete budgets for their weddings
CREATE POLICY "users_can_delete_budgets" ON planner_budgets
FOR DELETE
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Collaborators can view budgets for collaborating weddings
CREATE POLICY "collaborators_can_view_budgets" ON planner_budgets
FOR SELECT
USING (
  wedding_id IN (
    SELECT wedding_id 
    FROM wedding_collaborators 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'accepted'
  )
);

-- ============================================================================
-- 5. PLANNER_VENDORS TABLE
-- Users can only access vendors for their own weddings
-- ============================================================================

ALTER TABLE planner_vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_vendors" ON planner_vendors;

-- Users can view vendors for their weddings
CREATE POLICY "users_can_view_vendors" ON planner_vendors
FOR SELECT
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Users can insert vendors for their weddings
CREATE POLICY "users_can_insert_vendors" ON planner_vendors
FOR INSERT
WITH CHECK (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Users can update vendors for their weddings
CREATE POLICY "users_can_update_vendors" ON planner_vendors
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

-- Users can delete vendors for their weddings
CREATE POLICY "users_can_delete_vendors" ON planner_vendors
FOR DELETE
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Collaborators can view vendors for collaborating weddings
CREATE POLICY "collaborators_can_view_vendors" ON planner_vendors
FOR SELECT
USING (
  wedding_id IN (
    SELECT wedding_id 
    FROM wedding_collaborators 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'accepted'
  )
);

-- ============================================================================
-- 6. WEDDING_COLLABORATORS TABLE
-- Users can manage collaborators for their own weddings
-- ============================================================================

ALTER TABLE wedding_collaborators ENABLE ROW LEVEL SECURITY;

-- Wedding owners can manage collaborators
CREATE POLICY "owners_can_manage_collaborators" ON wedding_collaborators
FOR ALL
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

-- ============================================================================
-- 7. WEDDING_TEMPLATE_PRESETS TABLE
-- Users can only access their own template presets
-- ============================================================================

ALTER TABLE wedding_template_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_presets" ON wedding_template_presets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_presets" ON wedding_template_presets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_presets" ON wedding_template_presets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_presets" ON wedding_template_presets
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- 8. WEDDING_ANALYTICS_EVENTS TABLE
-- Users can only access analytics for their own weddings
-- ============================================================================

ALTER TABLE wedding_analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (page visits, etc.)
CREATE POLICY "anyone_can_insert_analytics" ON wedding_analytics_events
FOR INSERT
WITH CHECK (true);

-- Users can view analytics for their weddings
CREATE POLICY "users_can_view_analytics" ON wedding_analytics_events
FOR SELECT
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- Collaborators can view analytics for collaborating weddings
CREATE POLICY "collaborators_can_view_analytics" ON wedding_analytics_events
FOR SELECT
USING (
  wedding_id IN (
    SELECT wedding_id 
    FROM wedding_collaborators 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'accepted'
  )
);

-- ============================================================================
-- 9. WEDDING_REMINDERS TABLE
-- Users can only access reminders for their own weddings
-- ============================================================================

ALTER TABLE wedding_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view reminders for their weddings
CREATE POLICY "users_can_view_reminders" ON wedding_reminders
FOR SELECT
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);

-- System can insert reminders (used by cron jobs)
CREATE POLICY "system_can_insert_reminders" ON wedding_reminders
FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 10. RSVP_REMINDERS TABLE
-- Users can only access RSVP reminders for their own weddings
-- ============================================================================

ALTER TABLE rsvp_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view RSVP reminders for their weddings
CREATE POLICY "users_can_view_rsvp_reminders" ON rsvp_reminders
FOR SELECT
USING (
  rsvp_id IN (
    SELECT id FROM rsvps 
    WHERE wedding_id IN (
      SELECT id FROM weddings WHERE user_id = auth.uid()
    )
  )
);

-- System can insert RSVP reminders
CREATE POLICY "system_can_insert_rsvp_reminders" ON rsvp_reminders
FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- FORCE SCHEMA CACHE REFRESH
-- ============================================================================
NOTIFY pgrst, 'reload schema';
