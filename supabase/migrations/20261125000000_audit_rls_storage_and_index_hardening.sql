-- Migration: 20261125000000_audit_rls_storage_and_index_hardening.sql
-- Description: Additive, backward-compatible RLS, trigger, storage, RPC, and index hardening.
-- Preserves all existing customer data; guards optional tables cleanly.
BEGIN;

-- ============================================================================
-- 1. Drop overly permissive PUBLIC USING(true) / WITH CHECK(true) RLS policies
--    and revoke unnecessary direct anon grants on private tables.
-- ============================================================================
DO $$
BEGIN
  IF to_regclass('public.user_notifications') IS NOT NULL THEN
    DROP POLICY IF EXISTS "system_can_insert_notifications" ON public.user_notifications;
    DROP POLICY IF EXISTS "users_insert_own_notifications" ON public.user_notifications;
    CREATE POLICY "users_insert_own_notifications" ON public.user_notifications
      FOR INSERT TO authenticated
      WITH CHECK (
        auth.uid() = user_id
        AND (link IS NULL OR link LIKE '/%')
      );
    REVOKE ALL ON TABLE public.user_notifications FROM anon;
  END IF;

  IF to_regclass('public.thank_you_send_queue') IS NOT NULL THEN
    DROP POLICY IF EXISTS "system_process_queue" ON public.thank_you_send_queue;
    REVOKE ALL ON TABLE public.thank_you_send_queue FROM anon;
  END IF;

  IF to_regclass('public.wedding_photos') IS NOT NULL THEN
    DROP POLICY IF EXISTS "anyone_upload_photos" ON public.wedding_photos;
    DROP POLICY IF EXISTS "anyone_view_approved_photos" ON public.wedding_photos;
    DROP POLICY IF EXISTS "Public can insert wedding photos" ON public.wedding_photos;
    DROP POLICY IF EXISTS "Public can view approved wedding photos" ON public.wedding_photos;
    REVOKE INSERT, UPDATE, DELETE, SELECT ON TABLE public.wedding_photos FROM anon;
  END IF;

  IF to_regclass('public.photo_sharing_codes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "anyone_view_active_codes" ON public.photo_sharing_codes;
    DROP POLICY IF EXISTS "Public can view active photo sharing codes" ON public.photo_sharing_codes;
    REVOKE ALL ON TABLE public.photo_sharing_codes FROM anon;
  END IF;

  IF to_regclass('public.wedding_reminders') IS NOT NULL THEN
    DROP POLICY IF EXISTS "system_can_insert_reminders" ON public.wedding_reminders;
    REVOKE ALL ON TABLE public.wedding_reminders FROM anon;
  END IF;

  IF to_regclass('public.rsvp_reminders') IS NOT NULL THEN
    DROP POLICY IF EXISTS "system_can_insert_rsvp_reminders" ON public.rsvp_reminders;
    REVOKE ALL ON TABLE public.rsvp_reminders FROM anon;
  END IF;

  IF to_regclass('public.weddings') IS NOT NULL THEN
    DROP POLICY IF EXISTS "anyone_can_view_weddings" ON public.weddings;
    DROP POLICY IF EXISTS "public_select_weddings" ON public.weddings;
    REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.weddings FROM anon;
    ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- 2. Harden billing, ownership, and soft-delete protection triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_weddings_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  old_json jsonb;
  new_json jsonb;
  protected_col text;
  protected_cols text[] := ARRAY[
    'is_premium',
    'payment_status',
    'plan_type',
    'payment_amount',
    'stripe_payment_intent_id',
    'stripe_checkout_session_id',
    'custom_domain',
    'planner_calendar_token',
    'public_seat_finder_token'
  ];
BEGIN
  IF public.is_service_role_caller() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_premium := false;
    NEW.payment_status := 'unpaid';
    IF to_jsonb(NEW) ? 'plan_type' THEN
      NEW.plan_type := 'free';
    END IF;
    IF to_jsonb(NEW) ? 'user_id' AND auth.uid() IS NOT NULL THEN
      NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE guards
  old_json := to_jsonb(OLD);
  new_json := to_jsonb(NEW);

  -- Never allow non-service callers to transfer wedding ownership
  IF (old_json->>'user_id') IS DISTINCT FROM (new_json->>'user_id') THEN
    RAISE EXCEPTION 'Wedding ownership cannot be modified directly' USING ERRCODE = '42501';
  END IF;

  -- Never allow non-service callers to resurrect a soft-deleted wedding
  IF (old_json->>'deleted_at') IS NOT NULL AND (new_json->>'deleted_at') IS NULL THEN
    RAISE EXCEPTION 'Soft-deleted weddings cannot be restored directly' USING ERRCODE = '42501';
  END IF;

  -- Only the wedding owner (never a partner collaborator) may soft-delete a wedding
  IF (old_json->>'deleted_at') IS NULL AND (new_json->>'deleted_at') IS NOT NULL THEN
    IF auth.uid() IS NULL OR (old_json->>'user_id') IS DISTINCT FROM auth.uid()::text THEN
      RAISE EXCEPTION 'Only the wedding owner can delete this wedding' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Preserve billing/system columns silently for backward compatibility on regular builder saves,
  -- and block attempts to overwrite Stripe/domain/token fields.
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    NEW.is_premium := OLD.is_premium;
  END IF;
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    NEW.payment_status := OLD.payment_status;
  END IF;
  IF (old_json ? 'plan_type') AND (new_json->>'plan_type') IS DISTINCT FROM (old_json->>'plan_type') THEN
    NEW.plan_type := OLD.plan_type;
  END IF;

  FOREACH protected_col IN ARRAY protected_cols LOOP
    IF protected_col IN ('is_premium', 'payment_status', 'plan_type') THEN
      CONTINUE;
    END IF;
    IF (old_json ? protected_col) AND (new_json->protected_col) IS DISTINCT FROM (old_json->protected_col) THEN
      RAISE EXCEPTION 'Protected wedding column % requires server-side API', protected_col USING ERRCODE = '42501';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_weddings_billing_columns() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_protect_weddings_billing_columns ON public.weddings;
CREATE TRIGGER trg_protect_weddings_billing_columns
BEFORE INSERT OR UPDATE ON public.weddings
FOR EACH ROW EXECUTE FUNCTION public.protect_weddings_billing_columns();

CREATE OR REPLACE FUNCTION public.protect_user_app_profiles_billing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  old_json jsonb;
  new_json jsonb;
  protected_col text;
  protected_cols text[] := ARRAY[
    'payment_amount',
    'stripe_payment_intent_id',
    'stripe_checkout_session_id',
    'pro_unlocked_at'
  ];
BEGIN
  IF public.is_service_role_caller() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_pro := false;
    NEW.payment_status := 'unpaid';
    IF to_jsonb(NEW) ? 'plan_type' THEN
      NEW.plan_type := 'free';
    END IF;
    RETURN NEW;
  END IF;

  old_json := to_jsonb(OLD);
  new_json := to_jsonb(NEW);

  IF NEW.is_pro IS DISTINCT FROM OLD.is_pro THEN
    NEW.is_pro := OLD.is_pro;
  END IF;
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    NEW.payment_status := OLD.payment_status;
  END IF;
  IF (old_json ? 'plan_type') AND (new_json->>'plan_type') IS DISTINCT FROM (old_json->>'plan_type') THEN
    NEW.plan_type := OLD.plan_type;
  END IF;

  FOREACH protected_col IN ARRAY protected_cols LOOP
    IF (old_json ? protected_col) AND (new_json->protected_col) IS DISTINCT FROM (old_json->protected_col) THEN
      RAISE EXCEPTION 'Protected profile column % requires server-side verification', protected_col USING ERRCODE = '42501';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_user_app_profiles_billing() FROM PUBLIC;

DO $$
BEGIN
  IF to_regclass('public.user_app_profiles') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_protect_user_app_profiles_billing ON public.user_app_profiles;
    CREATE TRIGGER trg_protect_user_app_profiles_billing
    BEFORE INSERT OR UPDATE ON public.user_app_profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_app_profiles_billing();
  END IF;
END $$;

-- ============================================================================
-- 3. Fix RLS policies that queried auth.users directly (permission denied bug)
-- ============================================================================
DO $$
BEGIN
  IF to_regclass('public.photo_portal_settings') IS NOT NULL THEN
    DROP POLICY IF EXISTS "owners_manage_photo_portal_settings" ON public.photo_portal_settings;
    CREATE POLICY "owners_manage_photo_portal_settings" ON public.photo_portal_settings
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.weddings w
          WHERE w.id = photo_portal_settings.wedding_id
            AND w.user_id = auth.uid()
            AND w.deleted_at IS NULL
        )
        OR EXISTS (
          SELECT 1 FROM public.wedding_collaborators wc
          JOIN public.weddings w ON w.id = wc.wedding_id
          WHERE wc.wedding_id = photo_portal_settings.wedding_id
            AND w.deleted_at IS NULL
            AND lower(wc.email) = lower(auth.email())
            AND wc.status = 'accepted'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.weddings w
          WHERE w.id = photo_portal_settings.wedding_id
            AND w.user_id = auth.uid()
            AND w.deleted_at IS NULL
        )
        OR EXISTS (
          SELECT 1 FROM public.wedding_collaborators wc
          JOIN public.weddings w ON w.id = wc.wedding_id
          WHERE wc.wedding_id = photo_portal_settings.wedding_id
            AND w.deleted_at IS NULL
            AND lower(wc.email) = lower(auth.email())
            AND wc.status = 'accepted'
        )
      );
  END IF;

  IF to_regclass('public.thank_you_email_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "collaborators_can_read_thank_you_email_logs" ON public.thank_you_email_logs;
    DROP POLICY IF EXISTS "collaborators_can_insert_thank_you_email_logs" ON public.thank_you_email_logs;
    CREATE POLICY "collaborators_can_read_thank_you_email_logs" ON public.thank_you_email_logs
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.wedding_collaborators wc
          JOIN public.weddings w ON w.id = wc.wedding_id
          WHERE wc.wedding_id = thank_you_email_logs.wedding_id
            AND w.deleted_at IS NULL
            AND lower(wc.email) = lower(auth.email())
            AND wc.status = 'accepted'
        )
      );
    CREATE POLICY "collaborators_can_insert_thank_you_email_logs" ON public.thank_you_email_logs
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.wedding_collaborators wc
          JOIN public.weddings w ON w.id = wc.wedding_id
          WHERE wc.wedding_id = thank_you_email_logs.wedding_id
            AND w.deleted_at IS NULL
            AND lower(wc.email) = lower(auth.email())
            AND wc.status = 'accepted'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 4. Define canonical quickweds_lookup_custom_domain RPC used by src/proxy.ts
