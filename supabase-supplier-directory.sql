-- QuickWeds Supplier Directory
-- Run this in Supabase SQL editor before using the supplier directory in production.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS supplier_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    slug TEXT NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    service_areas TEXT[] DEFAULT '{}',
    summary TEXT DEFAULT '',
    description TEXT DEFAULT '',
    price_band TEXT DEFAULT 'Custom quote',
    phone TEXT,
    email TEXT,
    whatsapp TEXT,
    website_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    cover_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'inactive')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE planner_vendors ADD COLUMN IF NOT EXISTS directory_supplier_id UUID REFERENCES supplier_profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS planner_vendors_wedding_supplier_unique
ON planner_vendors (wedding_id, directory_supplier_id)
WHERE directory_supplier_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS supplier_profiles_public_idx
ON supplier_profiles (status, is_active, is_featured, display_order, business_name);

CREATE INDEX IF NOT EXISTS supplier_profiles_owner_idx
ON supplier_profiles (owner_user_id);

ALTER TABLE supplier_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved_suppliers" ON supplier_profiles;
CREATE POLICY "public_read_approved_suppliers"
ON supplier_profiles
FOR SELECT
USING (status = 'approved' AND is_active = true);

DROP POLICY IF EXISTS "owners_read_own_supplier_profile" ON supplier_profiles;
CREATE POLICY "owners_read_own_supplier_profile"
ON supplier_profiles
FOR SELECT
USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "owners_insert_own_supplier_profile" ON supplier_profiles;
CREATE POLICY "owners_insert_own_supplier_profile"
ON supplier_profiles
FOR INSERT
WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "owners_update_own_supplier_profile" ON supplier_profiles;
CREATE POLICY "owners_update_own_supplier_profile"
ON supplier_profiles
FOR UPDATE
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

NOTIFY pgrst, 'reload schema';
