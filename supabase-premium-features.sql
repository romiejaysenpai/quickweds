-- Premium wedding-day feature bundle.
-- Run this in Supabase SQL editor or include it in your migration flow.

CREATE TABLE IF NOT EXISTS public.wedding_day_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wedding_id TEXT NOT NULL UNIQUE REFERENCES public.weddings(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    check_in_enabled BOOLEAN NOT NULL DEFAULT true,
    seat_finder_enabled BOOLEAN NOT NULL DEFAULT true,
    photo_upload_enabled BOOLEAN NOT NULL DEFAULT true,
    timeline_enabled BOOLEAN NOT NULL DEFAULT true,
    guestbook_enabled BOOLEAN NOT NULL DEFAULT true,
    emergency_contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
    coordinator_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wedding_id TEXT NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    automation_type TEXT NOT NULL,
    target_email TEXT,
    target_rsvp_id UUID REFERENCES public.rsvps(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS automation_logs_unique_target
ON public.automation_logs (wedding_id, automation_type, lower(coalesce(target_email, '')));

CREATE INDEX IF NOT EXISTS automation_logs_wedding_type_created_idx
ON public.automation_logs (wedding_id, automation_type, created_at DESC);

ALTER TABLE public.wedding_day_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners_manage_wedding_day_settings" ON public.wedding_day_settings;
CREATE POLICY "owners_manage_wedding_day_settings"
ON public.wedding_day_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.weddings
        WHERE weddings.id = wedding_day_settings.wedding_id
          AND weddings.user_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1
        FROM public.wedding_collaborators
        WHERE wedding_collaborators.wedding_id = wedding_day_settings.wedding_id
          AND lower(wedding_collaborators.email) = lower((SELECT auth.jwt() ->> 'email'))
          AND wedding_collaborators.status = 'accepted'
          AND wedding_collaborators.role IN ('partner', 'coordinator')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.weddings
        WHERE weddings.id = wedding_day_settings.wedding_id
          AND weddings.user_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1
        FROM public.wedding_collaborators
        WHERE wedding_collaborators.wedding_id = wedding_day_settings.wedding_id
          AND lower(wedding_collaborators.email) = lower((SELECT auth.jwt() ->> 'email'))
          AND wedding_collaborators.status = 'accepted'
          AND wedding_collaborators.role IN ('partner', 'coordinator')
    )
);

DROP POLICY IF EXISTS "owners_manage_automation_logs" ON public.automation_logs;
CREATE POLICY "owners_manage_automation_logs"
ON public.automation_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.weddings
        WHERE weddings.id = automation_logs.wedding_id
          AND weddings.user_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1
        FROM public.wedding_collaborators
        WHERE wedding_collaborators.wedding_id = automation_logs.wedding_id
          AND lower(wedding_collaborators.email) = lower((SELECT auth.jwt() ->> 'email'))
          AND wedding_collaborators.status = 'accepted'
          AND wedding_collaborators.role IN ('partner', 'coordinator')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.weddings
        WHERE weddings.id = automation_logs.wedding_id
          AND weddings.user_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1
        FROM public.wedding_collaborators
        WHERE wedding_collaborators.wedding_id = automation_logs.wedding_id
          AND lower(wedding_collaborators.email) = lower((SELECT auth.jwt() ->> 'email'))
          AND wedding_collaborators.status = 'accepted'
          AND wedding_collaborators.role IN ('partner', 'coordinator')
    )
);
