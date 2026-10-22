BEGIN;
ALTER TABLE public.wedding_collaborators ADD COLUMN IF NOT EXISTS invited_by_user_id uuid;
ALTER TABLE public.entourage_invitations ADD COLUMN IF NOT EXISTS card_theme text DEFAULT 'classic';
ALTER TABLE public.entourage_invitations ADD COLUMN IF NOT EXISTS proposal_title text;
ALTER TABLE public.entourage_invitations ADD COLUMN IF NOT EXISTS proposal_hero_image_url text;
ALTER TABLE public.entourage_invitations ADD COLUMN IF NOT EXISTS send_operation_id uuid;
ALTER TABLE public.entourage_invitations ADD COLUMN IF NOT EXISTS send_fingerprint text;
CREATE TABLE IF NOT EXISTS public.entourage_send_operations(wedding_id text REFERENCES public.weddings(id) ON DELETE CASCADE,member_key text NOT NULL,request_id uuid NOT NULL,fingerprint text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(wedding_id,member_key,request_id));
ALTER TABLE public.entourage_send_operations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.entourage_send_operations FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.entourage_send_operations TO service_role;
CREATE OR REPLACE FUNCTION public.quickweds_prepare_entourage(p_wedding text,p_request uuid,p_fingerprint text,p_data jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE invite public.entourage_invitations;
BEGIN
 PERFORM 1 FROM public.weddings WHERE id=p_wedding AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Wedding not found'; END IF;
 SELECT * INTO invite FROM public.entourage_invitations WHERE wedding_id=p_wedding AND member_key=p_data->>'member_key' FOR UPDATE;
 IF FOUND AND invite.send_operation_id=p_request THEN
  IF invite.send_fingerprint<>p_fingerprint THEN RAISE EXCEPTION 'This send request changed. Start a new send.'; END IF;
  RETURN to_jsonb(invite);
 END IF;
 IF EXISTS(SELECT 1 FROM public.entourage_send_operations WHERE wedding_id=p_wedding AND member_key=p_data->>'member_key' AND request_id=p_request) THEN RAISE EXCEPTION 'This invitation operation was superseded. Refresh before sending again.'; END IF;
 INSERT INTO public.entourage_send_operations(wedding_id,member_key,request_id,fingerprint)VALUES(p_wedding,p_data->>'member_key',p_request,p_fingerprint);
 INSERT INTO public.entourage_invitations(wedding_id,member_key,name,email,role,message,template_key,card_theme,proposal_title,proposal_hero_image_url,status,token_hash,sent_at,responded_at,created_by_user_id,updated_at,send_operation_id,send_fingerprint)
 VALUES(p_wedding,p_data->>'member_key',p_data->>'name',p_data->>'email',p_data->>'role',p_data->>'message',p_data->>'template_key',p_data->>'card_theme',p_data->>'proposal_title',p_data->>'proposal_hero_image_url','sent',p_data->>'token_hash',now(),null,(p_data->>'created_by_user_id')::uuid,now(),p_request,p_fingerprint)
 ON CONFLICT(wedding_id,member_key) DO UPDATE SET name=EXCLUDED.name,email=EXCLUDED.email,role=EXCLUDED.role,message=EXCLUDED.message,template_key=EXCLUDED.template_key,card_theme=EXCLUDED.card_theme,proposal_title=EXCLUDED.proposal_title,proposal_hero_image_url=EXCLUDED.proposal_hero_image_url,status='sent',token_hash=EXCLUDED.token_hash,sent_at=EXCLUDED.sent_at,responded_at=null,updated_at=now(),send_operation_id=p_request,send_fingerprint=p_fingerprint RETURNING * INTO invite;
 RETURN to_jsonb(invite);
END; $$;
CREATE OR REPLACE FUNCTION public.quickweds_prepare_collaborator(p_wedding text,p_email text,p_role text,p_user uuid,p_limit integer) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE invite public.wedding_collaborators; total integer;
BEGIN
 PERFORM 1 FROM public.weddings WHERE id=p_wedding AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Wedding not found'; END IF;
 SELECT * INTO invite FROM public.wedding_collaborators WHERE wedding_id=p_wedding AND email=p_email FOR UPDATE;
 IF FOUND AND invite.status='accepted' THEN RETURN to_jsonb(invite); END IF;
 SELECT count(*) INTO total FROM public.wedding_collaborators WHERE wedding_id=p_wedding AND email<>p_email;
 IF p_limit IS NOT NULL AND total>=p_limit THEN RAISE EXCEPTION 'collaborator_limit_reached'; END IF;
 IF invite.id IS NULL THEN
 INSERT INTO public.wedding_collaborators(wedding_id,email,role,status,invited_by_user_id)VALUES(p_wedding,p_email,p_role,'pending',p_user) RETURNING * INTO invite;
 ELSE UPDATE public.wedding_collaborators SET role=p_role,status='pending',invited_by_user_id=p_user WHERE id=invite.id RETURNING * INTO invite;
 END IF;
 RETURN to_jsonb(invite);
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_prepare_entourage(text,uuid,text,jsonb),public.quickweds_prepare_collaborator(text,text,text,uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quickweds_prepare_entourage(text,uuid,text,jsonb),public.quickweds_prepare_collaborator(text,text,text,uuid,integer) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
