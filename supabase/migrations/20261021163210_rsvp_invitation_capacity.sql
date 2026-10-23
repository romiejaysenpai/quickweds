BEGIN;
-- Invitation allowance survives a decline (num_guests is the attendance count).
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS invited_guest_count integer;
UPDATE public.rsvps SET invited_guest_count = LEAST(50, GREATEST(1, COALESCE(num_guests, 1), CASE WHEN plus_one_allowed THEN 2 ELSE 1 END)) WHERE invited_guest_count IS NULL;
ALTER TABLE public.rsvps ALTER COLUMN invited_guest_count SET NOT NULL;
ALTER TABLE public.rsvps ADD CONSTRAINT rsvps_invited_guest_count_bounds CHECK (invited_guest_count BETWEEN 1 AND 50);
CREATE OR REPLACE FUNCTION public.quickweds_initialize_invitation_capacity()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NEW.invited_guest_count IS NULL THEN
    NEW.invited_guest_count := LEAST(50, GREATEST(1, COALESCE(NEW.num_guests, 1), CASE WHEN NEW.plus_one_allowed THEN 2 ELSE 1 END));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER quickweds_initialize_invitation_capacity BEFORE INSERT ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.quickweds_initialize_invitation_capacity();
REVOKE ALL ON FUNCTION public.quickweds_initialize_invitation_capacity() FROM PUBLIC;
NOTIFY pgrst, 'reload schema';
COMMIT;
