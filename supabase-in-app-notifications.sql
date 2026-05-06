-- In-app Notifications Table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wedding_id TEXT REFERENCES weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'rsvp', 'system', 'team', 'info'
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "users_can_view_own_notifications" ON user_notifications;
CREATE POLICY "users_can_view_own_notifications" ON user_notifications
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_update_own_notifications" ON user_notifications;
CREATE POLICY "users_can_update_own_notifications" ON user_notifications
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_delete_own_notifications" ON user_notifications;
CREATE POLICY "users_can_delete_own_notifications" ON user_notifications
FOR DELETE USING (auth.uid() = user_id);

-- Anyone can insert (system processes) - strictly speaking, we might want to restrict this
-- but for ease of use from server actions/API routes:
DROP POLICY IF EXISTS "system_can_insert_notifications" ON user_notifications;
CREATE POLICY "system_can_insert_notifications" ON user_notifications
FOR INSERT WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON user_notifications(is_read);

NOTIFY pgrst, 'reload schema';
