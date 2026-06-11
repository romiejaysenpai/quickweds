-- ============================================================
-- QuickWeds AgentOps Tables
-- Run this in the Supabase SQL Editor to create the tables
-- needed by the n8n Lifecycle Marketing Agent workflow.
-- ============================================================

-- 1. Audit log for every agent action
CREATE TABLE IF NOT EXISTS agentops_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent TEXT NOT NULL DEFAULT 'lifecycle_marketing_agent',
    action TEXT NOT NULL,
    task_id TEXT,
    task_data JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    execution_id TEXT,
    workflow TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE agentops_runs ENABLE ROW LEVEL SECURITY;

-- Service-role only — no public access
CREATE POLICY "agentops_runs_service_only"
    ON agentops_runs
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_agentops_runs_agent ON agentops_runs (agent);
CREATE INDEX IF NOT EXISTS idx_agentops_runs_created_at ON agentops_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agentops_runs_task_id ON agentops_runs (task_id);

-- 2. Approval / suppression queue
CREATE TABLE IF NOT EXISTS agentops_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent TEXT NOT NULL DEFAULT 'lifecycle_marketing_agent',
    task_data JSONB NOT NULL DEFAULT '{}',
    reason TEXT NOT NULL DEFAULT 'approval_required',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE agentops_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agentops_approvals_service_only"
    ON agentops_approvals
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_agentops_approvals_status ON agentops_approvals (status);
CREATE INDEX IF NOT EXISTS idx_agentops_approvals_created_at ON agentops_approvals (created_at DESC);

-- 3. Daily summary records
CREATE TABLE IF NOT EXISTS agentops_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent TEXT NOT NULL DEFAULT 'lifecycle_marketing_agent',
    workflow TEXT,
    execution_id TEXT,
    ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    note TEXT,
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE agentops_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agentops_summaries_service_only"
    ON agentops_summaries
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_agentops_summaries_agent ON agentops_summaries (agent);
CREATE INDEX IF NOT EXISTS idx_agentops_summaries_ran_at ON agentops_summaries (ran_at DESC);
