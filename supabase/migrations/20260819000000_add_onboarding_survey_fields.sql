-- Add onboarding survey fields to user_app_profiles for segmentation and personalization.

ALTER TABLE user_app_profiles
ADD COLUMN IF NOT EXISTS wedding_date TEXT,
ADD COLUMN IF NOT EXISTS wedding_date_status TEXT CHECK (wedding_date_status IN ('exact', 'month_year', 'undecided') OR wedding_date_status IS NULL),
ADD COLUMN IF NOT EXISTS wedding_country TEXT,
ADD COLUMN IF NOT EXISTS wedding_city TEXT,
ADD COLUMN IF NOT EXISTS planning_stage TEXT,
ADD COLUMN IF NOT EXISTS primary_needs TEXT[],
ADD COLUMN IF NOT EXISTS estimated_guest_count TEXT,
ADD COLUMN IF NOT EXISTS user_role TEXT,
ADD COLUMN IF NOT EXISTS acquisition_source TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_draft JSONB;

CREATE INDEX IF NOT EXISTS user_app_profiles_planning_stage_idx
ON user_app_profiles (planning_stage);

NOTIFY pgrst, 'reload schema';
