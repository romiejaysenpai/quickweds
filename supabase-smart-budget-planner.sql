-- QuickWeds Smart Budget Planner Enhancements
-- Safe to run multiple times in Supabase SQL Editor.

ALTER TABLE planner_budgets
ADD COLUMN IF NOT EXISTS due_date DATE;

CREATE INDEX IF NOT EXISTS idx_planner_budgets_wedding_due_date
ON planner_budgets(wedding_id, due_date)
WHERE due_date IS NOT NULL;

NOTIFY pgrst, 'reload schema';
