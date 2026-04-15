-- QUICKWEDS: NEW POWER FEATURES MIGRATION
-- Seating Chart, Photo Sharing Portal, Automated Thank-You Notes
-- Run in Supabase SQL Editor

-- ============================================================================
-- 1. SEATING CHART TABLES
-- ============================================================================

-- Tables for seating arrangements
CREATE TABLE IF NOT EXISTS seating_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    table_shape TEXT DEFAULT 'round', -- 'round', 'rectangular', 'square'
    capacity INTEGER DEFAULT 8,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    custom_style JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guests assigned to tables
CREATE TABLE IF NOT EXISTS seating_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    table_id UUID REFERENCES seating_tables(id) ON DELETE CASCADE,
    rsvp_id UUID REFERENCES rsvps(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    seat_number INTEGER,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rsvp_id) -- One RSVP per seat
);

-- ============================================================================
-- 2. PHOTO SHARING PORTAL TABLES
-- ============================================================================

-- Shared photo gallery for guests to upload
CREATE TABLE IF NOT EXISTS wedding_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    uploader_name TEXT,
    uploader_email TEXT,
    cloudinary_url TEXT NOT NULL,
    cloudinary_public_id TEXT NOT NULL,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    caption TEXT,
    is_approved BOOLEAN DEFAULT false,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo sharing access codes (for guests without accounts)
CREATE TABLE IF NOT EXISTS photo_sharing_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uploads INTEGER DEFAULT 100,
    current_uploads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. AUTOMATED THANK-YOU NOTES TABLES
-- ============================================================================

-- Thank-you note templates
CREATE TABLE IF NOT EXISTS thank_you_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject_template TEXT NOT NULL, -- "Thank you for celebrating with us!"
    body_template TEXT NOT NULL, -- HTML template with placeholders
    design_style TEXT DEFAULT 'elegant', -- 'elegant', 'modern', 'rustic', 'minimal'
    signature TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated thank-you notes
CREATE TABLE IF NOT EXISTS thank_you_notes (
    id UUID DEFAULT uuid GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    rsvp_id UUID REFERENCES rsvps(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    note_type TEXT DEFAULT 'attendance', -- 'attendance', 'gift', 'help'
    gift_description TEXT,
    gift_amount NUMERIC,
    personalized_message TEXT,
    generated_html TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    template_id UUID REFERENCES thank_you_templates(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thank-you note send queue (for batch processing)
CREATE TABLE IF NOT EXISTS thank_you_send_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    note_id UUID REFERENCES thank_you_notes(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_sharing_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE thank_you_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE thank_you_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE thank_you_send_queue ENABLE ROW LEVEL SECURITY;

-- Seating Tables Policies
CREATE POLICY "owners_manage_seating_tables" ON seating_tables
FOR ALL
USING (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
);

-- Seating Assignments Policies
CREATE POLICY "owners_manage_seating_assignments" ON seating_assignments
FOR ALL
USING (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
);

-- Wedding Photos - Anyone can view approved photos, owners can manage
CREATE POLICY "anyone_view_approved_photos" ON wedding_photos
FOR SELECT
USING (is_approved = true);

CREATE POLICY "owners_manage_photos" ON wedding_photos
FOR ALL
USING (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
);

-- Anyone can upload photos (public upload with approval queue)
CREATE POLICY "anyone_upload_photos" ON wedding_photos
FOR INSERT
WITH CHECK (true);

-- Photo Sharing Codes - Owners can manage
CREATE POLICY "owners_manage_sharing_codes" ON photo_sharing_codes
FOR ALL
USING (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
);

-- Anyone can view active codes (for upload form validation)
CREATE POLICY "anyone_view_active_codes" ON photo_sharing_codes
FOR SELECT
USING (is_active = true);

-- Thank-You Templates - Owners can manage
CREATE POLICY "owners_manage_thank_you_templates" ON thank_you_templates
FOR ALL
USING (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
);

-- Thank-You Notes - Owners can manage
CREATE POLICY "owners_manage_thank_you_notes" ON thank_you_notes
FOR ALL
USING (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
);

-- Thank-You Send Queue - Owners can manage
CREATE POLICY "owners_manage_thank_you_queue" ON thank_you_send_queue
FOR ALL
USING (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    wedding_id IN (
        SELECT id FROM weddings WHERE user_id = auth.uid()
    )
);

-- System can process queue (cron job)
CREATE POLICY "system_process_queue" ON thank_you_send_queue
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_seating_tables_wedding ON seating_tables(wedding_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_wedding ON seating_assignments(wedding_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_table ON seating_assignments(table_id);
CREATE INDEX IF NOT EXISTS idx_wedding_photos_wedding ON wedding_photos(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_photos_approved ON wedding_photos(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_codes_wedding ON photo_sharing_codes(wedding_id);
CREATE INDEX IF NOT EXISTS idx_photo_codes_code ON photo_sharing_codes(code);
CREATE INDEX IF NOT EXISTS idx_thank_you_templates_wedding ON thank_you_templates(wedding_id);
CREATE INDEX IF NOT EXISTS idx_thank_you_notes_wedding ON thank_you_notes(wedding_id, status);
CREATE INDEX IF NOT EXISTS idx_thank_you_queue_status ON thank_you_send_queue(status, scheduled_for);

-- ============================================================================
-- FORCE SCHEMA CACHE REFRESH
-- ============================================================================
NOTIFY pgrst, 'reload schema';
