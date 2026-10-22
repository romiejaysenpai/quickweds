BEGIN;
CREATE TABLE public.planner_payment_milestones(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
 planner_vendor_id uuid REFERENCES public.planner_vendors(id) ON DELETE CASCADE,
 planner_budget_id uuid REFERENCES public.planner_budgets(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 200),amount numeric(14,2) NOT NULL CHECK(amount>0 AND amount<=999999999),
 due_date date NOT NULL,paid_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(num_nonnulls(planner_vendor_id,planner_budget_id)=1));
CREATE INDEX planner_milestones_wedding_due ON public.planner_payment_milestones(wedding_id,due_date);
CREATE TABLE public.planner_gifts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
 rsvp_id uuid REFERENCES public.rsvps(id) ON DELETE SET NULL,from_name text NOT NULL CHECK(length(from_name) BETWEEN 1 AND 200),
 description text NOT NULL CHECK(length(description) BETWEEN 1 AND 1000),thank_you_completed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX planner_gifts_wedding ON public.planner_gifts(wedding_id,created_at);
CREATE TABLE public.planner_activity(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
 entity_type text NOT NULL,entity_id text NOT NULL,action text NOT NULL CHECK(action IN ('INSERT','UPDATE','DELETE')),
 actor_id uuid,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX planner_activity_wedding_time ON public.planner_activity(wedding_id,created_at DESC);
ALTER TABLE public.planner_payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.planner_payment_milestones,public.planner_gifts,public.planner_activity FROM anon,authenticated;
GRANT ALL ON public.planner_payment_milestones,public.planner_gifts TO service_role;
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
CREATE TRIGGER validate_planner_milestone BEFORE INSERT OR UPDATE ON public.planner_payment_milestones FOR EACH ROW EXECUTE FUNCTION quickweds_private.validate_planner_progress();
CREATE TRIGGER validate_planner_gift BEFORE INSERT OR UPDATE ON public.planner_gifts FOR EACH ROW EXECUTE FUNCTION quickweds_private.validate_planner_progress();

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
CREATE TRIGGER validate_vendor_installments BEFORE UPDATE OF amount ON public.planner_vendors FOR EACH ROW EXECUTE FUNCTION quickweds_private.validate_installment_source();
CREATE TRIGGER validate_budget_installments BEFORE UPDATE OF actual_cost,estimated_cost ON public.planner_budgets FOR EACH ROW EXECUTE FUNCTION quickweds_private.validate_installment_source();

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
 EXECUTE format('CREATE TRIGGER quickweds_activity AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION quickweds_private.log_planner_activity()',tbl);
 END LOOP;
END; $$;
NOTIFY pgrst,'reload schema';
COMMIT;
