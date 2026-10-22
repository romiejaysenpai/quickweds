BEGIN;
ALTER TABLE public.planner_tasks ADD COLUMN IF NOT EXISTS template_key text;
ALTER TABLE public.planner_tasks ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.planner_tasks ADD COLUMN IF NOT EXISTS assigned_to text;
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

-- Mirror the same party-size rule used by guest-facing reports.
CREATE OR REPLACE FUNCTION public.quickweds_party_size(g jsonb) RETURNS integer
LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
SELECT CASE WHEN g IS NULL OR g->>'attendance'='No' OR (g->>'rsvp_status'='declined' AND coalesce(g->>'attendance','')<>'Yes') THEN 0
WHEN coalesce((g->>'num_guests')::integer,0)>1 THEN (g->>'num_guests')::integer
WHEN coalesce((g->>'plus_one_allowed')::boolean,false) AND coalesce(g->>'plus_one_name','')<>'' AND coalesce(g->>'plus_one_rsvp_status','')<>'declined' THEN 2 ELSE 1 END;
$$;
CREATE OR REPLACE FUNCTION public.quickweds_validate_seating() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE cap integer; needed integer; used integer; next_seat integer; guest jsonb;
BEGIN
  IF TG_OP='UPDATE' AND NEW.rsvp_id IS NULL THEN RETURN NEW; END IF;
  SELECT capacity INTO cap FROM public.seating_tables WHERE id=NEW.table_id AND wedding_id=NEW.wedding_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Table does not belong to this wedding'; END IF;
  SELECT to_jsonb(r) INTO guest FROM public.rsvps r WHERE r.id=NEW.rsvp_id AND r.wedding_id=NEW.wedding_id FOR UPDATE;
  IF guest IS NULL THEN RAISE EXCEPTION 'Guest does not belong to this wedding'; END IF;
  needed:=public.quickweds_party_size(guest);
  IF needed=0 OR NOT (guest->>'attendance'='Yes' OR coalesce(guest->>'rsvp_status','') IN ('confirmed','confirmed_manual')) THEN RAISE EXCEPTION 'Only attending guests can be seated'; END IF;
  SELECT coalesce(sum(public.quickweds_party_size(to_jsonb(r))),0) INTO used FROM public.seating_assignments a JOIN public.rsvps r ON r.id=a.rsvp_id AND r.wedding_id=a.wedding_id WHERE a.table_id=NEW.table_id AND a.id IS DISTINCT FROM NEW.id;
  IF used+needed>cap THEN RAISE EXCEPTION 'This table does not have enough remaining seats'; END IF;
  -- Allocate server-side on every write; submitted seat numbers cannot overlap.
    SELECT candidate INTO next_seat FROM generate_series(1,cap-needed+1) candidate WHERE NOT EXISTS (
      SELECT 1 FROM public.seating_assignments a JOIN public.rsvps r ON r.id=a.rsvp_id WHERE a.table_id=NEW.table_id AND a.id IS DISTINCT FROM NEW.id AND public.quickweds_party_size(to_jsonb(r))>0
      AND candidate<coalesce(a.seat_number,1)+public.quickweds_party_size(to_jsonb(r)) AND candidate+needed>coalesce(a.seat_number,1)
    ) ORDER BY candidate LIMIT 1;
    IF next_seat IS NULL THEN RAISE EXCEPTION 'No adjacent seats remain for this party'; END IF;
    NEW.seat_number:=next_seat;
  RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.quickweds_sync_seating_name() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF TG_OP='UPDATE' AND NEW.rsvp_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP='DELETE' THEN
    UPDATE public.rsvps SET table_assignment=NULL WHERE id=OLD.rsvp_id AND wedding_id=OLD.wedding_id;
    RETURN OLD;
  END IF;
  IF TG_OP='UPDATE' AND OLD.rsvp_id IS DISTINCT FROM NEW.rsvp_id THEN
    UPDATE public.rsvps SET table_assignment=NULL WHERE id=OLD.rsvp_id AND wedding_id=OLD.wedding_id;
  END IF;
  UPDATE public.rsvps SET table_assignment=(SELECT table_name FROM public.seating_tables WHERE id=NEW.table_id) WHERE id=NEW.rsvp_id AND wedding_id=NEW.wedding_id;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS quickweds_validate_seating ON public.seating_assignments;
