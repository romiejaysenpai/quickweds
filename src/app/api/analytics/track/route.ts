import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRateLimitMiddleware, getClientIP, sanitizeInput, sanitizeWeddingId } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema for analytics events
const analyticsEventSchema = z.object({
    weddingId: z.string().min(4).max(32),
    eventType: z.enum(['visit', 'qr_scan', 'rsvp_submitted', 'share_copy', 'share_whatsapp', 'share_email', 'share_sms', 'gallery_view', 'video_play']),
    source: z.string().max(50).optional(),
    metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    sessionId: z.string().max(100).optional(),
});

/**
 * POST /api/analytics/track
 * Secure endpoint for tracking wedding analytics events
 * CRITICAL FIX #1: Added IP-based rate limiting and input sanitization
 */
export async function POST(req: NextRequest) {
    // Rate limit by IP address
    const clientIP = getClientIP(req);
    const rateLimit = createRateLimitMiddleware('ANALYTICS_TRACK');
    const rateLimitResult = await rateLimit.check(clientIP);

    if (rateLimitResult.limited) {
        return rateLimitResult.response;
    }

    try {
        const body = await req.json();

        // Validate request body
        const validation = analyticsEventSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { weddingId, eventType, source, metadata, sessionId } = validation.data;

        // Additional sanitization
        const sanitizedWeddingId = sanitizeWeddingId(weddingId);
        if (!sanitizedWeddingId) {
            return NextResponse.json({ error: 'Invalid wedding ID' }, { status: 400 });
        }

        // Verify wedding exists
        const { data: wedding, error: weddingError } = await supabase
            .from('weddings')
            .select('id')
            .eq('id', sanitizedWeddingId)
            .single();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }

        // Sanitize metadata
        const sanitizedMetadata: Record<string, unknown> = {};
        if (metadata) {
            for (const [key, value] of Object.entries(metadata)) {
                const sanitizedKey = sanitizeInput(key, { maxLength: 50 });
                if (!sanitizedKey) continue;

                if (typeof value === 'string') {
                    sanitizedMetadata[sanitizedKey] = sanitizeInput(value, { maxLength: 200 });
                } else if (typeof value === 'number' || typeof value === 'boolean') {
                    sanitizedMetadata[sanitizedKey] = value;
                }
            }
        }

        // Get referrer from headers if not provided
        const referrer = req.headers.get('referer') || null;
        const sanitizedReferrer = referrer ? sanitizeInput(referrer, { maxLength: 500 }) : null;

        // Insert analytics event
        const { error: insertError } = await supabase.from('wedding_analytics_events').insert({
            wedding_id: sanitizedWeddingId,
            event_type: eventType,
            source: source ? sanitizeInput(source, { maxLength: 50 }) : 'direct',
            session_id: sessionId ? sanitizeInput(sessionId, { maxLength: 100 }) : `ip-${Buffer.from(clientIP).toString('base64').slice(0, 16)}`,
            referrer: sanitizedReferrer,
            metadata: sanitizedMetadata,
            ip_address: clientIP, // Store IP for additional security monitoring
        });

        if (insertError) {
            console.error('Analytics insert error:', insertError);
            return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { headers: rateLimitResult.headers });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /api/analytics/track
 * Get analytics summary for a wedding
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const weddingId = searchParams.get('weddingId');

        if (!weddingId) {
            return NextResponse.json({ error: 'weddingId is required' }, { status: 400 });
        }

        const sanitizedWeddingId = sanitizeWeddingId(weddingId);
        if (!sanitizedWeddingId) {
            return NextResponse.json({ error: 'Invalid wedding ID' }, { status: 400 });
        }

        // Get auth token from header
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.slice(7);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has access to this wedding
        const { data: wedding, error: weddingError } = await supabase
            .from('weddings')
            .select('user_id')
            .eq('id', sanitizedWeddingId)
            .single();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }

        // Check if user is owner or collaborator
        const hasAccess = await checkWeddingAccess(sanitizedWeddingId, user.id, user.email);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get analytics summary
        const { data: events, error: eventsError } = await supabase
            .from('wedding_analytics_events')
            .select('*')
            .eq('wedding_id', sanitizedWeddingId)
            .order('created_at', { ascending: false })
            .limit(1000);

        if (eventsError) {
            console.error('Analytics fetch error:', eventsError);
            return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
        }

        // Calculate summary
        const visitEvents = events?.filter(e => e.event_type === 'visit') || [];
        const uniqueVisitors = new Set(visitEvents.map(e => e.session_id).filter(Boolean)).size;

        const summary = {
            totalEvents: events?.length || 0,
            totalVisits: visitEvents.length,
            uniqueVisitors,
            qrScans: events?.filter(e => e.event_type === 'qr_scan').length || 0,
            rsvpSubmissions: events?.filter(e => e.event_type === 'rsvp_submitted').length || 0,
            shareActions: events?.filter(e => e.event_type?.startsWith('share_')).length || 0,
            sourceBreakdown: calculateSourceBreakdown(events || []),
            recentEvents: (events || []).slice(0, 50),
        };

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Analytics GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function checkWeddingAccess(weddingId: string, userId: string, userEmail?: string): Promise<boolean> {
    // Check if user is owner
    const { data: wedding } = await supabase
        .from('weddings')
        .select('user_id')
        .eq('id', weddingId)
        .single();

    if (wedding?.user_id === userId) {
        return true;
    }

    // Check if user is collaborator
    if (userEmail) {
        const { data: collaborator } = await supabase
            .from('wedding_collaborators')
            .select('id')
            .eq('wedding_id', weddingId)
            .eq('email', userEmail.toLowerCase())
            .eq('status', 'accepted')
            .maybeSingle();

        if (collaborator) {
            return true;
        }
    }

    return false;
}

function calculateSourceBreakdown(events: Array<{ source?: string }>) {
    const counts: Record<string, number> = {};
    events.forEach(event => {
        const source = event.source || 'direct';
        counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}
