-- Disposable Camera Mode for the existing QuickWeds Photo Sharing Portal.
-- Run after the existing photo sharing schema setup.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS photo_portal_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wedding_id TEXT NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
    disposable_camera_enabled BOOLEAN NOT NULL DEFAULT false,
    reveal_datetime TIMESTAMP WITH TIME ZONE,
    guest_name_required BOOLEAN NOT NULL DEFAULT false,
    allow_anonymous_uploads BOOLEAN NOT NULL DEFAULT true,
    require_approval BOOLEAN NOT NULL DEFAULT true,
    photo_limit_per_guest INTEGER NOT NULL DEFAULT 3 CHECK (photo_limit_per_guest >= 1 AND photo_limit_per_guest <= 50),
    film_frame_enabled BOOLEAN NOT NULL DEFAULT false,
    nostalgic_ui_enabled BOOLEAN NOT NULL DEFAULT false,
    date_stamp_enabled BOOLEAN NOT NULL DEFAULT false,
    enabled_filter_ids TEXT[] NOT NULL DEFAULT ARRAY['none', 'soft-film', 'warm-vintage', 'black-white', 'romantic-glow', 'polaroid-fade', 'golden-hour', 'classic-disposable'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wedding_photos ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE wedding_photos ADD COLUMN IF NOT EXISTS upload_source TEXT NOT NULL DEFAULT 'guest_upload';
ALTER TABLE wedding_photos ADD COLUMN IF NOT EXISTS guest_identifier TEXT;
ALTER TABLE wedding_photos ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE wedding_photos ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE wedding_photos ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE photo_portal_settings ADD COLUMN IF NOT EXISTS date_stamp_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE photo_portal_settings ADD COLUMN IF NOT EXISTS enabled_filter_ids TEXT[] NOT NULL DEFAULT ARRAY['none', 'soft-film', 'warm-vintage', 'black-white', 'romantic-glow', 'polaroid-fade', 'golden-hour', 'classic-disposable'];

UPDATE wedding_photos
SET status = CASE
    WHEN is_approved THEN 'approved'
    WHEN status IN ('pending', 'approved', 'rejected') THEN status
    ELSE 'pending'
END
WHERE status IS NULL OR status NOT IN ('pending', 'approved', 'rejected') OR is_approved = true;

UPDATE wedding_photos
SET upload_source = 'guest_upload'
WHERE upload_source IS NULL OR upload_source NOT IN ('guest_upload', 'couple_upload');

UPDATE wedding_photos
SET message = caption
WHERE message IS NULL AND caption IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'wedding_photos_status_check'
        AND conrelid = 'wedding_photos'::regclass
    ) THEN
        ALTER TABLE wedding_photos
        ADD CONSTRAINT wedding_photos_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'wedding_photos_upload_source_check'
        AND conrelid = 'wedding_photos'::regclass
    ) THEN
        ALTER TABLE wedding_photos
        ADD CONSTRAINT wedding_photos_upload_source_check CHECK (upload_source IN ('guest_upload', 'couple_upload'));
    END IF;
END $$;

CREATE OR REPLACE FUNCTION set_photo_portal_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS photo_portal_settings_updated_at ON photo_portal_settings;
CREATE TRIGGER photo_portal_settings_updated_at
BEFORE UPDATE ON photo_portal_settings
FOR EACH ROW
EXECUTE FUNCTION set_photo_portal_settings_updated_at();

CREATE INDEX IF NOT EXISTS idx_photo_portal_settings_wedding_id ON photo_portal_settings(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_photos_wedding_status_created ON wedding_photos(wedding_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wedding_photos_guest_identifier ON wedding_photos(wedding_id, guest_identifier);

ALTER TABLE photo_portal_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners_manage_photo_portal_settings" ON photo_portal_settings;
CREATE POLICY "owners_manage_photo_portal_settings" ON photo_portal_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM weddings
        WHERE weddings.id = photo_portal_settings.wedding_id
        AND weddings.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM wedding_collaborators
        WHERE wedding_collaborators.wedding_id = photo_portal_settings.wedding_id
        AND wedding_collaborators.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND wedding_collaborators.status = 'accepted'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM weddings
        WHERE weddings.id = photo_portal_settings.wedding_id
        AND weddings.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM wedding_collaborators
        WHERE wedding_collaborators.wedding_id = photo_portal_settings.wedding_id
        AND wedding_collaborators.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND wedding_collaborators.status = 'accepted'
    )
);

DROP POLICY IF EXISTS "anyone_view_approved_photos" ON wedding_photos;
CREATE POLICY "anyone_view_approved_photos" ON wedding_photos
FOR SELECT
USING (
    is_approved = true
    AND COALESCE(status, 'approved') = 'approved'
    AND NOT EXISTS (
        SELECT 1 FROM photo_portal_settings
        WHERE photo_portal_settings.wedding_id = wedding_photos.wedding_id
        AND photo_portal_settings.disposable_camera_enabled = true
        AND photo_portal_settings.reveal_datetime IS NOT NULL
        AND photo_portal_settings.reveal_datetime > NOW()
    )
);

NOTIFY pgrst, 'reload schema';
