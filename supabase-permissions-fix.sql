-- WEDDINGS TABLE PERMISSION FIX
-- Run this in your Supabase SQL Editor to allow budget/currency updates

-- 1. Enable RLS on weddings table (if not already enabled)
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow public/anon updates to weddings
-- This allows anyone with the Wedding ID to update the budget and currency
DROP POLICY IF EXISTS "public_update_weddings" ON weddings;
CREATE POLICY "public_update_weddings" ON weddings 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 3. Also ensure SELECT is allowed so the data can be loaded
DROP POLICY IF EXISTS "public_select_weddings" ON weddings;
CREATE POLICY "public_select_weddings" ON weddings 
FOR SELECT 
USING (true);

-- 4. Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
