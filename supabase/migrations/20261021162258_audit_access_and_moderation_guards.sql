-- A01/A03/A04: protect direct Data API writes as well as server routes.
-- No existing customer rows are changed. Apply only after migration-drift review.
BEGIN;

-- current_user becomes the function owner inside SECURITY DEFINER code. Trust
-- the connection's SET ROLE instead; direct maintenance sessions have role=none.
CREATE OR REPLACE FUNCTION public.is_service_role_caller()
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT coalesce(current_setting('role', true) IN ('service_role', 'postgres', 'supabase_admin'), false)
    OR (coalesce(current_setting('role', true), 'none') = 'none'
        AND session_user IN ('postgres', 'supabase_admin'));
$$;
REVOKE ALL ON FUNCTION public.is_service_role_caller() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_service_role_caller() TO anon, authenticated, service_role;

-- Avoid policy recursion through weddings' collaborator SELECT policies. The
-- helper can only answer for the authenticated caller, never an arbitrary user.
CREATE SCHEMA IF NOT EXISTS quickweds_private;
REVOKE ALL ON SCHEMA quickweds_private FROM PUBLIC;
GRANT USAGE ON SCHEMA quickweds_private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION quickweds_private.owns_collaborator_wedding(target_wedding_id text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = target_wedding_id AND w.user_id = auth.uid()
      AND w.deleted_at IS NULL
  );
