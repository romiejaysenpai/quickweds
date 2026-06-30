import 'server-only';

import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const SUPPORT_AGENT_NAME = 'support_investigation_agent';

export const SUPPORT_AGENT_OPERATING_PLAN = `
You are a safe AI Support Investigation Agent for QuickWeds.

Your job is to help investigate user support issues, create clear reports, and suggest safe fixes. You must never make risky changes without human approval.

Main workflow:
1. Read the support ticket.
2. Classify the issue type.
3. Gather only safe and limited context.
4. Investigate the likely cause.
5. Create an investigation report.
6. Suggest a fix.
7. Wait for human approval.
8. If code change is needed, open a pull request only.
9. If database change is needed, create a SQL change request only.
10. Never deploy. Human must deploy.

Strict safety rules:
- Do not access or expose API keys, secrets, tokens, service role keys, payment secrets, or environment variables.
- Do not request full database dumps.
- Do not view private user data unless it is directly needed for the issue.
- Do not modify production data directly.
- Do not delete data.
- Do not change payment status.
- Do not change user roles, permissions, or subscription plans.
- Do not disable Supabase RLS.
- Do not change authentication settings.
- Do not deploy to production.
- Do not commit directly to the main branch.
- Do not send emails to users unless a human approves.
- Do not make destructive actions.

Final rule: when unsure, stop and ask for human review. It is better to be safe than fast.
`.trim();

export type SupportIssueType =
    | 'Bug'
    | 'User Error'
    | 'Payment'
    | 'Email'
    | 'RSVP'
    | 'Account'
    | 'Performance'
    | 'Security'
    | 'Unknown';

export type SupportRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type SupportActionNeeded =
    | 'Human review only'
    | 'Open PR'
    | 'Create SQL change request'
    | 'Resend email with approval'
    | 'Ask user for more information'
    | 'Escalate to developer'
    | 'Security review required';

export type SupportTicketRecord = {
    id: string;
    user_id?: string | null;
    user_email?: string | null;
    subject?: string | null;
    message?: string | null;
    category?: string | null;
    affected_feature?: string | null;
    error_code?: string | null;
    browser?: string | null;
    device?: string | null;
    page_url?: string | null;
    screenshot_url?: string | null;
    status?: string | null;
    priority?: string | null;
    safe_metadata?: Record<string, unknown> | null;
    created_at?: string | null;
};

export type SupportInvestigationReport = {
    title: string;
    ticket: string;
    issueType: SupportIssueType;
    riskLevel: SupportRiskLevel;
    safeContextReviewed: string[];
    likelyCause: string;
    evidence: string[];
    suggestedFix: string;
    actionNeeded: SupportActionNeeded;
    prDraft?: {
        title: string;
        summary: string;
        changes: string[];
        risk: Exclude<SupportRiskLevel, 'Critical'>;
        testing: string[];
        humanReviewRequired: true;
    };
    sqlChangeRequest?: {
        purpose: string;
        proposedSql: string;
        riskLevel: SupportRiskLevel;
        affectedTables: string[];
        rollbackPlan: string;
        humanApprovalRequired: true;
    };
};

const ISSUE_TYPES: SupportIssueType[] = [
    'Bug',
    'User Error',
    'Payment',
    'Email',
    'RSVP',
    'Account',
    'Performance',
    'Security',
    'Unknown',
];

function normalizeText(value: unknown) {
    return String(value || '').trim();
}

