-- Migration: supabase-app-reviews.sql
-- Description: Adds app_reviews table for storing user reviews, couple stories, ratings, and feedback.
-- Supports automatic display on the landing page, moderation statuses, and verified couple badges.

CREATE TABLE IF NOT EXISTS public.app_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    wedding_id TEXT REFERENCES public.weddings(id) ON DELETE SET NULL,
    couple_names TEXT NOT NULL,
    wedding_role TEXT DEFAULT 'Couple',
    detail TEXT,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    quote TEXT NOT NULL,
    story TEXT,
    verified_couple BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_reviews_status_created 
    ON public.app_reviews(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_reviews_featured 
    ON public.app_reviews(is_featured, created_at DESC) 
    WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_app_reviews_user_id 
    ON public.app_reviews(user_id);

-- Enable RLS
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read approved reviews
DROP POLICY IF EXISTS "Public can view approved app_reviews" ON public.app_reviews;
CREATE POLICY "Public can view approved app_reviews" 
    ON public.app_reviews 
    FOR SELECT 
    USING (status = 'approved');

-- Policy 2: Anyone can insert a review
DROP POLICY IF EXISTS "Anyone can submit an app_review" ON public.app_reviews;
CREATE POLICY "Anyone can submit an app_review" 
    ON public.app_reviews 
    FOR INSERT 
    WITH CHECK (true);

-- Policy 3: Users can update or delete their own review
DROP POLICY IF EXISTS "Users can update their own app_reviews" ON public.app_reviews;
CREATE POLICY "Users can update their own app_reviews" 
    ON public.app_reviews 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Service role / Admins have full access
DROP POLICY IF EXISTS "Service role has full access to app_reviews" ON public.app_reviews;
CREATE POLICY "Service role has full access to app_reviews" 
    ON public.app_reviews 
    FOR ALL 
    USING (
        coalesce(
            current_setting('request.jwt.claim.role', true) = 'service_role'
            OR current_setting('role', true) IN ('service_role', 'postgres', 'supabase_admin')
            OR session_user IN ('postgres', 'supabase_admin')
            OR current_user IN ('postgres', 'supabase_admin')
            OR auth.role() = 'service_role',
            false
        )
    );

-- Seed initial beloved testimonials
INSERT INTO public.app_reviews (couple_names, detail, rating, quote, verified_couple, status, is_featured, created_at)
SELECT 'Mia & Carlo', 'Planned a 120-guest wedding', 5, 'QuickWeds made our RSVPs feel effortless. We finally had one place for guest answers, questions, budget notes, and the planning checklist.', true, 'approved', true, now() - interval '14 days'
WHERE NOT EXISTS (SELECT 1 FROM public.app_reviews WHERE couple_names = 'Mia & Carlo');

INSERT INTO public.app_reviews (couple_names, detail, rating, quote, verified_couple, status, is_featured, created_at)
SELECT 'Sofia & Daniel', 'Shared planning with family', 5, 'The dashboard helped us stop jumping between chats and spreadsheets. Our guests had the website, and we had the calm planning view.', true, 'approved', true, now() - interval '10 days'
WHERE NOT EXISTS (SELECT 1 FROM public.app_reviews WHERE couple_names = 'Sofia & Daniel');

INSERT INTO public.app_reviews (couple_names, detail, rating, quote, verified_couple, status, is_featured, created_at)
SELECT 'Ari & James', 'Built their site in one evening', 5, 'We wanted something elegant without hiring a designer. QuickWeds gave us a beautiful site and the tools to manage everything behind it.', true, 'approved', true, now() - interval '6 days'
WHERE NOT EXISTS (SELECT 1 FROM public.app_reviews WHERE couple_names = 'Ari & James');
