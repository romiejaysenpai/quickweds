-- QuickWeds Wedding Planner Migration Script
-- INSTRUCTIONS: Copy and paste EVERYTHING below into your Supabase Dashboard -> SQL Editor and hit "Run"

CREATE TABLE IF NOT EXISTS planner_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'in-progress', 'completed'
    category TEXT DEFAULT 'General',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    estimated_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create public policies so your Next.js QuickWeds front-end can read and write to these tables
ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_tasks" ON planner_tasks;
CREATE POLICY "public_all_tasks" ON planner_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_all_budgets" ON planner_budgets;
CREATE POLICY "public_all_budgets" ON planner_budgets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_all_vendors" ON planner_vendors;
CREATE POLICY "public_all_vendors" ON planner_vendors FOR ALL USING (true) WITH CHECK (true);

-- Success! Your database is now ready to support the Wedding Planner.