-- ============================================================================
CREATE OR REPLACE FUNCTION public.quickweds_lookup_custom_domain(p_domain text)
RETURNS TABLE(id text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT w.id::text
  FROM public.weddings w
  WHERE w.custom_domain IS NOT NULL
    AND lower(w.custom_domain) = lower(trim(p_domain))
    AND w.deleted_at IS NULL
    AND coalesce((to_jsonb(w)->>'planner_only')::boolean, false) = false
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.quickweds_lookup_custom_domain(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quickweds_lookup_custom_domain(text) TO anon, authenticated, service_role;

-- ============================================================================
-- 5. Fix wedding_collaborators status CHECK constraint to permit 'declined'
-- ============================================================================
DO $$
DECLARE
  constraint_name text;
BEGIN
  IF to_regclass('public.wedding_collaborators') IS NOT NULL THEN
    FOR constraint_name IN
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public.wedding_collaborators'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) ILIKE '%status%'
    LOOP
      EXECUTE format('ALTER TABLE public.wedding_collaborators DROP CONSTRAINT IF EXISTS %I;', constraint_name);
    END LOOP;

    ALTER TABLE public.wedding_collaborators
      ADD CONSTRAINT wedding_collaborators_status_check
      CHECK (status IN ('pending', 'accepted', 'declined'));
  END IF;
END $$;

-- ============================================================================
-- 6. Storage bucket hardening (drop wildcard policies, allow audio MIME types)
-- ============================================================================
DO $$
BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    DROP POLICY IF EXISTS "authenticated_upload_quickweds_media" ON storage.objects;
    DROP POLICY IF EXISTS "authenticated_update_own_quickweds_media" ON storage.objects;
  END IF;

  IF to_regclass('storage.buckets') IS NOT NULL THEN
    UPDATE storage.buckets
    SET allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/ogg',
      'audio/webm'
    ]
    WHERE id = 'quickweds';
  END IF;
END $$;

-- ============================================================================
-- 7. Stripe webhook idempotency table (service-role only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.stripe_webhook_events FROM anon, authenticated;
GRANT ALL ON TABLE public.stripe_webhook_events TO service_role;

-- ============================================================================
-- 8. Missing hot indexes for custom domains, triggers, dashboard, and planner
-- ============================================================================
DO $$
BEGIN
  IF to_regclass('public.weddings') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_weddings_custom_domain_active
      ON public.weddings (lower(custom_domain))
      WHERE custom_domain IS NOT NULL AND deleted_at IS NULL;
  END IF;

  IF to_regclass('public.rsvps') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_created_desc
      ON public.rsvps (wedding_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_lower_email
      ON public.rsvps (wedding_id, lower(guest_email))
      WHERE guest_email IS NOT NULL;
  END IF;

  IF to_regclass('public.planner_vendors') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_planner_vendors_wedding_id
      ON public.planner_vendors (wedding_id);
  END IF;

  IF to_regclass('public.planner_payment_milestones') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_planner_payment_milestones_vendor_id
      ON public.planner_payment_milestones (planner_vendor_id)
      WHERE planner_vendor_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_planner_payment_milestones_budget_id
      ON public.planner_payment_milestones (planner_budget_id)
      WHERE planner_budget_id IS NOT NULL;
  END IF;

  IF to_regclass('public.user_notifications') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created_desc
      ON public.user_notifications (user_id, created_at DESC);
  END IF;

  IF to_regclass('public.wedding_collaborators') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_wedding_collaborators_lower_email_status
      ON public.wedding_collaborators (lower(email), status);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;
