-- QuickWeds account roles for couple/supplier onboarding.
-- Run this in Supabase SQL editor before enabling role-based redirects in production.

CREATE TABLE IF NOT EXISTS user_app_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type TEXT CHECK (account_type IN ('couple', 'supplier')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_app_profiles_account_type_idx
ON user_app_profiles (account_type);

ALTER TABLE user_app_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_app_profile" ON user_app_profiles;
CREATE POLICY "users_read_own_app_profile"
ON user_app_profiles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_app_profile" ON user_app_profiles;
CREATE POLICY "users_insert_own_app_profile"
ON user_app_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_empty_app_profile" ON user_app_profiles;
CREATE POLICY "users_update_own_empty_app_profile"
ON user_app_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

