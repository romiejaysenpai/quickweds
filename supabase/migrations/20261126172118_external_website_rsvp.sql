-- Additive prerequisites for private planning and explicitly published RSVP pages.
-- Existing invitations, external URLs, policies and rows are preserved.
BEGIN;
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS planner_only boolean NOT NULL DEFAULT false;
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS external_website_url text;
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS rsvp_page_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.planner_tasks ADD COLUMN IF NOT EXISTS due_date timestamptz;
ALTER TABLE public.planner_tasks ADD COLUMN IF NOT EXISTS template_key text;
ALTER TABLE public.planner_tasks ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.planner_tasks ADD COLUMN IF NOT EXISTS assigned_to text;
ALTER TABLE public.planner_budgets ADD COLUMN IF NOT EXISTS actual_cost numeric DEFAULT 0;
ALTER TABLE public.planner_budgets ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false;
ALTER TABLE public.planner_budgets ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.planner_vendors ADD COLUMN IF NOT EXISTS notes text;

CREATE OR REPLACE FUNCTION public.quickweds_seed_checklist(p_wedding_id text, p_rows jsonb, p_limit integer)
RETURNS SETOF public.planner_tasks LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE needed integer; existing integer;
BEGIN
  IF current_setting('role',true) NOT IN ('service_role','postgres','supabase_admin','none') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_array_length(p_rows) > 100 THEN RAISE EXCEPTION 'Invalid checklist'; END IF;
  PERFORM 1 FROM public.weddings WHERE id=p_wedding_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wedding not found'; END IF;
  SELECT count(*) INTO existing FROM public.planner_tasks WHERE wedding_id=p_wedding_id;
  SELECT count(*) INTO needed FROM (SELECT DISTINCT ON (item->>'template_key') item FROM jsonb_array_elements(p_rows) item) rows
  WHERE NOT EXISTS (SELECT 1 FROM public.planner_tasks t WHERE t.wedding_id=p_wedding_id AND (t.template_key=rows.item->>'template_key' OR (lower(trim(t.title))=lower(trim(rows.item->>'title')) AND split_part(coalesce(t.section,t.category),'||QW_TASK_META||',1)=rows.item->>'section')));
  IF p_limit IS NOT NULL AND existing+needed>p_limit THEN RAISE EXCEPTION 'planner_limit_reached'; END IF;
  RETURN QUERY INSERT INTO public.planner_tasks(wedding_id,title,status,category,section,template_key,due_date,assigned_to)
  SELECT p_wedding_id,item->>'title','pending',item->>'section',item->>'section',item->>'template_key',nullif(item->>'due_date','')::timestamptz,item->>'assigned_to'
  FROM (SELECT DISTINCT ON (item->>'template_key') item FROM jsonb_array_elements(p_rows) item) rows
  WHERE NOT EXISTS (SELECT 1 FROM public.planner_tasks t WHERE t.wedding_id=p_wedding_id AND (t.template_key=rows.item->>'template_key' OR (lower(trim(t.title))=lower(trim(rows.item->>'title')) AND split_part(coalesce(t.section,t.category),'||QW_TASK_META||',1)=rows.item->>'section')))
  RETURNING *;
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_seed_checklist(text,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quickweds_seed_checklist(text,jsonb,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.quickweds_create_planning_workspace(p_user_id uuid,p_id uuid,p_bride text,p_groom text,p_limit integer)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE existing_id text; total integer;
BEGIN
  IF current_setting('role',true) NOT IN ('service_role','postgres','supabase_admin','none') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  SELECT id INTO existing_id FROM public.weddings WHERE id=p_id::text AND user_id=p_user_id AND deleted_at IS NULL;
  IF existing_id IS NOT NULL THEN RETURN existing_id; END IF;
  SELECT count(*) INTO total FROM public.weddings WHERE user_id=p_user_id AND deleted_at IS NULL;
  IF p_limit IS NOT NULL AND total>=p_limit THEN RAISE EXCEPTION 'website_limit_reached'; END IF;
  INSERT INTO public.weddings(id,user_id,bride_name,groom_name,planner_only,is_published) VALUES(p_id::text,p_user_id,p_bride,p_groom,true,false);
  RETURN p_id::text;
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_create_planning_workspace(uuid,uuid,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quickweds_create_planning_workspace(uuid,uuid,text,text,integer) TO service_role;

CREATE SCHEMA IF NOT EXISTS quickweds_private;
REVOKE ALL ON SCHEMA quickweds_private FROM PUBLIC,anon;
GRANT USAGE ON SCHEMA quickweds_private TO service_role;

CREATE TABLE IF NOT EXISTS public.planner_payment_milestones(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
 planner_vendor_id uuid REFERENCES public.planner_vendors(id) ON DELETE CASCADE,
 planner_budget_id uuid REFERENCES public.planner_budgets(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 200),amount numeric(14,2) NOT NULL CHECK(amount>0 AND amount<=999999999),
 due_date date NOT NULL,paid_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(num_nonnulls(planner_vendor_id,planner_budget_id)=1));
CREATE INDEX IF NOT EXISTS planner_milestones_wedding_due ON public.planner_payment_milestones(wedding_id,due_date);
CREATE TABLE IF NOT EXISTS public.planner_gifts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
 rsvp_id uuid REFERENCES public.rsvps(id) ON DELETE SET NULL,from_name text NOT NULL CHECK(length(from_name) BETWEEN 1 AND 200),
 description text NOT NULL CHECK(length(description) BETWEEN 1 AND 1000),thank_you_completed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS planner_gifts_wedding ON public.planner_gifts(wedding_id,created_at);
CREATE TABLE IF NOT EXISTS public.planner_activity(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
 entity_type text NOT NULL,entity_id text NOT NULL,action text NOT NULL CHECK(action IN ('INSERT','UPDATE','DELETE')),
 actor_id uuid,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS planner_activity_wedding_time ON public.planner_activity(wedding_id,created_at DESC);
ALTER TABLE public.planner_payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.planner_payment_milestones,public.planner_gifts,public.planner_activity FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.planner_payment_milestones,public.planner_gifts TO service_role;
REVOKE ALL ON public.planner_activity FROM service_role;
GRANT SELECT ON public.planner_activity TO service_role;

CREATE OR REPLACE FUNCTION quickweds_private.validate_planner_progress() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE linked_wedding text; commitment numeric; scheduled numeric;
BEGIN
 IF TG_TABLE_NAME='planner_gifts' THEN
   IF NEW.rsvp_id IS NULL THEN RETURN NEW; END IF;
   SELECT wedding_id INTO linked_wedding FROM public.rsvps WHERE id=NEW.rsvp_id;
 ELSE
   -- Lock the cost item so concurrently added installments cannot exceed its commitment.
   IF NEW.planner_vendor_id IS NOT NULL THEN
     SELECT wedding_id,amount INTO linked_wedding,commitment FROM public.planner_vendors WHERE id=NEW.planner_vendor_id FOR UPDATE;
   ELSE SELECT wedding_id,coalesce(nullif(actual_cost,0),estimated_cost,0) INTO linked_wedding,commitment FROM public.planner_budgets WHERE id=NEW.planner_budget_id FOR UPDATE;
   END IF;
 END IF;
 IF linked_wedding IS DISTINCT FROM NEW.wedding_id THEN RAISE EXCEPTION 'Linked item belongs to another wedding'; END IF;
 IF TG_TABLE_NAME='planner_payment_milestones' THEN
   SELECT coalesce(sum(amount),0) INTO scheduled FROM public.planner_payment_milestones WHERE id IS DISTINCT FROM NEW.id AND (planner_vendor_id=NEW.planner_vendor_id OR planner_budget_id=NEW.planner_budget_id);
   IF scheduled+NEW.amount>coalesce(commitment,0) THEN RAISE EXCEPTION 'Installments exceed the linked cost. Update that cost first.'; END IF;
 END IF;
 RETURN NEW;
END; $$;
DO $guard$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.planner_payment_milestones'::regclass AND tgname='validate_planner_milestone' AND NOT tgisinternal) THEN
  CREATE TRIGGER validate_planner_milestone BEFORE INSERT OR UPDATE ON public.planner_payment_milestones FOR EACH ROW EXECUTE FUNCTION quickweds_private.validate_planner_progress();
 END IF;
END $guard$;
DO $guard$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.planner_gifts'::regclass AND tgname='validate_planner_gift' AND NOT tgisinternal) THEN
  CREATE TRIGGER validate_planner_gift BEFORE INSERT OR UPDATE ON public.planner_gifts FOR EACH ROW EXECUTE FUNCTION quickweds_private.validate_planner_progress();
 END IF;
END $guard$;

CREATE OR REPLACE FUNCTION quickweds_private.validate_installment_source() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE commitment numeric; scheduled numeric;
BEGIN
 -- Original source-table RLS authorizes the write. This private trigger may only deny it,
 -- and needs the private milestone total without granting browser access to that table.
 IF current_setting('role',true) NOT IN ('none','postgres','service_role','supabase_admin') AND auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF TG_TABLE_NAME='planner_vendors' THEN
  commitment:=coalesce((to_jsonb(NEW)->>'amount')::numeric,0);
  SELECT coalesce(sum(amount),0) INTO scheduled FROM public.planner_payment_milestones WHERE planner_vendor_id=NEW.id;
 ELSE
  commitment:=coalesce(nullif((to_jsonb(NEW)->>'actual_cost')::numeric,0),(to_jsonb(NEW)->>'estimated_cost')::numeric,0);
  SELECT coalesce(sum(amount),0) INTO scheduled FROM public.planner_payment_milestones WHERE planner_budget_id=NEW.id;
 END IF;
 IF commitment<scheduled THEN RAISE EXCEPTION 'Adjust the installments before reducing this cost'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION quickweds_private.validate_installment_source() FROM PUBLIC;
DO $guard$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.planner_vendors'::regclass AND tgname='validate_vendor_installments' AND NOT tgisinternal) THEN
  CREATE TRIGGER validate_vendor_installments BEFORE UPDATE OF amount ON public.planner_vendors FOR EACH ROW EXECUTE FUNCTION quickweds_private.validate_installment_source();
 END IF;
END $guard$;
DO $guard$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.planner_budgets'::regclass AND tgname='validate_budget_installments' AND NOT tgisinternal) THEN
  CREATE TRIGGER validate_budget_installments BEFORE UPDATE OF actual_cost,estimated_cost ON public.planner_budgets FOR EACH ROW EXECUTE FUNCTION quickweds_private.validate_installment_source();
 END IF;
END $guard$;

-- No field contents are copied. Identity is the authenticated DB caller, or NULL for server jobs.
CREATE OR REPLACE FUNCTION quickweds_private.log_planner_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE item jsonb; old_item jsonb;
BEGIN
 IF TG_OP='DELETE' THEN item:=to_jsonb(OLD); ELSE item:=to_jsonb(NEW); END IF;
 IF TG_OP='UPDATE' THEN old_item:=to_jsonb(OLD); IF item=old_item THEN RETURN NEW; END IF; END IF;
 IF EXISTS(SELECT 1 FROM public.weddings WHERE id=item->>'wedding_id' AND deleted_at IS NULL) THEN
 INSERT INTO public.planner_activity(wedding_id,entity_type,entity_id,action,actor_id)VALUES(item->>'wedding_id',TG_TABLE_NAME,item->>'id',TG_OP,auth.uid());
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END; $$;
REVOKE ALL ON FUNCTION quickweds_private.validate_planner_progress(),quickweds_private.log_planner_activity() FROM PUBLIC,anon,authenticated;
DO $$ DECLARE tbl text; BEGIN
 FOREACH tbl IN ARRAY ARRAY['planner_tasks','planner_budgets','planner_vendors','planner_events','seating_assignments','wedding_collaborators','planner_payment_milestones','planner_gifts'] LOOP
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid=to_regclass('public.'||tbl) AND tgname='quickweds_activity' AND NOT tgisinternal) THEN
  EXECUTE format('CREATE TRIGGER quickweds_activity AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION quickweds_private.log_planner_activity()',tbl);
 END IF;
 END LOOP;
END; $$;



-- Browser clients may continue editing or publishing their own ordinary websites.
-- Enabling RSVP on a private workspace requires the authorized connection API.
CREATE OR REPLACE FUNCTION public.quickweds_guard_rsvp_publication()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF current_setting('role',true) NOT IN ('service_role','postgres','supabase_admin','none') THEN
  IF (TG_OP='INSERT' AND NEW.rsvp_page_enabled) OR
     (TG_OP='UPDATE' AND NEW.rsvp_page_enabled IS DISTINCT FROM OLD.rsvp_page_enabled) THEN
   RAISE EXCEPTION 'Use the website connection settings to change RSVP publication' USING ERRCODE='42501';
  END IF;
 END IF;
 IF NEW.rsvp_page_enabled THEN
  IF NOT coalesce(NEW.planner_only,false) OR
     coalesce(NEW.external_website_url,'') !~ '^https://[^/@[:space:]]+\.[^/@[:space:]]+' OR
     coalesce(trim(NEW.bride_name),'')='' OR coalesce(trim(NEW.groom_name),'')='' OR
     coalesce(NEW.wedding_date::text,'') !~ '^\d{4}-\d{2}-\d{2}$' OR
     coalesce(NEW.rsvp_deadline::text,'') !~ '^\d{4}-\d{2}-\d{2}$' THEN
   RAISE EXCEPTION 'Complete the external website and RSVP details before publishing';
  END IF;
  IF to_char(NEW.wedding_date::date,'YYYY-MM-DD')<>NEW.wedding_date::text OR
     to_char(NEW.rsvp_deadline::date,'YYYY-MM-DD')<>NEW.rsvp_deadline::text OR
     NEW.rsvp_deadline::date>NEW.wedding_date::date THEN
   RAISE EXCEPTION 'Invalid wedding date or RSVP deadline';
  END IF;
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_guard_rsvp_publication() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS quickweds_guard_rsvp_publication ON public.weddings;
CREATE TRIGGER quickweds_guard_rsvp_publication BEFORE INSERT OR UPDATE ON public.weddings
FOR EACH ROW EXECUTE FUNCTION public.quickweds_guard_rsvp_publication();
NOTIFY pgrst,'reload schema';
COMMIT;