CREATE TRIGGER quickweds_validate_seating BEFORE INSERT OR UPDATE ON public.seating_assignments FOR EACH ROW EXECUTE FUNCTION public.quickweds_validate_seating();
DROP TRIGGER IF EXISTS quickweds_sync_seating_name ON public.seating_assignments;
CREATE TRIGGER quickweds_sync_seating_name AFTER INSERT OR UPDATE OR DELETE ON public.seating_assignments FOR EACH ROW EXECUTE FUNCTION public.quickweds_sync_seating_name();
CREATE OR REPLACE FUNCTION public.quickweds_update_seating_table() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE used integer;
BEGIN
  SELECT coalesce(sum(public.quickweds_party_size(to_jsonb(r))),0) INTO used FROM public.seating_assignments a JOIN public.rsvps r ON r.id=a.rsvp_id WHERE a.table_id=NEW.id;
  IF NEW.capacity<used THEN RAISE EXCEPTION 'Remove assigned guests before reducing table capacity'; END IF;
  IF NEW.table_name IS DISTINCT FROM OLD.table_name THEN
    UPDATE public.rsvps SET table_assignment=NEW.table_name WHERE id IN (SELECT rsvp_id FROM public.seating_assignments WHERE table_id=NEW.id) AND wedding_id=NEW.wedding_id;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS quickweds_update_seating_table ON public.seating_tables;
CREATE TRIGGER quickweds_update_seating_table BEFORE UPDATE ON public.seating_tables FOR EACH ROW EXECUTE FUNCTION public.quickweds_update_seating_table();
REVOKE ALL ON FUNCTION public.quickweds_update_seating_table() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.quickweds_validate_seating(),public.quickweds_sync_seating_name() FROM PUBLIC;
-- Accept RSVP changes even when the old table no longer fits; return that party to unassigned.
CREATE OR REPLACE FUNCTION public.quickweds_reconcile_guest_seating() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF public.quickweds_party_size(to_jsonb(NEW)) IS DISTINCT FROM public.quickweds_party_size(to_jsonb(OLD)) OR NEW.attendance IS DISTINCT FROM OLD.attendance OR NEW.rsvp_status IS DISTINCT FROM OLD.rsvp_status THEN
   IF NEW.attendance='No' OR (coalesce(NEW.attendance,'')<>'Yes' AND coalesce(NEW.rsvp_status,'') NOT IN ('confirmed','confirmed_manual')) THEN
     DELETE FROM public.seating_assignments WHERE rsvp_id=NEW.id AND wedding_id=NEW.wedding_id;
   ELSE
     BEGIN
       UPDATE public.seating_assignments SET seat_number=seat_number WHERE rsvp_id=NEW.id AND wedding_id=NEW.wedding_id;
     EXCEPTION WHEN raise_exception THEN
       DELETE FROM public.seating_assignments WHERE rsvp_id=NEW.id AND wedding_id=NEW.wedding_id;
     END;
   END IF;
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_reconcile_guest_seating() FROM PUBLIC;
DROP TRIGGER IF EXISTS quickweds_reconcile_guest_seating ON public.rsvps;
CREATE TRIGGER quickweds_reconcile_guest_seating AFTER UPDATE OF attendance,rsvp_status,num_guests,plus_one_allowed,plus_one_name,plus_one_rsvp_status ON public.rsvps FOR EACH ROW EXECUTE FUNCTION public.quickweds_reconcile_guest_seating();
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS planner_only boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION public.quickweds_create_planning_workspace(p_user_id uuid,p_id uuid,p_bride text,p_groom text,p_limit integer)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE existing_id text; total integer;
BEGIN
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
NOTIFY pgrst,'reload schema';
COMMIT;