function truncate(value: string, maxLength: number) {
    return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function getTicketText(ticket: SupportTicketRecord) {
    return [
        ticket.subject,
        ticket.message,
        ticket.category,
        ticket.affected_feature,
        ticket.error_code,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

export function classifySupportTicket(ticket: SupportTicketRecord): SupportIssueType {
    const text = getTicketText(ticket);
    const category = String(ticket.category || '').toLowerCase();

    if (/(security|hacked|breach|privacy|exposed|leak|permission|rls|unauthorized|2fa|token|secret)/i.test(text)) {
        return 'Security';
    }
    if (/(payment|billing|stripe|checkout|charge|refund|subscription|invoice|plan|pro)/i.test(text)) {
        return 'Payment';
    }
    if (/(email|resend|notification|invite|reminder|deliver|spam|inbox)/i.test(text)) {
        return 'Email';
    }
    if (/(rsvp|guest response|attending|decline|guest list)/i.test(text)) {
        return 'RSVP';
    }
    if (/(login|signup|sign up|account|profile|password|auth|session|dashboard access)/i.test(text)) {
        return 'Account';
    }
    if (/(slow|timeout|lag|loading|performance|freeze|stuck)/i.test(text)) {
        return 'Performance';
    }
    if (category === 'bug' || /(bug|error|crash|broken|exception|failed|not working|500|404)/i.test(text)) {
        return 'Bug';
    }
    if (/(how do i|where is|cannot find|confused|help me|question)/i.test(text)) {
        return 'User Error';
    }

    return ISSUE_TYPES.includes(category as SupportIssueType) ? category as SupportIssueType : 'Unknown';
}

export function determineRiskLevel(ticket: SupportTicketRecord, issueType: SupportIssueType): SupportRiskLevel {
    const text = getTicketText(ticket);

    if (issueType === 'Security' || /(breach|leak|hacked|secret|token|service role|password)/i.test(text)) {
        return 'Critical';
    }
    if (issueType === 'Payment' || /(data loss|delete|lost guests|wrong user|private|permission)/i.test(text)) {
        return 'High';
    }
    if (issueType === 'Account' || issueType === 'Email' || issueType === 'RSVP' || issueType === 'Performance') {
        return 'Medium';
    }
    return 'Low';
}

function chooseActionNeeded(issueType: SupportIssueType, riskLevel: SupportRiskLevel, ticket: SupportTicketRecord): SupportActionNeeded {
    const text = getTicketText(ticket);

    if (riskLevel === 'Critical' || issueType === 'Security') return 'Security review required';
    if (!ticket.message || ticket.message.trim().length < 24) return 'Ask user for more information';
    if (issueType === 'Payment' || issueType === 'Account') return 'Human review only';
    if (issueType === 'Email') return 'Resend email with approval';
    if (/(database|missing row|missing profile|sql|record|data mismatch)/i.test(text)) return 'Create SQL change request';
    if (issueType === 'Bug' || issueType === 'Performance' || issueType === 'RSVP') return 'Open PR';
    return 'Human review only';
}

function getSafeContext(ticket: SupportTicketRecord) {
    const context = [
        `Ticket ID: ${ticket.id}`,
        ticket.user_id ? `User ID: ${ticket.user_id}` : null,
        ticket.user_email ? `User email present: yes` : null,
        ticket.category ? `Category: ${ticket.category}` : null,
        ticket.affected_feature ? `Affected feature: ${ticket.affected_feature}` : null,
        ticket.error_code ? `Error code: ${ticket.error_code}` : null,
        ticket.browser ? `Browser: ${truncate(ticket.browser, 120)}` : null,
        ticket.device ? `Device: ${truncate(ticket.device, 120)}` : null,
        ticket.page_url ? `Page URL: ${truncate(ticket.page_url, 180)}` : null,
        ticket.screenshot_url ? `Screenshot attached: yes` : null,
        ticket.created_at ? `Timestamp: ${ticket.created_at}` : null,
    ].filter(Boolean) as string[];

    return context;
}

function getLikelyCause(issueType: SupportIssueType, ticket: SupportTicketRecord) {
    const feature = ticket.affected_feature || 'the affected feature';
    const text = getTicketText(ticket);

    if (issueType === 'Security') {
        return 'The report may involve access control, privacy, or exposed sensitive information. Treat it as security-sensitive until a human verifies the scope.';
    }
    if (issueType === 'Payment') {
        return 'The issue likely sits around checkout, plan status, or payment synchronization. Do not change payment status without human review.';
    }
    if (issueType === 'Email') {
        return 'The issue may be caused by email delivery, template rendering, suppression, rate limits, or a failed notification event.';
    }
    if (issueType === 'RSVP') {
        return 'The issue likely affects RSVP submission, guest lookup, validation, or the dashboard display for RSVP records.';
    }
    if (issueType === 'Account') {
        return 'The issue likely involves authentication, session state, profile setup, or dashboard access.';
    }
    if (issueType === 'Performance') {
        return `The report points to slow loading or stalled behavior in ${feature}. Check recent errors, network calls, and heavy client-side work.`;
    }
    if (issueType === 'Bug' && /(404|not found)/i.test(text)) {
        return `The report points to a missing route, invalid identifier, or lookup failure in ${feature}.`;
    }
    if (issueType === 'Bug') {
        return `The report points to an app bug in ${feature}. Reproduce with the safe ticket metadata before proposing a code change.`;
    }
    if (issueType === 'User Error') {
        return 'The issue may be caused by unclear UI, missing guidance, or a workflow misunderstanding.';
    }
    return 'There is not enough information to identify a confident cause yet.';
}

function getSuggestedFix(issueType: SupportIssueType, actionNeeded: SupportActionNeeded) {
    if (actionNeeded === 'Ask user for more information') {
        return 'Ask the user for the exact page, steps to reproduce, timestamp, browser/device, and any visible error code.';
    }
    if (actionNeeded === 'Security review required') {
        return 'Escalate immediately to a human reviewer. Preserve evidence, avoid exposing raw data, and do not make changes until reviewed.';
    }
    if (actionNeeded === 'Create SQL change request') {
        return 'Prepare a SQL change request for human review. Do not run SQL directly and include rollback steps.';
    }
    if (actionNeeded === 'Open PR') {
        return 'Create a separate branch and open a pull request with a narrow fix, risk notes, and test steps. Do not merge.';
    }
    if (actionNeeded === 'Resend email with approval') {
        return 'Check safe email event metadata and prepare a resend action for human approval. Do not send automatically.';
    }
    if (issueType === 'Payment') {
        return 'Compare safe payment metadata and logs, then escalate to a human before any billing, plan, or subscription change.';
    }
    return 'Human should review the report and decide whether to ask for more details, prepare a PR, or prepare a SQL change request.';
}

export function createSupportInvestigationReport(ticket: SupportTicketRecord): SupportInvestigationReport {
    const issueType = classifySupportTicket(ticket);
    const riskLevel = determineRiskLevel(ticket, issueType);
    const actionNeeded = chooseActionNeeded(issueType, riskLevel, ticket);
    const subject = normalizeText(ticket.subject) || `${issueType} support issue`;
    const safeContextReviewed = getSafeContext(ticket);
    const evidence = [
        ticket.error_code ? `Reporter supplied error code: ${ticket.error_code}` : null,
        ticket.affected_feature ? `Reporter identified affected feature: ${ticket.affected_feature}` : null,
        ticket.category ? `Reporter category: ${ticket.category}` : null,
        ticket.message ? `Ticket message reviewed after privacy minimization. Length: ${ticket.message.length} characters.` : null,
        ticket.screenshot_url ? 'Screenshot exists but was not inspected automatically.' : null,
    ].filter(Boolean) as string[];

    const report: SupportInvestigationReport = {
        title: truncate(subject, 140),
        ticket: `Ticket ID: ${ticket.id}; affected feature: ${ticket.affected_feature || 'not provided'}`,
        issueType,
        riskLevel,
        safeContextReviewed,
        likelyCause: getLikelyCause(issueType, ticket),
        evidence: evidence.length > 0 ? evidence : ['No supporting logs or error codes were provided.'],
        suggestedFix: getSuggestedFix(issueType, actionNeeded),
        actionNeeded,
    };

    if (actionNeeded === 'Open PR') {
        report.prDraft = {
            title: `Fix: ${truncate(subject, 80)}`,
            summary: `Investigate and fix the reported ${issueType.toLowerCase()} in ${ticket.affected_feature || 'the affected app area'}. Keep the change narrow and avoid touching unrelated workflows.`,
            changes: [
                'Identify the route, API handler, or component tied to the reported feature.',
                'Add the smallest code fix that resolves the reproducible issue.',
                'Add or update focused tests where practical.',
            ],
            risk: riskLevel === 'Critical' ? 'High' : riskLevel,
            testing: [
                'Run npm run lint.',
                'Run npm run build.',
                'Manually verify the affected support-ticket workflow.',
            ],
            humanReviewRequired: true,
        };
    }

    if (actionNeeded === 'Create SQL change request') {
        report.sqlChangeRequest = {
            purpose: 'Prepare a database repair proposal for human review only. The agent must not execute SQL directly.',
            proposedSql: '-- Add the minimal SQL proposal here after a human confirms the affected rows and rollback path.',
            riskLevel,
            affectedTables: ['To be confirmed during human review'],
            rollbackPlan: 'Create a backup of affected rows first. Roll back by restoring only those rows from the backup snapshot.',
            humanApprovalRequired: true,
        };
    }

    return report;
}

export function formatInvestigationReport(report: SupportInvestigationReport) {
    const lines = [
        'Title:',
        report.title,
        '',
        'Ticket:',
        report.ticket,
        '',
        'Issue Type:',
        report.issueType,
        '',
        'Risk Level:',
        report.riskLevel,
        '',
        'Safe Context Reviewed:',
        ...report.safeContextReviewed.map((item) => `- ${item}`),
        '',
        'Likely Cause:',
        report.likelyCause,
        '',
        'Evidence:',
        ...report.evidence.map((item) => `- ${item}`),
        '',
        'Suggested Fix:',
        report.suggestedFix,
        '',
        'Action Needed:',
        report.actionNeeded,
    ];

    if (report.prDraft) {
        lines.push(
            '',
            'PR Format:',
            `Title: ${report.prDraft.title}`,
            '',
            'Summary:',
            report.prDraft.summary,
            '',
            'Changes:',
            ...report.prDraft.changes.map((item) => `- ${item}`),
            '',
            `Risk: ${report.prDraft.risk}`,
            '',
            'Testing:',
            ...report.prDraft.testing.map((item) => `- ${item}`),
            '',
            'Human Review Required:',
            'Yes',
        );
    }

    if (report.sqlChangeRequest) {
        lines.push(
            '',
            'SQL Change Request:',
            'Purpose:',
            report.sqlChangeRequest.purpose,
            '',
            'Proposed SQL:',
            report.sqlChangeRequest.proposedSql,
            '',
            `Risk Level: ${report.sqlChangeRequest.riskLevel}`,
            '',
            'Affected Tables:',
            ...report.sqlChangeRequest.affectedTables.map((item) => `- ${item}`),
            '',
            'Rollback Plan:',
            report.sqlChangeRequest.rollbackPlan,
            '',
            'Human Approval Required:',
            'Yes',
        );
    }

    return lines.join('\n');
}

export async function runSupportInvestigation(ticketId: string, reviewedBy: string) {
    const db = getSupabaseAdminClient() as any;

    const { data: ticket, error: ticketError } = await db
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

    if (ticketError || !ticket) {
        throw new Error(ticketError?.message || 'Support ticket not found');
    }

    const report = createSupportInvestigationReport(ticket);
    const reportText = formatInvestigationReport(report);

    const { data: investigation, error: investigationError } = await db
        .from('support_investigations')
        .insert({
            ticket_id: ticketId,
            agent: SUPPORT_AGENT_NAME,
            summary: report.title,
            issue_type: report.issueType,
            risk_level: report.riskLevel,
            safe_context_reviewed: report.safeContextReviewed,
            likely_cause: report.likelyCause,
            evidence: report.evidence,
            suggested_fix: report.suggestedFix,
            action_needed: report.actionNeeded,
            report,
            report_text: reportText,
            status: 'human_review_required',
            created_by: reviewedBy,
        })
        .select('*')
        .single();

    if (investigationError) {
        throw new Error(investigationError.message);
    }

    await db
        .from('support_agent_actions')
        .insert({
            ticket_id: ticketId,
            investigation_id: investigation.id,
            action_type: 'investigation_report_created',
            description: `Created safe investigation report. Action needed: ${report.actionNeeded}.`,
            requires_approval: true,
            status: 'pending_human_review',
            metadata: { riskLevel: report.riskLevel, issueType: report.issueType },
        });

    await db
        .from('support_agent_audit_logs')
        .insert({
            ticket_id: ticketId,
            investigation_id: investigation.id,
            actor: SUPPORT_AGENT_NAME,
            event_type: 'safe_investigation_completed',
            metadata: {
                reviewedBy,
                actionNeeded: report.actionNeeded,
                riskLevel: report.riskLevel,
                safety: 'no_production_changes_no_deploy_no_secret_access',
            },
        });

    await db
        .from('support_tickets')
        .update({
            status: 'needs_human_review',
            priority: report.riskLevel === 'Critical' || report.riskLevel === 'High' ? 'high' : 'normal',
            updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

    return investigation;
}
