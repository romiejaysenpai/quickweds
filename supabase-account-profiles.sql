-- QuickWeds account roles for couple/supplier onboarding.
-- Run this in Supabase SQL editor before enabling role-based redirects in production.

CREATE TABLE IF NOT EXISTS user_app_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type TEXT CHECK (account_type IN ('couple', 'supplier')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    is_pro BOOLEAN NOT NULL DEFAULT false,
    plan_type TEXT,
    payment_status TEXT,
    payment_amount NUMERIC DEFAULT 0,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    pro_unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_app_profiles
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS plan_type TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS pro_unlocked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS user_app_profiles_account_type_idx
ON user_app_profiles (account_type);

CREATE INDEX IF NOT EXISTS user_app_profiles_is_pro_idx
ON user_app_profiles (is_pro);

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
