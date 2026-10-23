BEGIN;
CREATE TABLE IF NOT EXISTS public.email_delivery_usage (
 wedding_id text PRIMARY KEY REFERENCES public.weddings(id) ON DELETE CASCADE,
 baseline integer NOT NULL CHECK(baseline>=0), reserved integer NOT NULL DEFAULT 0 CHECK(reserved>=0), consumed integer NOT NULL DEFAULT 0 CHECK(consumed>=0)
);
CREATE TABLE IF NOT EXISTS public.email_delivery_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), semantic_key text UNIQUE NOT NULL,
 wedding_id text REFERENCES public.weddings(id) ON DELETE CASCADE,
 payload jsonb NOT NULL, delivery_guard jsonb, recoverable boolean NOT NULL DEFAULT false, quota_limit integer, state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','processing','accepted','retryable','failed','unknown')),
 claim_token uuid, lease_until timestamptz, first_dispatch_at timestamptz,
 quota_reserved boolean NOT NULL DEFAULT false, provider_id text, last_error text,
 attempts integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_delivery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_delivery_jobs,public.email_delivery_usage FROM anon,authenticated;
GRANT ALL ON public.email_delivery_jobs,public.email_delivery_usage TO service_role;
CREATE INDEX IF NOT EXISTS email_delivery_jobs_wedding_state ON public.email_delivery_jobs(wedding_id,state,created_at);
CREATE OR REPLACE FUNCTION public.quickweds_claim_email(p_key text,p_payload jsonb,p_wedding text,p_limit integer,p_baseline integer,p_guard jsonb DEFAULT NULL,p_recoverable boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE job public.email_delivery_jobs; usage public.email_delivery_usage;
BEGIN
 INSERT INTO public.email_delivery_jobs(semantic_key,payload,wedding_id,delivery_guard,recoverable,quota_limit)VALUES(p_key,p_payload,p_wedding,p_guard,p_recoverable,p_limit)ON CONFLICT(semantic_key)DO NOTHING;
 SELECT * INTO job FROM public.email_delivery_jobs WHERE semantic_key=p_key FOR UPDATE;
 IF job.payload->'to' IS DISTINCT FROM p_payload->'to' THEN RETURN jsonb_build_object('state','recipient_changed'); END IF;
 IF job.state IN ('accepted','failed','unknown') THEN RETURN to_jsonb(job); END IF;
 IF job.state='processing' AND job.lease_until>clock_timestamp() THEN RETURN jsonb_build_object('state','busy'); END IF;
 -- A provider only retains its idempotency key for 24h. Ambiguous old sends
 -- require reconciliation; never turn an old lease into a fresh delivery.
 IF job.attempts>=5 OR job.first_dispatch_at<clock_timestamp()-interval '23 hours' THEN
   UPDATE public.email_delivery_jobs SET state='unknown',updated_at=now() WHERE id=job.id;
   RETURN jsonb_build_object('state','unknown');
 END IF;
 IF p_limit IS NOT NULL AND p_wedding IS NOT NULL AND NOT job.quota_reserved THEN
   INSERT INTO public.email_delivery_usage(wedding_id,baseline)VALUES(p_wedding,greatest(0,p_baseline))ON CONFLICT(wedding_id)DO NOTHING;
   SELECT * INTO usage FROM public.email_delivery_usage WHERE wedding_id=p_wedding FOR UPDATE;
   IF usage.baseline+usage.reserved+usage.consumed>=p_limit THEN RETURN jsonb_build_object('state','limited'); END IF;
   UPDATE public.email_delivery_usage SET reserved=reserved+1 WHERE wedding_id=p_wedding;
   UPDATE public.email_delivery_jobs SET quota_reserved=true WHERE id=job.id;
 END IF;
 UPDATE public.email_delivery_jobs SET state='processing',claim_token=gen_random_uuid(),lease_until=clock_timestamp()+interval '60 seconds',first_dispatch_at=coalesce(first_dispatch_at,clock_timestamp()),attempts=attempts+1,updated_at=now() WHERE id=job.id RETURNING * INTO job;
 RETURN to_jsonb(job);
END; $$;
CREATE OR REPLACE FUNCTION public.quickweds_finish_email(p_id uuid,p_claim uuid,p_state text,p_provider text,p_error text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE job public.email_delivery_jobs;
BEGIN
 IF p_state NOT IN ('accepted','retryable','failed') THEN RAISE EXCEPTION 'Invalid delivery state'; END IF;
 SELECT * INTO job FROM public.email_delivery_jobs WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR job.state<>'processing' OR job.claim_token IS DISTINCT FROM p_claim THEN RETURN false; END IF;
 IF job.quota_reserved AND p_state IN ('accepted','failed') THEN
   UPDATE public.email_delivery_usage SET reserved=reserved-1,consumed=consumed+CASE WHEN p_state='accepted' THEN 1 ELSE 0 END WHERE wedding_id=job.wedding_id;
 END IF;
 UPDATE public.email_delivery_jobs SET state=p_state,provider_id=p_provider,last_error=left(p_error,500),lease_until=NULL,quota_reserved=CASE WHEN p_state='retryable' THEN quota_reserved ELSE false END,updated_at=now() WHERE id=job.id;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_claim_email(text,jsonb,text,integer,integer,jsonb,boolean),public.quickweds_finish_email(uuid,uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quickweds_claim_email(text,jsonb,text,integer,integer,jsonb,boolean),public.quickweds_finish_email(uuid,uuid,text,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.quickweds_enqueue_email_batch(p_rows jsonb) RETURNS SETOF public.email_delivery_jobs LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF jsonb_typeof(p_rows)<>'array' OR jsonb_array_length(p_rows)>1000 THEN RAISE EXCEPTION 'Invalid email batch'; END IF;
 INSERT INTO public.email_delivery_jobs(semantic_key,payload,wedding_id,delivery_guard,recoverable,quota_limit)
 SELECT item->>'key',item->'payload',item->>'wedding_id',item->'guard',true,(item->>'quota_limit')::integer FROM jsonb_array_elements(p_rows)item ON CONFLICT(semantic_key)DO NOTHING;
 RETURN QUERY SELECT j.* FROM public.email_delivery_jobs j WHERE j.semantic_key IN(SELECT item->>'key' FROM jsonb_array_elements(p_rows)item);
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_enqueue_email_batch(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quickweds_enqueue_email_batch(jsonb) TO service_role;
CREATE OR REPLACE FUNCTION public.quickweds_reconcile_email(p_id uuid,p_wedding text,p_provider text) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE job public.email_delivery_jobs;
BEGIN
 SELECT * INTO job FROM public.email_delivery_jobs WHERE id=p_id AND wedding_id=p_wedding AND recoverable FOR UPDATE;
 IF NOT FOUND OR nullif(p_provider,'') IS NULL THEN RETURN false; END IF;
 IF job.state='accepted' THEN RETURN job.provider_id=p_provider; END IF;
 IF job.state='processing' AND job.lease_until>clock_timestamp() THEN RETURN false; END IF;
 IF job.quota_reserved THEN UPDATE public.email_delivery_usage SET reserved=reserved-1,consumed=consumed+1 WHERE wedding_id=job.wedding_id; END IF;
 UPDATE public.email_delivery_jobs SET state='accepted',provider_id=p_provider,quota_reserved=false,lease_until=NULL,last_error=NULL,updated_at=now() WHERE id=job.id;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.quickweds_reconcile_email(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quickweds_reconcile_email(uuid,text,text) TO service_role;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS delivery_key text;
CREATE UNIQUE INDEX IF NOT EXISTS user_notifications_delivery_key ON public.user_notifications(delivery_key);
NOTIFY pgrst,'reload schema';
COMMIT;
