import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail, rsvpNotificationHtml, guestConfirmationHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { weddingId, guestName, guestEmail, attendance, numGuests, message, dietaryDetails, songRequest, plusOneNames, childrenCount } = await req.json();

        if (!weddingId || !guestName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch wedding data to get couple email
        const { data: wedding, error } = await supabase
            .from('weddings')
            .select('bride_name, groom_name, couple_email, user_id, wedding_date, wedding_time, venue_name, venue_address, maps_link, custom_domain')
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
        const finalWeddingUrl = wedding.custom_domain ? `https://${wedding.custom_domain}` : `${appUrl}/w/${weddingId}`;

        // Prepare email bodies
        const coupleHtml = rsvpNotificationHtml({
            guestName, guestEmail, attendance, numGuests, message, dietaryDetails, songRequest, plusOneNames, childrenCount,
            weddingUrl: dashboardUrl,
        });

        const promises = [];

        // 1. Send to Couple
        promises.push(
            sendEmail({
                to: recipientEmail,
                subject: `${attendance === 'Yes' ? '🎉' : '📩'} RSVP Received: ${guestName} — ${wedding.bride_name} & ${wedding.groom_name}`,
                html: coupleHtml,
            })
        );

        // 2. Send to Guest (if email provided)
        if (guestEmail) {
            const guestHtml = guestConfirmationHtml({
                guestName,
                attendance,
                numGuests,
                brideName: wedding.bride_name,
                groomName: wedding.groom_name,
                weddingDate: wedding.wedding_date,
                weddingTime: wedding.wedding_time,
                venueName: wedding.venue_name,
                venueAddress: wedding.venue_address,
                mapsLink: wedding.maps_link,
                weddingUrl: finalWeddingUrl
            });
            promises.push(
                sendEmail({
                    to: guestEmail,
                    subject: attendance === 'Yes' ? "We can't wait to see you! (RSVP Confirmation)" : "RSVP Confirmation",
                    html: guestHtml
                })
            );
        }

        const results = await Promise.all(promises);
        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('RSVP notify error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
