import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { rsvpNotifySchema } from '@/lib/validations';
import { createRateLimitMiddleware, sanitizeEmail, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limit';
import { sendRsvpNotifications } from '@/lib/rsvp-notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const weddingId = sanitizeWeddingId(req.body?.weddingId);
    if (weddingId) {
        const rateLimit = createRateLimitMiddleware('RSVP_NOTIFY');
        const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
            || (req.headers['x-real-ip'] as string)
            || 'unknown';
        const result = await rateLimit.check(clientIP !== 'unknown' ? `${clientIP}:${weddingId}` : weddingId);

        if (result.limited) {
            return res.status(429).json({
                error: 'Too many requests. Please try again later.',
                message: 'Too many requests. Please try again later.',
            });
        }
    }

    try {
        const validation = rsvpNotifySchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessages = validation.error.issues.map((err) => err.message).join(', ');
            return res.status(400).json({ error: errorMessages });
        }

        const {
            weddingId: validatedWeddingId,
            guestName: rawGuestName,
            guestEmail: rawGuestEmail,
            attendance,
            numGuests,
            message: rawMessage,
            dietaryDetails: rawDietaryDetails,
            songRequest: rawSongRequest,
            plusOneNames: rawPlusOneNames,
            childrenCount,
        } = validation.data;

        const safeWeddingId = sanitizeWeddingId(validatedWeddingId);
        const guestName = sanitizeInput(rawGuestName, { maxLength: 200 });
        const guestEmail = sanitizeEmail(rawGuestEmail || '');
        const message = sanitizeInput(rawMessage || '', { maxLength: 2000, allowNewlines: true });
        const dietaryDetails = sanitizeInput(rawDietaryDetails || '', { maxLength: 1000 });
        const songRequest = sanitizeInput(rawSongRequest || '', { maxLength: 500 });
        const plusOneNames = sanitizeInput(rawPlusOneNames || '', { maxLength: 1000 });

        if (!safeWeddingId || !guestName) {
            return res.status(400).json({ error: 'Valid wedding ID and guest name are required' });
        }

        const db = getSupabaseAdminClient() as any;
        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id, user_id, bride_name, groom_name, wedding_date, wedding_time, venue_name, venue_address, maps_link, couple_email, contact_person, custom_domain, notify_on_rsvp, hero_image, couple_photo, gallery_images, invitation_image, reception_venue_photos')
            .eq('id', safeWeddingId)
            .is('deleted_at', null)
            .maybeSingle();

        if (weddingError || !wedding) {
            return res.status(404).json({ error: 'Wedding not found' });
        }

        const result = await sendRsvpNotifications(db, {
            weddingId: safeWeddingId,
            wedding,
            guestName,
            guestEmail,
            attendance,
            numGuests,
            message,
            dietaryDetails,
            songRequest,
            plusOneNames,
            childrenCount,
        });

        return res.status(200).json({
            success: result.success,
            message: result.success ? 'Emails sent' : 'Some emails failed to send',
            results: result.results,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown RSVP notify error';
        console.error('RSVP notify critical error:', error);
        return res.status(500).json({ error: message });
    }
}
