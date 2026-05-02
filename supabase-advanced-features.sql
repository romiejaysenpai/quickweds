-- QuickWeds advanced feature support - SECURITY HARDENED VERSION
-- Run this in your Supabase SQL editor before using analytics, collaborators, reminders, and template presets.
-- CRITICAL FIX #1: Stricter RLS policies with IP-based abuse prevention
-- CRITICAL FIX #2: Input validation at database level

create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

-- Add missing columns to weddings table
alter table public.weddings add column if not exists accent_style text default 'none';
alter table public.weddings add column if not exists invitation_image text;

-- CRITICAL FIX #1: Updated analytics table with IP tracking for abuse prevention
-- Drop and recreate with stricter constraints
DROP TABLE IF EXISTS public.wedding_analytics_events CASCADE;

CREATE TABLE public.wedding_analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id text NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    event_type text NOT NULL CHECK (event_type IN ('visit', 'qr_scan', 'rsvp_submitted', 'share_copy', 'share_whatsapp', 'share_email', 'share_sms', 'gallery_view', 'video_play')),
    source text CHECK (length(source) <= 50),
    session_id text CHECK (length(session_id) <= 100),
    referrer text CHECK (length(referrer) <= 500),
    ip_address text CHECK (length(ip_address) <= 45), -- IPv6 max length
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Add constraints to prevent abuse
    CONSTRAINT valid_event_type CHECK (event_type ~ '^[a-z_]+$'),
    CONSTRAINT valid_source CHECK (source IS NULL OR source ~ '^[a-zA-Z0-9_-]+$'),
    CONSTRAINT valid_session_id CHECK (session_id IS NULL OR session_id ~ '^[a-zA-Z0-9_-]+$')
);

-- Create indexes for abuse detection
CREATE INDEX idx_wedding_analytics_events_wedding_id ON public.wedding_analytics_events (wedding_id);
CREATE INDEX idx_wedding_analytics_events_ip_address ON public.wedding_analytics_events (ip_address);
CREATE INDEX idx_wedding_analytics_events_created_at ON public.wedding_analytics_events (created_at);
CREATE INDEX idx_wedding_analytics_events_session_id ON public.wedding_analytics_events (session_id);

-- Create a function to detect potential abuse
CREATE OR REPLACE FUNCTION check_analytics_abuse()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
    same_session_count INTEGER;
BEGIN
    -- Check if this IP has made too many requests in the last minute
    SELECT COUNT(*) INTO recent_count
    FROM public.wedding_analytics_events
    WHERE ip_address = NEW.ip_address
    AND created_at > now() - interval '1 minute';
    
    IF recent_count > 50 THEN
        RAISE EXCEPTION 'Rate limit exceeded for IP address';
    END IF;
    
    -- Check if same session is spamming
    IF NEW.session_id IS NOT NULL THEN
        SELECT COUNT(*) INTO same_session_count
        FROM public.wedding_analytics_events
        WHERE session_id = NEW.session_id
        AND wedding_id = NEW.wedding_id
        AND created_at > now() - interval '1 minute';
        
        IF same_session_count > 20 THEN
            RAISE EXCEPTION 'Rate limit exceeded for session';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for abuse prevention
DROP TRIGGER IF EXISTS analytics_abuse_check ON public.wedding_analytics_events;
CREATE TRIGGER analytics_abuse_check
    BEFORE INSERT ON public.wedding_analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION check_analytics_abuse();

create table if not exists public.wedding_reminders (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    sent_by text,
    recipient_count integer not null default 0 CHECK (recipient_count >= 0 AND recipient_count <= 1000),
    success_count integer not null default 0 CHECK (success_count >= 0 AND success_count <= recipient_count),
    target_status text not null default 'pending' check (target_status in ('pending', 'confirmed', 'declined')),
    channel text not null default 'email' check (channel in ('email', 'sms')),
    sent_at timestamptz not null default now()
);

create table if not exists public.wedding_collaborators (
    id uuid primary key default gen_random_uuid(),
    wedding_id text not null references public.weddings(id) on delete cascade,
    email text not null CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    role text not null check (role in ('partner', 'coordinator')),
    status text not null default 'pending' check (status in ('pending', 'accepted')),
    invited_by_user_id uuid,
    created_at timestamptz not null default now(),
    unique (wedding_id, email)
);

