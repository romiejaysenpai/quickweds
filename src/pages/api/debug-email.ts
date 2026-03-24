import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fetch the most recent wedding to get a real email address
        const { data: wedding, error: weddingError } = await supabase
            .from('weddings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (weddingError || !wedding) {
            return res.status(404).json({ error: 'No weddings found to test with.' });
        }

        const testGuestEmail = req.query.email as string || 'test@quickweds.site';
        const weddingId = wedding.id;
        
        // Use the same logic as the real RSVP notify
        const results = [];
        
        // 1. Test Couple Email
        results.push(await sendEmail({
            to: wedding.couple_email || 'admin@quickweds.site',
            subject: '🔔 TEST: RSVP Notification Logic Check',
            html: `<p>This is a test to verify your RSVP notification system is working.</p><p>Wedding: ${wedding.bride_name} & ${wedding.groom_name}</p>`
        }));

        // 2. Test Guest Email
        results.push(await sendEmail({
            to: testGuestEmail,
            subject: '💌 TEST: Guest Confirmation Logic Check',
            html: `<p>This is a test to verify the guest confirmation system is working.</p>`
        }));

        return res.status(200).json({ 
            message: 'Diagnostic emails triggered.', 
            weddingId,
            recipient: wedding.couple_email,
            testGuest: testGuestEmail,
            results 
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
