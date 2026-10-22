import { NextRequest, NextResponse } from 'next/server';
import { queueEmailBatch, retryStoredEmail } from '@/lib/email';
import { reminderSchema, validateRequest } from '@/lib/validations';
import { createRateLimitMiddleware, getClientIP, sanitizeInput, sanitizeEmail, sanitizeWeddingId } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    FREE_PLAN_LIMITS,
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
            .is('deleted_at', null)
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

        const guests: Array<any> = [];
        for(let offset=0;offset<=5000;offset+=1000){
            const {data,error}=await db.from('rsvps').select('id,guest_name,guest_email,rsvp_status,attendance').eq('wedding_id',weddingId).order('id').range(offset,offset+999);
            if(error)throw error;guests.push(...(data||[]));if(guests.length>5000)return NextResponse.json({error:'This mailing exceeds the 5,000 guest safety limit.'},{status:400});if((data||[]).length<1000)break;
        }
        // CRITICAL FIX #2: Sanitize guest data before sending emails
        const recipients: Array<{ id:string; guest_name: string | null; guest_email: string }> = (guests || []).filter((guest: any) => {
            const normalizedStatus = guest.rsvp_status || (guest.attendance === 'Yes' ? 'confirmed' : guest.attendance === 'No' ? 'declined' : 'pending');
            const sanitizedEmail = sanitizeEmail(guest.guest_email || '');
            return sanitizedEmail && normalizedStatus === targetStatus;
        }).map((guest: any) => ({
            ...guest,
            guest_name: sanitizeInput(guest.guest_name, { maxLength: 200 }),
            guest_email: sanitizeEmail(guest.guest_email),
        }));

        const uniqueRecipients = [...new Map(recipients.map(guest=>[guest.guest_email.toLowerCase(),guest])).values()];

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

        const jobs = await queueEmailBatch(uniqueRecipients.map(guest => ({
            tracking: { key: `rsvp-reminder:${weddingId}:${validation.data.requestId}:${guest.guest_email.toLowerCase()}`, weddingId, quotaLimit: hasPlannerPro ? null : FREE_PLAN_LIMITS.userTriggeredEmails, recoverable:true, guard:{table:'rsvps',id:guest.id,emailField:'guest_email'} },
            to: guest.guest_email,
            subject: `Reminder: ${sanitizedBrideName} & ${sanitizedGroomName} would love your RSVP`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2e2e2e;">
                    <h1 style="font-size: 24px; margin-bottom: 12px;">A quick RSVP reminder</h1>
                    <p style="line-height: 1.6;">Hi ${guest.guest_name},</p>
                    <p style="line-height: 1.6;">
                        ${sanitizedBrideName} and ${sanitizedGroomName} are finalizing plans for their wedding and would love your RSVP when you have a moment.
                    </p>
                    <p style="line-height: 1.6;">
                        Event date: <strong>${sanitizedWeddingDate}</strong><br />
                        RSVP deadline: <strong>${sanitizedRsvpDeadline}</strong>
                    </p>
                    <p style="margin: 24px 0;">
                        <a href="${weddingUrl}" style="display: inline-block; background: #D16C78; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: bold;">
                            Open invitation and RSVP
                        </a>
                    </p>
                    <p style="line-height: 1.6; color: #6b6b6b;">Thank you for helping them plan the day smoothly.</p>
                </div>
            `,
        })));
        const results=[];
        for(const job of jobs.filter(job=>['queued','retryable','processing'].includes(job.state)).slice(0,5)){try{results.push(await retryStoredEmail(job));}catch{results.push({success:false});}}
        const successCount = jobs.filter(job=>job.state==='accepted').length + results.filter(result=>result.success).length;
        const newlyAccepted = results.filter(result => result.success && !('alreadyAccepted' in result && result.alreadyAccepted)).length;

        try {
            await db.from('wedding_reminders').insert({
                wedding_id: weddingId,
                recipient_count: uniqueRecipients.length,
                success_count: newlyAccepted,
                target_status: targetStatus,
                channel: 'email',
            });
            await logPlannerEmailEvent(db, {
                weddingId,
                eventType: 'rsvp_reminder',
                recipientCount: uniqueRecipients.length,
                successCount: newlyAccepted,
                userId: user.id,
            });
        } catch (error) {
            console.warn('Reminder logging unavailable:', error);
        }

        return NextResponse.json({
            recipientCount: uniqueRecipients.length,
            successCount,
            queuedCount: Math.max(0, jobs.length - successCount),
            failedCount: results.filter(result=>!result.success).length,
        });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send reminders' }, { status: 500 });
    }
}
