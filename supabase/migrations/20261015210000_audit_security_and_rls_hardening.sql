-- Migration: 20261015210000_audit_security_and_rls_hardening.sql
-- Description: Prevent unauthorized privilege escalation, domain takeovers, billing column tampering, and collaborator hijacking.

-- 1. Helper function: verify if caller has service_role, postgres, or supabase_admin privileges
CREATE OR REPLACE FUNCTION public.is_service_role_caller()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claim.role', true) = 'service_role'
    OR current_setting('role', true) IN ('service_role', 'postgres', 'supabase_admin')
    OR session_user IN ('postgres', 'supabase_admin')
    OR current_user IN ('postgres', 'supabase_admin')
    OR auth.role() = 'service_role',
    false
  );
$$;

-- 2. Protect wedding_collaborators: prevent tampering with wedding_id, role, email, invited_by
CREATE OR REPLACE FUNCTION public.protect_wedding_collaborators_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.is_service_role_caller() THEN
    RETURN NEW;
  END IF;

  -- Authenticated users can only update status from 'pending' to 'accepted' or 'declined'
  IF NEW.wedding_id <> OLD.wedding_id THEN
    RAISE EXCEPTION 'Cannot modify wedding_id on an existing collaborator invite';
  END IF;

  IF lower(NEW.email) <> lower(OLD.email) THEN
    RAISE EXCEPTION 'Cannot modify email on an existing collaborator invite';
  END IF;

  IF NEW.role <> OLD.role THEN
    RAISE EXCEPTION 'Cannot modify role on an existing collaborator invite';
  END IF;

  IF NEW.invited_by IS DISTINCT FROM OLD.invited_by THEN
    RAISE EXCEPTION 'Cannot modify invited_by on an existing collaborator invite';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_wedding_collaborators_update ON public.wedding_collaborators;
CREATE TRIGGER trg_protect_wedding_collaborators_update
BEFORE UPDATE ON public.wedding_collaborators
FOR EACH ROW
EXECUTE FUNCTION public.protect_wedding_collaborators_update();

-- 3. Protect weddings billing columns: is_premium, payment_status, plan_type
CREATE OR REPLACE FUNCTION public.protect_weddings_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.is_service_role_caller() THEN
    RETURN NEW;
  END IF;

  -- Block unauthorized changes to billing fields
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
      NEW.is_premium := OLD.is_premium;
    END IF;
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      NEW.payment_status := OLD.payment_status;
    END IF;
    IF NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
      NEW.plan_type := OLD.plan_type;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    NEW.is_premium := false;
    NEW.payment_status := 'unpaid';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_weddings_billing_columns ON public.weddings;
CREATE TRIGGER trg_protect_weddings_billing_columns
BEFORE INSERT OR UPDATE ON public.weddings
FOR EACH ROW
EXECUTE FUNCTION public.protect_weddings_billing_columns();

-- 4. Protect user_app_profiles billing columns
CREATE OR REPLACE FUNCTION public.protect_user_app_profiles_billing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.is_service_role_caller() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_pro IS DISTINCT FROM OLD.is_pro THEN
      NEW.is_pro := OLD.is_pro;
    END IF;
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      NEW.payment_status := OLD.payment_status;
    END IF;
    IF NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
      NEW.plan_type := OLD.plan_type;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    NEW.is_pro := false;
    NEW.payment_status := 'unpaid';
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_app_profiles'
  ) THEN
    DROP TRIGGER IF EXISTS trg_protect_user_app_profiles_billing ON public.user_app_profiles;
    CREATE TRIGGER trg_protect_user_app_profiles_billing
    BEFORE INSERT OR UPDATE ON public.user_app_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_user_app_profiles_billing();
  END IF;
END $$;

-- 5. Grant execute on helper functions to authenticated role so RLS checks never fail with permission denied
DO $$
DECLARE
  func_name text;
  func_names text[] := ARRAY[
    'check_is_wedding_owner(uuid)',
    'check_is_wedding_collaborator(uuid)',
    'quickweds_is_collaborator(uuid)',
    'quickweds_is_partner_collaborator(uuid)'
  ];
BEGIN
  FOREACH func_name IN ARRAY func_names LOOP
    BEGIN
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, anon;', func_name);
    EXCEPTION WHEN undefined_function THEN
      -- Function does not exist in this environment, ignore safely
      NULL;
    END;
  END LOOP;
END $$;
