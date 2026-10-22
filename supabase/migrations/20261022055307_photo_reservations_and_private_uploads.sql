BEGIN;
ALTER TABLE public.wedding_photos ADD COLUMN IF NOT EXISTS storage_bucket text NOT NULL DEFAULT 'quickweds';
ALTER TABLE public.wedding_photos ADD COLUMN IF NOT EXISTS upload_reservation_id uuid;
ALTER TABLE public.wedding_photos ADD COLUMN IF NOT EXISTS legacy_public_path text;
ALTER TABLE public.wedding_photos ADD COLUMN IF NOT EXISTS legacy_public_hash text;
ALTER TABLE public.wedding_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS anyone_view_approved_photos ON public.wedding_photos;
REVOKE SELECT ON public.wedding_photos FROM anon;
CREATE OR REPLACE FUNCTION public.quickweds_validate_private_photo_path() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF NEW.storage_bucket='quickweds-guest-photos' THEN
  IF NEW.cloudinary_public_id IS NULL OR NEW.cloudinary_public_id NOT LIKE 'guest-uploads/'||NEW.wedding_id||'/%' OR NEW.cloudinary_public_id ~ '(^|/)[.][.]?(/|$)|[%\\]' THEN RAISE EXCEPTION 'Invalid private photo path'; END IF;
 END IF;
 IF TG_OP='UPDATE' AND OLD.storage_bucket='quickweds-guest-photos' AND (NEW.storage_bucket IS DISTINCT FROM OLD.storage_bucket OR NEW.cloudinary_public_id IS DISTINCT FROM OLD.cloudinary_public_id OR NEW.wedding_id IS DISTINCT FROM OLD.wedding_id) THEN RAISE EXCEPTION 'Private photo location is immutable'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_validate_private_photo_path() FROM PUBLIC;
CREATE TRIGGER quickweds_validate_private_photo_path BEFORE INSERT OR UPDATE ON public.wedding_photos FOR EACH ROW EXECUTE FUNCTION public.quickweds_validate_private_photo_path();
CREATE UNIQUE INDEX IF NOT EXISTS wedding_photo_reservation ON public.wedding_photos(upload_reservation_id);
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('quickweds-guest-photos','quickweds-guest-photos',false,10485760,ARRAY['image/jpeg','image/png','image/webp','image/gif']) ON CONFLICT(id)DO UPDATE SET public=false;
CREATE TABLE IF NOT EXISTS public.photo_guest_usage(wedding_id text REFERENCES public.weddings(id) ON DELETE CASCADE,principal text,used integer NOT NULL DEFAULT 0 CHECK(used>=0),PRIMARY KEY(wedding_id,principal));
CREATE TABLE IF NOT EXISTS public.photo_upload_reservations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text REFERENCES public.weddings(id) ON DELETE CASCADE,code_id uuid REFERENCES public.photo_sharing_codes(id) ON DELETE CASCADE,principal text NOT NULL,request_key uuid NOT NULL,content_hash text NOT NULL,object_path text NOT NULL,state text NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','complete','failed')),photo_id uuid,photo_data jsonb,claim_token uuid,lease_until timestamptz,path_history text[] NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(wedding_id,principal,request_key));
ALTER TABLE public.photo_guest_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_upload_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.photo_guest_usage,public.photo_upload_reservations FROM anon,authenticated;
GRANT ALL ON public.photo_guest_usage,public.photo_upload_reservations TO service_role;
CREATE OR REPLACE FUNCTION public.quickweds_reserve_photo(p_wedding text,p_code uuid,p_principal text,p_request uuid,p_hash text,p_path text,p_guest_limit integer,p_data jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE code public.photo_sharing_codes; used_total integer; reservation public.photo_upload_reservations;
BEGIN
 SELECT * INTO code FROM public.photo_sharing_codes WHERE id=p_code AND wedding_id=p_wedding AND is_active AND (expires_at IS NULL OR expires_at>clock_timestamp()) FOR UPDATE;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.weddings WHERE id=p_wedding AND deleted_at IS NULL AND NOT planner_only) THEN RETURN jsonb_build_object('state','invalid'); END IF;
 SELECT * INTO reservation FROM public.photo_upload_reservations WHERE wedding_id=p_wedding AND principal=p_principal AND request_key=p_request FOR UPDATE;
 IF FOUND THEN
   IF reservation.content_hash<>p_hash OR reservation.code_id<>p_code THEN RETURN jsonb_build_object('state','conflict'); END IF;
   IF reservation.state='complete' THEN RETURN to_jsonb(reservation); END IF;
   IF reservation.state='reserved' THEN RETURN jsonb_build_object('state','busy','id',reservation.id); END IF;
 END IF;
 INSERT INTO public.photo_guest_usage(wedding_id,principal)VALUES(p_wedding,p_principal)ON CONFLICT DO NOTHING;
 SELECT u.used INTO used_total FROM public.photo_guest_usage u WHERE wedding_id=p_wedding AND principal=p_principal FOR UPDATE;
 IF coalesce(code.current_uploads,0)>=coalesce(code.max_uploads,1000) OR used_total>=greatest(1,p_guest_limit) THEN RETURN jsonb_build_object('state','limited'); END IF;
 UPDATE public.photo_sharing_codes SET current_uploads=coalesce(current_uploads,0)+1 WHERE id=p_code;
 UPDATE public.photo_guest_usage SET used=used+1 WHERE wedding_id=p_wedding AND principal=p_principal;
 IF reservation.id IS NULL THEN
   INSERT INTO public.photo_upload_reservations(wedding_id,code_id,principal,request_key,content_hash,object_path,photo_data,claim_token,lease_until)VALUES(p_wedding,p_code,p_principal,p_request,p_hash,p_path,p_data,gen_random_uuid(),clock_timestamp()+interval '5 minutes') RETURNING * INTO reservation;
 ELSE
   UPDATE public.photo_upload_reservations SET state='reserved',path_history=CASE WHEN object_path<>p_path THEN array_append(path_history,object_path) ELSE path_history END,object_path=p_path,photo_data=coalesce(photo_data,p_data),claim_token=gen_random_uuid(),lease_until=clock_timestamp()+interval '5 minutes',created_at=now() WHERE id=reservation.id RETURNING * INTO reservation;
 END IF;
 RETURN to_jsonb(reservation);
