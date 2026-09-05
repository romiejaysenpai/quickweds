import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { sendEmail } from '@/lib/email';
import { getPhotoReminderEmailHtml } from '@/lib/photo-reminder-email';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getPublicAppUrl } from '@/lib/site-url';
import { getWeddingPublicUrl } from '@/lib/wedding-slugs';
import { createRateLimitMiddleware, sanitizeWeddingId } from '@/lib/rate-limit';
import { getWeddingAccess } from '@/lib/wedding-access';
import { claimEmailDelivery, completeEmailDelivery, EMAIL_DELIVERY_TYPES } from '@/lib/database-idempotency';

export const dynamic = 'force-dynamic';

const AUTOMATION_TYPE = 'photo_upload_reminder';

function isConfirmedRsvp(rsvp: any) {
    return rsvp.rsvp_status === 'confirmed' || rsvp.rsvp_status === 'confirmed_manual' || rsvp.attendance === 'Yes';
}

function normalizeEmail(value: unknown) {
    return String(value || '').trim().toLowerCase();
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const { user, error } = await getRequestUser(req);
        if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

        const rateLimit = createRateLimitMiddleware('REMINDER_EMAIL');
        const limited = await rateLimit.check(`${user.id}:${weddingId}:photo-reminder`);
        if (limited.limited) return limited.response;

        const db = getSupabaseAdminClient() as any;
        const access = await getWeddingAccess(db, user, weddingId, {
            select: 'id, user_id, bride_name, groom_name, wedding_date, public_slug, custom_domain',
            collaboratorRoles: ['partner', 'coordinator'],
        });

        if (!access.wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        if (!access.canManage) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { data: rsvps, error: rsvpError } = await db
            .from('rsvps')
            .select('id, guest_name, guest_email, rsvp_status, attendance')
            .eq('wedding_id', weddingId)
            .not('guest_email', 'is', null);

        if (rsvpError) throw rsvpError;

        const recipientsByEmail = new Map<string, any>();
        for (const rsvp of rsvps || []) {
            const email = normalizeEmail(rsvp.guest_email);
            if (!email || !isConfirmedRsvp(rsvp) || recipientsByEmail.has(email)) continue;
            recipientsByEmail.set(email, rsvp);
        }

        const emails = Array.from(recipientsByEmail.keys());
        if (emails.length === 0) {
            return NextResponse.json({ sent: 0, skipped: 0, failed: 0, message: 'No confirmed guests with email addresses were found.' });
        }

        const { data: existingLogs, error: logsError } = await db
            .from('automation_logs')
            .select('target_email')
            .eq('wedding_id', weddingId)
            .eq('automation_type', AUTOMATION_TYPE)
            .in('target_email', emails);

        if (logsError) throw logsError;

        const alreadySent = new Set((existingLogs || []).map((log: any) => normalizeEmail(log.target_email)));
        const baseUrl = getPublicAppUrl();
        const publicUrl = getWeddingPublicUrl(baseUrl, access.wedding);
        const uploadUrl = `${publicUrl.replace(/\/+$/, '')}/photos`;
        const coupleName = [access.wedding.bride_name, access.wedding.groom_name].filter(Boolean).join(' & ') || 'the couple';

        let sent = 0;
        let skipped = 0;
        let failed = 0;
        const failures: string[] = [];

        for (const email of emails) {
            const rsvp = recipientsByEmail.get(email);
            if (alreadySent.has(email)) {
                skipped += 1;
                continue;
            }

            const leaseToken = await claimEmailDelivery(db, {
                weddingId,
                deliveryType: EMAIL_DELIVERY_TYPES.photoUploadReminder,
                recipientKey: rsvp.id,
            });

            if (!leaseToken) {
                skipped += 1;
                continue;
            }

            const result = await sendEmail({
                to: email,
                subject: `Share your photos from ${coupleName}'s wedding`,
                html: getPhotoReminderEmailHtml({
                    guestName: rsvp.guest_name,
                    coupleName,
                    photoUploadUrl: uploadUrl,
                    weddingDate: access.wedding.wedding_date,
                }),
            });

            // Persist the outcome before writing the user-facing automation log so
            // an overlapping request cannot send the same email during log writes.
            await completeEmailDelivery(db, {
                weddingId,
                deliveryType: EMAIL_DELIVERY_TYPES.photoUploadReminder,
                recipientKey: rsvp.id,
                leaseToken,
                succeeded: result.success,
                providerMessageId: result.success ? result.id : null,
            });

            const status = result.success ? 'sent' : 'failed';
            const { error: insertError } = await db.from('automation_logs').insert({
                wedding_id: weddingId,
                automation_type: AUTOMATION_TYPE,
                target_email: email,
                target_rsvp_id: rsvp.id,
                status,
                metadata: {
                    resend_id: result.success ? result.id || null : null,
                    error: result.success ? null : result.error || 'Email send failed',
                    sent_by: user.id,
                },
            });

            if (insertError) throw insertError;

            if (result.success) {
                sent += 1;
            } else {
                failed += 1;
                failures.push(`${email}: ${result.error || 'Email send failed'}`);
            }
        }

        return NextResponse.json({ sent, skipped, failed, failures });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to send photo reminders.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
