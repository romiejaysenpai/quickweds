import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { reminderSchema, validateRequest } from '@/lib/validations';
import { createRateLimitMiddleware } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
    // Rate limit reminder requests
    const rateLimit = createRateLimitMiddleware('REMINDER_EMAIL');
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const result = rateLimit.check(ip);

    if (result.limited) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        const body = await req.json();
        const validation = validateRequest(reminderSchema, body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.errors }, { status: 400 });
        }

        const { weddingId, targetStatus } = validation.data;

        const { data: wedding, error: weddingError } = await supabase
            .from('weddings')
            .select('*')
            .eq('id', weddingId)
            .single();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }

        const { data: guests, error: guestError } = await supabase
            .from('rsvps')
            .select('guest_name, guest_email, rsvp_status, attendance')
            .eq('wedding_id', weddingId);

        if (guestError) {
            return NextResponse.json({ error: guestError.message }, { status: 500 });
        }

        const recipients = (guests || []).filter((guest) => {
            const normalizedStatus = guest.rsvp_status || (guest.attendance === 'Yes' ? 'confirmed' : guest.attendance === 'No' ? 'declined' : 'pending');
            return guest.guest_email && normalizedStatus === targetStatus;
        });

        const weddingUrl = wedding.custom_domain
            ? `https://${wedding.custom_domain}`
            : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickweds.vercel.app'}/w/${weddingId}`;

        const results = await Promise.all(recipients.map((guest) => sendEmail({
            to: guest.guest_email,
            subject: `Reminder: ${wedding.bride_name} & ${wedding.groom_name} would love your RSVP`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2e2e2e;">
                    <h1 style="font-size: 24px; margin-bottom: 12px;">A quick RSVP reminder</h1>
                    <p style="line-height: 1.6;">Hi ${guest.guest_name},</p>
                    <p style="line-height: 1.6;">
                        ${wedding.bride_name} and ${wedding.groom_name} are finalizing plans for their wedding and would love your RSVP when you have a moment.
                    </p>
                    <p style="line-height: 1.6;">
                        Event date: <strong>${wedding.wedding_date}</strong><br />
                        RSVP deadline: <strong>${wedding.rsvp_deadline}</strong>
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

        const successCount = results.filter((result) => result.success).length;

        try {
            await supabase.from('wedding_reminders').insert({
                wedding_id: weddingId,
                recipient_count: recipients.length,
                success_count: successCount,
                target_status: targetStatus,
                channel: 'email',
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