$$;
REVOKE ALL ON FUNCTION quickweds_private.owns_collaborator_wedding(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION quickweds_private.owns_collaborator_wedding(text) TO authenticated, service_role;

DROP POLICY IF EXISTS "Owners and invitees can manage collaborators" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "owners_can_manage_collaborators" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "quickweds_invitees_can_accept_own_invites" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "quickweds_invitees_can_view_own_invites" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "collaborators_view_own_invites" ON public.wedding_collaborators;

DROP POLICY IF EXISTS "quickweds_collaborator_read" ON public.wedding_collaborators;
CREATE POLICY "quickweds_collaborator_read" ON public.wedding_collaborators
FOR SELECT TO authenticated USING (
  quickweds_private.owns_collaborator_wedding(wedding_id)
  OR lower(email) = lower(auth.email())
);
DROP POLICY IF EXISTS "quickweds_collaborator_invite" ON public.wedding_collaborators;
CREATE POLICY "quickweds_collaborator_invite" ON public.wedding_collaborators
FOR INSERT TO authenticated WITH CHECK (
  quickweds_private.owns_collaborator_wedding(wedding_id) AND status = 'pending'
);
DROP POLICY IF EXISTS "quickweds_collaborator_remove" ON public.wedding_collaborators;
CREATE POLICY "quickweds_collaborator_remove" ON public.wedding_collaborators
FOR DELETE TO authenticated USING (quickweds_private.owns_collaborator_wedding(wedding_id));
DROP POLICY IF EXISTS "quickweds_collaborator_respond" ON public.wedding_collaborators;
CREATE POLICY "quickweds_collaborator_respond" ON public.wedding_collaborators
FOR UPDATE TO authenticated USING (
  quickweds_private.owns_collaborator_wedding(wedding_id)
  OR (lower(email) = lower(auth.email()) AND status = 'pending')
) WITH CHECK (
  quickweds_private.owns_collaborator_wedding(wedding_id)
  OR (lower(email) = lower(auth.email()) AND status IN ('accepted', 'declined'))
);

CREATE OR REPLACE FUNCTION public.protect_wedding_collaborators_update()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF public.is_service_role_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NOT quickweds_private.owns_collaborator_wedding(NEW.wedding_id) OR NEW.status <> 'pending' THEN
      RAISE EXCEPTION 'Only wedding owners can create pending invitations' USING ERRCODE = '42501';
    END IF;
    -- Accommodate deployed schemas with either historical inviter column name.
    IF (to_jsonb(NEW) ? 'invited_by_user_id' AND
        (to_jsonb(NEW)->>'invited_by_user_id') IS DISTINCT FROM auth.uid()::text)
       OR (to_jsonb(NEW) ? 'invited_by' AND
        (to_jsonb(NEW)->>'invited_by') IS DISTINCT FROM auth.uid()::text) THEN
      RAISE EXCEPTION 'Invitation sender must be the wedding owner' USING ERRCODE = '42501';
    END IF;
  ELSE
    -- Only the response state may change. This also protects future identity
    -- columns without depending on the historical inviter column spelling.
    IF (to_jsonb(NEW) - ARRAY['status', 'updated_at']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status', 'updated_at']) THEN
      RAISE EXCEPTION 'Invitation identity and permissions cannot be changed' USING ERRCODE = '42501';
    END IF;
    IF NOT quickweds_private.owns_collaborator_wedding(OLD.wedding_id) AND (
      lower(OLD.email) IS DISTINCT FROM lower(auth.email()) OR OLD.status <> 'pending'
      OR NEW.status NOT IN ('accepted', 'declined')
    ) THEN
      RAISE EXCEPTION 'Only the invited recipient can respond to a pending invitation' USING ERRCODE = '42501';
    END IF;
    IF NEW.status NOT IN ('pending', 'accepted', 'declined') THEN
      RAISE EXCEPTION 'Invalid invitation state' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_wedding_collaborators_update ON public.wedding_collaborators;
CREATE TRIGGER trg_protect_wedding_collaborators_update
BEFORE INSERT OR UPDATE ON public.wedding_collaborators
FOR EACH ROW EXECUTE FUNCTION public.protect_wedding_collaborators_update();

CREATE OR REPLACE FUNCTION public.quickweds_protect_supplier_moderation()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF public.is_service_role_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('draft', 'pending_review') OR NEW.is_featured OR NEW.display_order <> 0 THEN
      RAISE EXCEPTION 'Supplier approval and placement require moderation' USING ERRCODE = '42501';
    END IF;
  ELSE
    IF NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
       OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
       OR NEW.display_order IS DISTINCT FROM OLD.display_order
       OR (NEW.status IS DISTINCT FROM OLD.status AND NOT (
         OLD.status IN ('draft', 'pending_review', 'rejected') AND NEW.status IN ('draft', 'pending_review')
       )) THEN
      RAISE EXCEPTION 'Supplier approval and placement require moderation' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS quickweds_protect_supplier_moderation ON public.supplier_profiles;
CREATE TRIGGER quickweds_protect_supplier_moderation
BEFORE INSERT OR UPDATE ON public.supplier_profiles
FOR EACH ROW EXECUTE FUNCTION public.quickweds_protect_supplier_moderation();

-- Review submission remains public, with caller-bound identity and no badges.
DROP POLICY IF EXISTS "Anyone can submit an app_review" ON public.app_reviews;
CREATE POLICY "Anyone can submit an app_review" ON public.app_reviews
FOR INSERT TO anon, authenticated WITH CHECK (
  user_id IS NOT DISTINCT FROM auth.uid() AND status = 'pending'
  AND NOT verified_couple AND NOT is_featured
);
DROP POLICY IF EXISTS "Service role has full access to app_reviews" ON public.app_reviews;
CREATE POLICY "Service role has full access to app_reviews" ON public.app_reviews
FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Users can read their own app_reviews" ON public.app_reviews;
CREATE POLICY "Users can read their own app_reviews" ON public.app_reviews
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.quickweds_protect_review_moderation()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF public.is_service_role_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.user_id := auth.uid();
    -- Only trusted server verification may associate a review with a wedding.
    NEW.wedding_id := NULL;
    NEW.status := 'pending';
    NEW.verified_couple := false;
    NEW.is_featured := false;
  ELSE
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.wedding_id IS DISTINCT FROM OLD.wedding_id
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.verified_couple IS DISTINCT FROM OLD.verified_couple
       OR NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
      RAISE EXCEPTION 'Review identity and moderation require server verification' USING ERRCODE = '42501';
    END IF;
    -- Editing published copy requires another moderation pass.
    IF (to_jsonb(NEW) - ARRAY['updated_at', 'status', 'is_featured'])
       IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['updated_at', 'status', 'is_featured']) THEN
      NEW.status := 'pending';
      NEW.is_featured := false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS quickweds_protect_review_moderation ON public.app_reviews;
CREATE TRIGGER quickweds_protect_review_moderation
BEFORE INSERT OR UPDATE ON public.app_reviews
FOR EACH ROW EXECUTE FUNCTION public.quickweds_protect_review_moderation();

REVOKE ALL ON FUNCTION public.protect_wedding_collaborators_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.quickweds_protect_supplier_moderation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.quickweds_protect_review_moderation() FROM PUBLIC;

NOTIFY pgrst, 'reload schema';
COMMIT;
