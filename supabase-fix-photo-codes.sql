-- Fix for all wedding planner features - create tables if not exists, then fix RLS policies

-- Add missing columns to rsvps table
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS rsvp_status TEXT DEFAULT 'confirmed';
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS manual_entry BOOLEAN DEFAULT false;

-- Ensure the security definder function exists
CREATE OR REPLACE FUNCTION check_is_wedding_owner(w_id TEXT, u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM weddings 
    WHERE id = w_id AND user_id = u_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure rsvps has the correct policies for public submission and owner viewing
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can insert RSVPs (guests submitting responses)
DROP POLICY IF EXISTS "anyone_can_submit_rsvp" ON rsvps;
CREATE POLICY "anyone_can_submit_rsvp" ON rsvps
FOR INSERT
WITH CHECK (true);

-- Owners can view RSVPs for their weddings (directly without function to avoid recursion)
DROP POLICY IF EXISTS "owners_can_view_rsvps" ON rsvps;
CREATE POLICY "owners_can_view_rsvps" ON rsvps
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM weddings 
        WHERE weddings.id = rsvps.wedding_id 
        AND weddings.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM wedding_collaborators 
        WHERE wedding_collaborators.wedding_id = rsvps.wedding_id 
        AND wedding_collaborators.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND wedding_collaborators.status = 'accepted'
    )
);

-- Create wedding_photos table if not exists
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

-- Create photo_sharing_codes table if not exists
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

-- Create thank_you_templates table if not exists
CREATE TABLE IF NOT EXISTS thank_you_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    design_style TEXT DEFAULT 'elegant',
    signature TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create thank_you_notes table if not exists
CREATE TABLE IF NOT EXISTS thank_you_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    rsvp_id UUID REFERENCES rsvps(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    note_type TEXT DEFAULT 'attendance',
    gift_description TEXT,
    gift_amount NUMERIC,
    personalized_message TEXT,
    generated_html TEXT,
    status TEXT DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    template_id UUID REFERENCES thank_you_templates(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seating_tables table if not exists
CREATE TABLE IF NOT EXISTS seating_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    table_shape TEXT DEFAULT 'round',
    capacity INTEGER DEFAULT 8,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    custom_style JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seating_assignments table if not exists
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on wedding_photos
ALTER TABLE wedding_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_view_approved_photos" ON wedding_photos;
CREATE POLICY "anyone_view_approved_photos" ON wedding_photos FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "owners_manage_photos" ON wedding_photos;
CREATE POLICY "owners_manage_photos" ON wedding_photos FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid())) WITH CHECK (check_is_wedding_owner(wedding_id, auth.uid()));
DROP POLICY IF EXISTS "anyone_upload_photos" ON wedding_photos;
CREATE POLICY "anyone_upload_photos" ON wedding_photos FOR INSERT WITH CHECK (true);

-- Enable RLS on photo_sharing_codes
ALTER TABLE photo_sharing_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owners_manage_sharing_codes" ON photo_sharing_codes;
CREATE POLICY "owners_manage_sharing_codes" ON photo_sharing_codes FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid())) WITH CHECK (check_is_wedding_owner(wedding_id, auth.uid()));
DROP POLICY IF EXISTS "anyone_view_active_codes" ON photo_sharing_codes;
CREATE POLICY "anyone_view_active_codes" ON photo_sharing_codes FOR SELECT USING (is_active = true);

-- Enable RLS on thank_you_templates
ALTER TABLE thank_you_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owners_manage_thank_you_templates" ON thank_you_templates;
CREATE POLICY "owners_manage_thank_you_templates" ON thank_you_templates FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid())) WITH CHECK (check_is_wedding_owner(wedding_id, auth.uid()));

-- Enable RLS on thank_you_notes
ALTER TABLE thank_you_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owners_manage_thank_you_notes" ON thank_you_notes;
CREATE POLICY "owners_manage_thank_you_notes" ON thank_you_notes FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid())) WITH CHECK (check_is_wedding_owner(wedding_id, auth.uid()));

-- Enable RLS on seating_tables
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owners_manage_seating_tables" ON seating_tables;
CREATE POLICY "owners_manage_seating_tables" ON seating_tables FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid())) WITH CHECK (check_is_wedding_owner(wedding_id, auth.uid()));

-- Enable RLS on seating_assignments
ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owners_manage_seating_assignments" ON seating_assignments;
CREATE POLICY "owners_manage_seating_assignments" ON seating_assignments FOR ALL USING (check_is_wedding_owner(wedding_id, auth.uid())) WITH CHECK (check_is_wedding_owner(wedding_id, auth.uid()));

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';