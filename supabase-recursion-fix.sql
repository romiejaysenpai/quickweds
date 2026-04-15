-- FIX FOR INFINITE RECURSION IN RLS POLICIES
-- This script replaces recursive policies with security definer functions to break the loop.
-- Run this in your Supabase SQL Editor.

-- 1. Create Security Definer Functions (these bypass RLS for the queries inside them)
CREATE OR REPLACE FUNCTION check_is_wedding_owner(w_id TEXT, u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM weddings 
    WHERE id = w_id AND user_id = u_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_is_wedding_collaborator(w_id TEXT, u_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email from auth.users (requires security definer)
  SELECT email INTO user_email FROM auth.users WHERE id = u_id;
  
  RETURN EXISTS (
    SELECT 1 
    FROM wedding_collaborators 
    WHERE wedding_id = w_id 
    AND email = user_email
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Weddings Table Policies
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_view_own_weddings" ON weddings;
CREATE POLICY "users_can_view_own_weddings" ON weddings
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "collaborators_can_view_weddings" ON weddings;
CREATE POLICY "collaborators_can_view_weddings" ON weddings
FOR SELECT USING (check_is_wedding_collaborator(id, auth.uid()));

-- 3. Update Wedding Collaborators Table Policies
ALTER TABLE wedding_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners_can_manage_collaborators" ON wedding_collaborators;
CREATE POLICY "owners_can_manage_collaborators" ON wedding_collaborators
FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid()));

DROP POLICY IF EXISTS "collaborators_view_own_invites" ON wedding_collaborators;
CREATE POLICY "collaborators_view_own_invites" ON wedding_collaborators
FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 4. Update Other Related Tables to use the owner check function (to prevent future recursion)
-- RSVPs
DROP POLICY IF EXISTS "owners_can_view_rsvps" ON rsvps;
CREATE POLICY "owners_can_view_rsvps" ON rsvps
FOR SELECT USING (check_is_wedding_owner(wedding_id, auth.uid()));

-- Planner Tasks
DROP POLICY IF EXISTS "owners_can_view_tasks" ON planner_tasks;
CREATE POLICY "owners_can_view_tasks" ON planner_tasks
FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid()));

-- Planner Budgets
DROP POLICY IF EXISTS "owners_can_view_budgets" ON planner_budgets;
CREATE POLICY "owners_can_view_budgets" ON planner_budgets
FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid()));

-- Planner Vendors
DROP POLICY IF EXISTS "owners_can_view_vendors" ON planner_vendors;
CREATE POLICY "owners_can_view_vendors" ON planner_vendors
FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid()));

-- 5. Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
