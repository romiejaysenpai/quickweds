import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { sendEmail } from '@/lib/email';
import { getPublicAppUrl } from '@/lib/site-url';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getResolutionEmailHtml(input: {
    subject: string;
    affectedFeature?: string | null;
    resolutionNote?: string | null;
}) {
    const appUrl = getPublicAppUrl();
    const safeSubject = escapeHtml(input.subject);
    const safeFeature = escapeHtml(input.affectedFeature || 'the reported issue');
    const safeResolutionNote = input.resolutionNote ? escapeHtml(input.resolutionNote) : '';

    return `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px; color: #3A2A2D;">
            <p style="margin: 0 0 8px; color: #D16C78; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px;">QuickWeds Support</p>
            <h1 style="margin: 0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 30px; line-height: 1.15; letter-spacing: -0.3px;">Your reported issue has been fixed</h1>
            <p style="font-size: 16px; line-height: 1.7; color: #7A5A61;">
                Hi there, thanks for reporting an issue with ${safeFeature}. We have applied a fix for your report:
            </p>
            <div style="margin: 22px 0; padding: 18px; border-left: 4px solid #D16C78; background: #FFF8F4; border-radius: 8px;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #3A2A2D;"><strong>${safeSubject}</strong></p>
            </div>
            ${safeResolutionNote ? `
                <p style="font-size: 15px; line-height: 1.7; color: #7A5A61;">${safeResolutionNote}</p>
            ` : ''}
            <p style="font-size: 16px; line-height: 1.7; color: #7A5A61;">
                Please check the app again when you have a moment. If the error still appears, reply to this email or submit another support report with the latest details.
            </p>
            <p style="margin: 28px 0;">
                <a href="${appUrl}/dashboard" style="display: inline-block; background: #D16C78; color: #fff; padding: 14px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">Open QuickWeds</a>
            </p>
            <p style="font-size: 12px; line-height: 1.6; color: #9b7b82;">
                This message was sent after a QuickWeds admin marked your support ticket as resolved.
            </p>
        </div>
    `;
}

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });
    if (!isKnownAdminEmail(user.email)) {
        return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const ticketId = String(body.ticketId || '').trim();
        const resolutionNote = String(body.resolutionNote || '').trim().slice(0, 1200);

        if (!ticketId) {
            return NextResponse.json({ error: 'Missing ticketId.' }, { status: 400 });
        }

        const db = getSupabaseAdminClient() as any;
        const { data: ticket, error: ticketError } = await db
            .from('support_tickets')
            .select('id, user_email, subject, affected_feature, status')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) {
            throw new Error(ticketError?.message || 'Support ticket not found');
        }

        const userEmail = String(ticket.user_email || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
            return NextResponse.json({ error: 'Ticket does not have a valid reporter email.' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const { error: updateError } = await db
            .from('support_tickets')
            .update({
                status: 'resolved',
                resolution_note: resolutionNote || null,
                resolved_at: now,
                updated_at: now,
            })
            .eq('id', ticketId);

        if (updateError) throw updateError;

        const emailResult = await sendEmail({
            to: userEmail,
            subject: 'Your QuickWeds issue has been fixed',
            html: getResolutionEmailHtml({
                subject: ticket.subject || 'Support issue',
                affectedFeature: ticket.affected_feature,
                resolutionNote,
            }),
        });

        if (!emailResult.success) {
            await db
                .from('support_agent_audit_logs')
                .insert({
                    ticket_id: ticketId,
                    actor: user.email || user.id,
                    event_type: 'resolution_email_failed',
                    metadata: {
                        error: emailResult.error || 'unknown_email_error',
                    },
                });

            return NextResponse.json({ error: emailResult.error || 'Resolution email failed.' }, { status: 502 });
        }

        const sentAt = new Date().toISOString();
        await db
            .from('support_tickets')
            .update({
                resolution_email_sent_at: sentAt,
                updated_at: sentAt,
            })
            .eq('id', ticketId);

        await db
            .from('support_agent_actions')
            .insert({
                ticket_id: ticketId,
                action_type: 'resolution_email_sent',
                description: 'Admin marked the ticket resolved and sent the reporter a fixed-issue notification.',
                requires_approval: false,
                approved_by: user.email || user.id,
                approved_at: sentAt,
                executed_at: sentAt,
                status: 'executed',
                metadata: {
                    emailSent: true,
                    resolutionNoteProvided: Boolean(resolutionNote),
                },
            });

        await db
            .from('support_agent_audit_logs')
            .insert({
                ticket_id: ticketId,
                actor: user.email || user.id,
                event_type: 'ticket_resolved_and_reporter_notified',
                metadata: {
                    emailSentAt: sentAt,
                    safety: 'human_admin_resolved_ticket_before_email',
                },
            });

        return NextResponse.json({
            success: true,
            emailSentAt: sentAt,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to resolve and notify reporter.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
