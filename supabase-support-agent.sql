-- ============================================================
-- QuickWeds Safe Support Investigation Agent
-- Run this in the Supabase SQL Editor before enabling the admin
-- support console in production.
--
-- Safety posture:
-- - Tables are service-role only through RLS.
-- - The app writes/reads them only through admin server routes.
-- - The agent stores reports and change requests only.
-- - The agent does not deploy, delete, alter payment status,
--   change roles, disable RLS, or execute SQL repairs directly.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    user_email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general'
        CHECK (category IN ('general', 'custom-plan', 'bug', 'feature', 'review', 'payment', 'email', 'rsvp', 'account', 'performance', 'security', 'unknown')),
    affected_feature TEXT,
    error_code TEXT,
    browser TEXT,
    device TEXT,
    page_url TEXT,
    screenshot_url TEXT,
    safe_metadata JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'triaged', 'investigating', 'needs_human_review', 'waiting_on_user', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_tickets_service_only" ON support_tickets;
CREATE POLICY "support_tickets_service_only"
    ON support_tickets
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets (category);

ALTER TABLE support_tickets
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS resolution_note TEXT,
    ADD COLUMN IF NOT EXISTS resolution_email_sent_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS support_investigations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    agent TEXT NOT NULL DEFAULT 'support_investigation_agent',
    summary TEXT NOT NULL,
    issue_type TEXT NOT NULL
        CHECK (issue_type IN ('Bug', 'User Error', 'Payment', 'Email', 'RSVP', 'Account', 'Performance', 'Security', 'Unknown')),
    risk_level TEXT NOT NULL
        CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    safe_context_reviewed JSONB NOT NULL DEFAULT '[]',
    likely_cause TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '[]',
    suggested_fix TEXT NOT NULL,
    action_needed TEXT NOT NULL
        CHECK (action_needed IN ('Human review only', 'Open PR', 'Create SQL change request', 'Resend email with approval', 'Ask user for more information', 'Escalate to developer', 'Security review required')),
    report JSONB NOT NULL DEFAULT '{}',
    report_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'human_review_required'
        CHECK (status IN ('human_review_required', 'approved', 'rejected', 'superseded', 'closed')),
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE support_investigations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_investigations_service_only" ON support_investigations;
CREATE POLICY "support_investigations_service_only"
    ON support_investigations
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_support_investigations_ticket_id ON support_investigations (ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_investigations_risk ON support_investigations (risk_level);
CREATE INDEX IF NOT EXISTS idx_support_investigations_created_at ON support_investigations (created_at DESC);

CREATE TABLE IF NOT EXISTS support_agent_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES support_investigations(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending_human_review'
        CHECK (status IN ('pending_human_review', 'approved', 'rejected', 'executed', 'cancelled')),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE support_agent_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_agent_actions_service_only" ON support_agent_actions;
CREATE POLICY "support_agent_actions_service_only"
    ON support_agent_actions
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_support_agent_actions_ticket_id ON support_agent_actions (ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_agent_actions_status ON support_agent_actions (status);
CREATE INDEX IF NOT EXISTS idx_support_agent_actions_created_at ON support_agent_actions (created_at DESC);

CREATE TABLE IF NOT EXISTS support_agent_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
    investigation_id UUID REFERENCES support_investigations(id) ON DELETE SET NULL,
    actor TEXT NOT NULL,
    event_type TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE support_agent_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_agent_audit_logs_service_only" ON support_agent_audit_logs;
CREATE POLICY "support_agent_audit_logs_service_only"
    ON support_agent_audit_logs
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_support_agent_audit_logs_ticket_id ON support_agent_audit_logs (ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_agent_audit_logs_created_at ON support_agent_audit_logs (created_at DESC);