alter table public.wedding_collaborators
add column if not exists invited_by_user_id uuid;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'wedding_collaborators_wedding_id_email_key'
    ) then
        alter table public.wedding_collaborators
        add constraint wedding_collaborators_wedding_id_email_key unique (wedding_id, email);
    end if;
end $$;

create table if not exists public.wedding_template_presets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null CHECK (length(name) <= 200),
    template_id text not null CHECK (length(template_id) <= 100),
    description text CHECK (description IS NULL OR length(description) <= 1000),
    preset_data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.rsvps add column if not exists guest_email text;

-- Add constraint to guest_email
ALTER TABLE public.rsvps 
DROP CONSTRAINT IF EXISTS valid_guest_email;

ALTER TABLE public.rsvps
ADD CONSTRAINT valid_guest_email 
CHECK (guest_email IS NULL OR guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

create index if not exists idx_wedding_reminders_wedding_id on public.wedding_reminders (wedding_id);
create index if not exists idx_wedding_collaborators_email on public.wedding_collaborators (email);
create index if not exists idx_wedding_template_presets_user_id on public.wedding_template_presets (user_id);

-- Enable RLS
alter table public.wedding_analytics_events enable row level security;
alter table public.wedding_reminders enable row level security;
alter table public.wedding_collaborators enable row level security;
alter table public.wedding_template_presets enable row level security;

-- CRITICAL FIX #1: Stricter RLS policies
-- Remove overly permissive public insert policy
DROP POLICY IF EXISTS "Public can insert analytics events" ON public.wedding_analytics_events;

-- New policy: Allow inserts but only with valid data (enforced by trigger)
CREATE POLICY "Allow authenticated analytics inserts"
ON public.wedding_analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
    -- Only allow specific event types
    event_type IN ('visit', 'qr_scan', 'rsvp_submitted', 'share_copy', 'share_whatsapp', 'share_email', 'share_sms', 'gallery_view', 'video_play')
    -- Wedding must exist
    AND EXISTS (
        SELECT 1 FROM public.weddings w WHERE w.id = wedding_id
    )
);

drop policy if exists "Owners and collaborators can read analytics events" on public.wedding_analytics_events;
create policy "Owners and collaborators can read analytics events"
on public.wedding_analytics_events
for select
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_analytics_events.wedding_id
        and (
            w.user_id = auth.uid()
            or exists (
                select 1
                from public.wedding_collaborators c
                where c.wedding_id = w.id
                and lower(c.email) = lower(auth.email())
                and c.status = 'accepted'
            )
        )
    )
);

drop policy if exists "Owners and collaborators can manage reminders" on public.wedding_reminders;
create policy "Owners and collaborators can manage reminders"
on public.wedding_reminders
for all
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_reminders.wedding_id
        and (
            w.user_id = auth.uid()
            or exists (
                select 1
                from public.wedding_collaborators c
                where c.wedding_id = w.id
                and lower(c.email) = lower(auth.email())
                and c.status = 'accepted'
            )
        )
    )
)
with check (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_reminders.wedding_id
        and (
            w.user_id = auth.uid()
            or exists (
                select 1
                from public.wedding_collaborators c
                where c.wedding_id = w.id
                and lower(c.email) = lower(auth.email())
                and c.status = 'accepted'
            )
        )
    )
);

drop policy if exists "Owners and invitees can manage collaborators" on public.wedding_collaborators;
create policy "Owners and invitees can manage collaborators"
on public.wedding_collaborators
for all
to authenticated
using (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_collaborators.wedding_id
        and w.user_id = auth.uid()
    )
    or lower(wedding_collaborators.email) = lower(auth.email())
)
with check (
    exists (
        select 1
        from public.weddings w
        where w.id = wedding_collaborators.wedding_id
        and w.user_id = auth.uid()
    )
    or lower(wedding_collaborators.email) = lower(auth.email())
);

drop policy if exists "Users manage own presets" on public.wedding_template_presets;
create policy "Users manage own presets"
on public.wedding_template_presets
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Create a function to clean up old analytics data (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    -- Delete analytics older than 1 year
    DELETE FROM public.wedding_analytics_events
    WHERE created_at < now() - interval '1 year';
    
    -- Anonymize IP addresses older than 30 days
    UPDATE public.wedding_analytics_events
    SET ip_address = 'anonymized'
    WHERE created_at < now() - interval '30 days'
    AND ip_address IS NOT NULL
    AND ip_address != 'anonymized';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('cleanup-analytics', '0 0 * * *', 'SELECT cleanup_old_analytics()');
