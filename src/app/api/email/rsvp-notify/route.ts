import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail, rsvpNotificationHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { weddingId, guestName, attendance, numGuests, message } = await req.json();

        if (!weddingId || !guestName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch wedding data to get couple email
        const { data: wedding, error } = await supabase
            .from('weddings')
            .select('bride_name, groom_name, couple_email, user_id')
            .eq('id', weddingId)
            .single();

        if (error || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }

        // Get user email if couple_email not set
        let recipientEmail = wedding.couple_email;
        if (!recipientEmail && wedding.user_id) {
            const { data: user } = await supabase
                .from('users')
                .select('email')
                .eq('id', wedding.user_id)
                .single();
            recipientEmail = user?.email;
        }

        if (!recipientEmail) {
            return NextResponse.json({ error: 'No recipient email found' }, { status: 404 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const dashboardUrl = `${appUrl}/dashboard/${weddingId}`;

        const html = rsvpNotificationHtml({
            guestName,
            attendance,
            numGuests,
            message,
            weddingUrl: dashboardUrl,
        });

        const result = await sendEmail({
            to: recipientEmail,
            subject: `${attendance === 'Yes' ? '🎉' : '📩'} New RSVP from ${guestName} — ${wedding.bride_name} & ${wedding.groom_name}'s Wedding`,
            html,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('RSVP notify error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
