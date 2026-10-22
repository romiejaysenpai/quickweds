-- Synthetic metadata-only schema: never connect this fixture to production.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
CREATE FUNCTION auth.email() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.email', true), '');
$$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
CREATE TABLE public.weddings (id text PRIMARY KEY, user_id uuid, deleted_at timestamptz);
CREATE TABLE public.wedding_collaborators (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wedding_id text REFERENCES weddings(id),
 email text NOT NULL, role text NOT NULL DEFAULT 'partner', status text NOT NULL DEFAULT 'pending',
 invited_by_user_id uuid, created_at timestamptz DEFAULT now()
);
CREATE TABLE public.supplier_profiles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_user_id uuid, business_name text,
 status text NOT NULL DEFAULT 'draft', is_featured boolean NOT NULL DEFAULT false,
 display_order integer NOT NULL DEFAULT 0
);
CREATE TABLE public.app_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, wedding_id text,
 quote text, status text NOT NULL DEFAULT 'pending', verified_couple boolean NOT NULL DEFAULT false,
 is_featured boolean NOT NULL DEFAULT false, updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
ALTER TABLE wedding_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners and invitees can manage collaborators" ON wedding_collaborators
FOR ALL TO authenticated USING (
 EXISTS(SELECT 1 FROM weddings w WHERE w.id=wedding_id AND w.user_id=auth.uid()) OR lower(email)=lower(auth.email())
) WITH CHECK (
 EXISTS(SELECT 1 FROM weddings w WHERE w.id=wedding_id AND w.user_id=auth.uid()) OR lower(email)=lower(auth.email())
);
CREATE POLICY owners_can_manage_collaborators ON wedding_collaborators FOR ALL USING (
 EXISTS(SELECT 1 FROM weddings w WHERE w.id=wedding_id AND w.user_id=auth.uid())
);
CREATE POLICY owners_insert_own_supplier_profile ON supplier_profiles FOR INSERT WITH CHECK (owner_user_id=auth.uid());
CREATE POLICY owners_update_own_supplier_profile ON supplier_profiles FOR UPDATE USING(owner_user_id=auth.uid()) WITH CHECK(owner_user_id=auth.uid());
CREATE POLICY owners_read_own_supplier_profile ON supplier_profiles FOR SELECT USING(owner_user_id=auth.uid());
CREATE POLICY "Anyone can submit an app_review" ON app_reviews FOR INSERT WITH CHECK(true);
CREATE POLICY "Users can update their own app_reviews" ON app_reviews FOR UPDATE USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY "Public can view approved app_reviews" ON app_reviews FOR SELECT USING(status='approved');
INSERT INTO weddings VALUES ('wedding-owner','00000000-0000-0000-0000-000000000001',null),
 ('wedding-deleted','00000000-0000-0000-0000-000000000001',now());
