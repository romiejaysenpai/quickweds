import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { reminderSchema, validateRequest } from '@/lib/validations';
import { createRateLimitMiddleware, getClientIP, sanitizeInput, sanitizeEmail, sanitizeWeddingId } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    FREE_PLAN_LIMITS,
    getEmailLimitMessage,
    getUserTriggeredEmailUsage,
    hasPlannerProAccess,
    logPlannerEmailEvent,
} from '@/lib/planner-limits';
import { getWeddingPublicUrl } from '@/lib/wedding-slugs';

export async function POST(req: NextRequest) {
    // Rate limit reminder requests by IP
    const rateLimit = createRateLimitMiddleware('REMINDER_EMAIL');
    const clientIP = getClientIP(req);
    const result = await rateLimit.check(`${clientIP}:rsvp-reminder`);

    if (result.limited) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        const { user, error: authError } = await getRequestUser(req);
        if (!user) {
            return NextResponse.json({ error: authError || 'Please sign in to send reminders.' }, { status: 401 });
        }

        const body = await req.json();
        
        // CRITICAL FIX #2: Sanitize inputs before validation
        if (body.weddingId) {
            body.weddingId = sanitizeWeddingId(body.weddingId);
        }
        if (body.targetStatus) {
            body.targetStatus = sanitizeInput(body.targetStatus, { maxLength: 20 });
        }
        
        const validation = validateRequest(reminderSchema, body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.errors }, { status: 400 });
        }

        const { weddingId, targetStatus } = validation.data;
        const db = getSupabaseAdminClient() as any;

        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('*')
            .eq('id', weddingId)
            .maybeSingle();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }

        const isAdmin = isKnownAdminEmail(user.email);
        let canManage = isAdmin || wedding.user_id === user.id;
        if (!canManage && user.email) {
            const { data: collaborator } = await db
                .from('wedding_collaborators')
                .select('id')
                .eq('wedding_id', weddingId)
                .eq('email', user.email.toLowerCase())
                .eq('status', 'accepted')
                .in('role', ['partner', 'coordinator'])
                .maybeSingle();
            canManage = Boolean(collaborator);
        }

        if (!canManage) {
            return NextResponse.json({ error: 'You do not have permission to send reminders for this wedding.' }, { status: 403 });
        }

        const { data: guests, error: guestError } = await db
            .from('rsvps')
            .select('guest_name, guest_email, rsvp_status, attendance')
            .eq('wedding_id', weddingId);

        if (guestError) {
            return NextResponse.json({ error: guestError.message }, { status: 500 });
        }

        // CRITICAL FIX #2: Sanitize guest data before sending emails
        const recipients: Array<{ guest_name: string | null; guest_email: string }> = (guests || []).filter((guest: any) => {
            const normalizedStatus = guest.rsvp_status || (guest.attendance === 'Yes' ? 'confirmed' : guest.attendance === 'No' ? 'declined' : 'pending');
            const sanitizedEmail = sanitizeEmail(guest.guest_email || '');
            return sanitizedEmail && normalizedStatus === targetStatus;
        }).map((guest: any) => ({
            ...guest,
            guest_name: sanitizeInput(guest.guest_name, { maxLength: 200 }),
            guest_email: sanitizeEmail(guest.guest_email),
        }));

        // Sanitize wedding data for email
        const sanitizedBrideName = sanitizeInput(wedding.bride_name, { maxLength: 200 });
        const sanitizedGroomName = sanitizeInput(wedding.groom_name, { maxLength: 200 });
        const sanitizedWeddingDate = sanitizeInput(wedding.wedding_date, { maxLength: 50 });
        const sanitizedRsvpDeadline = sanitizeInput(wedding.rsvp_deadline, { maxLength: 50 });

        const weddingUrl = wedding.custom_domain
            ? `https://${sanitizeInput(wedding.custom_domain, { maxLength: 100 })}`
            : getWeddingPublicUrl(process.env.NEXT_PUBLIC_BASE_URL || 'https://quickweds.vercel.app', wedding);

        const { data: ownerProfile } = await db
            .from('user_app_profiles')
            .select('is_pro, payment_status')
            .eq('user_id', wedding.user_id)
            .maybeSingle();
        const hasPlannerPro = hasPlannerProAccess({ isAdmin, wedding, accountProfile: ownerProfile });
        const emailsUsed = await getUserTriggeredEmailUsage(db, weddingId);

        if (!hasPlannerPro && emailsUsed + recipients.length > FREE_PLAN_LIMITS.userTriggeredEmails) {
            return NextResponse.json({
                error: getEmailLimitMessage(recipients.length, emailsUsed),
                code: 'email_limit_reached',
                used: emailsUsed,
                limit: FREE_PLAN_LIMITS.userTriggeredEmails,
                requested: recipients.length,
            }, { status: 402 });
        }

        const results = await Promise.all(recipients.map((guest: { guest_name: string | null; guest_email: string }) => sendEmail({
            to: guest.guest_email,
            subject: `Reminder: ${sanitizedBrideName} & ${sanitizedGroomName} would love your RSVP`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2e2e2e;">
                    <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 400; line-height: 1.2; letter-spacing: -0.3px; margin-bottom: 12px;">A quick RSVP reminder</h1>
                    <p style="font-size: 16px; line-height: 1.65;">Hi ${guest.guest_name},</p>
                    <p style="font-size: 16px; line-height: 1.65;">
                        ${sanitizedBrideName} and ${sanitizedGroomName} are finalizing plans for their wedding and would love your RSVP when you have a moment.
                    </p>
                    <p style="font-size: 16px; line-height: 1.65;">
                        Event date: <strong>${sanitizedWeddingDate}</strong><br />
                        RSVP deadline: <strong>${sanitizedRsvpDeadline}</strong>
                    </p>
                    <p style="margin: 24px 0;">
                        <a href="${weddingUrl}" style="display: inline-block; background: #D16C78; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.02em;">
                            Open invitation and RSVP
                        </a>
                    </p>
                    <p style="font-size: 14px; line-height: 1.65; color: #6b6b6b;">Thank you for helping them plan the day smoothly.</p>
                </div>
            `,
        })));

        const successCount = results.filter((result) => result.success).length;

        try {
            await db.from('wedding_reminders').insert({
                wedding_id: weddingId,
                recipient_count: recipients.length,
                success_count: successCount,
                target_status: targetStatus,
                channel: 'email',
            });
            await logPlannerEmailEvent(db, {
                weddingId,
                eventType: 'rsvp_reminder',
                recipientCount: recipients.length,
                successCount,
                userId: user.id,
            });
        } catch (error) {
            console.warn('Reminder logging unavailable:', error);
        }

        return NextResponse.json({
            recipientCount: recipients.length,
            successCount,
        });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send reminders' }, { status: 500 });
    }
}