END; $$;
CREATE OR REPLACE FUNCTION public.quickweds_release_photo(p_id uuid,p_claim uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE r public.photo_upload_reservations;
BEGIN
 SELECT * INTO r FROM public.photo_upload_reservations WHERE id=p_id;
 IF NOT FOUND THEN RETURN; END IF;
 PERFORM 1 FROM public.photo_sharing_codes WHERE id=r.code_id FOR UPDATE;
 SELECT * INTO r FROM public.photo_upload_reservations WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR r.state<>'reserved' OR r.claim_token IS DISTINCT FROM p_claim THEN RETURN; END IF;
 UPDATE public.photo_sharing_codes SET current_uploads=greatest(0,current_uploads-1) WHERE id=r.code_id;
 UPDATE public.photo_guest_usage SET used=greatest(0,used-1) WHERE wedding_id=r.wedding_id AND principal=r.principal;
 UPDATE public.photo_upload_reservations SET state='failed',claim_token=NULL,lease_until=NULL WHERE id=p_id;
END; $$;
CREATE OR REPLACE FUNCTION public.quickweds_complete_photo(p_id uuid,p_data jsonb,p_claim uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE r public.photo_upload_reservations; created_id uuid; auto_approve boolean:=false;
BEGIN
 SELECT * INTO r FROM public.photo_upload_reservations WHERE id=p_id FOR UPDATE;
 IF r.state='complete' THEN RETURN r.photo_id; END IF;
 IF NOT FOUND OR r.state<>'reserved' OR r.claim_token IS DISTINCT FROM p_claim THEN RAISE EXCEPTION 'Invalid photo reservation'; END IF;
 p_data:=coalesce(r.photo_data,p_data);
 IF to_regclass('public.photo_portal_settings') IS NOT NULL THEN
 EXECUTE 'SELECT coalesce((to_jsonb(s)->>''disposable_camera_enabled'')::boolean,false) AND NOT coalesce((to_jsonb(s)->>''require_approval'')::boolean,true) FROM public.photo_portal_settings s WHERE wedding_id=$1' INTO auto_approve USING r.wedding_id;
 END IF;
 auto_approve:=coalesce(auto_approve,false) AND coalesce((p_data->>'is_approved')::boolean,false);
 INSERT INTO public.wedding_photos(wedding_id,uploader_name,cloudinary_url,cloudinary_public_id,storage_bucket,caption,message,guest_identifier,upload_source,status,is_approved,approved_at,metadata,upload_reservation_id)
 VALUES(r.wedding_id,p_data->>'uploader_name',p_data->>'cloudinary_url',r.object_path,'quickweds-guest-photos',p_data->>'caption',p_data->>'caption',r.principal,'guest_upload',CASE WHEN auto_approve THEN 'approved' ELSE 'pending' END,auto_approve,CASE WHEN auto_approve THEN now() ELSE NULL END,p_data->'metadata',r.id) RETURNING id INTO created_id;
 UPDATE public.photo_upload_reservations SET state='complete',photo_id=created_id,lease_until=NULL WHERE id=p_id;
 RETURN created_id;
END; $$;
CREATE OR REPLACE FUNCTION public.quickweds_claim_photo_recovery(p_id uuid,p_wedding text) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE r public.photo_upload_reservations;
BEGIN
 SELECT * INTO r FROM public.photo_upload_reservations WHERE id=p_id AND wedding_id=p_wedding;
 IF NOT FOUND THEN RETURN NULL; END IF;
 PERFORM 1 FROM public.photo_sharing_codes WHERE id=r.code_id FOR UPDATE;
 SELECT * INTO r FROM public.photo_upload_reservations WHERE id=p_id AND wedding_id=p_wedding FOR UPDATE;
 IF r.state<>'reserved' OR r.lease_until>clock_timestamp() THEN RETURN NULL; END IF;
 UPDATE public.photo_upload_reservations SET claim_token=gen_random_uuid(),lease_until=clock_timestamp()+interval '5 minutes' WHERE id=p_id RETURNING * INTO r;
 RETURN to_jsonb(r);
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_claim_photo_recovery(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quickweds_claim_photo_recovery(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.quickweds_reserve_photo(text,uuid,text,uuid,text,text,integer,jsonb),public.quickweds_release_photo(uuid,uuid),public.quickweds_complete_photo(uuid,jsonb,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quickweds_reserve_photo(text,uuid,text,uuid,text,text,integer,jsonb),public.quickweds_release_photo(uuid,uuid),public.quickweds_complete_photo(uuid,jsonb,uuid) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
