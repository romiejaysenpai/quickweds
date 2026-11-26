import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function escapeIcs(value: string | null | undefined) {
    return (value || '')
        .replaceAll('\r\n', '\n')
        .replaceAll('\r', '\n')
        .replaceAll('\\', '\\\\')
        .replaceAll('\n', '\\n')
        .replaceAll(',', '\\,')
        .replaceAll(';', '\\;');
}

function toIcsDate(value: string | null | undefined) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function tokensEqual(a: string, b: string) {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const weddingId = sanitizeWeddingId(searchParams.get('weddingId') || '');
    const token = (searchParams.get('token') || '').trim();

    if (!weddingId || !token) {
        return NextResponse.json({ error: 'Missing calendar feed details' }, { status: 400 });
    }

    const rateLimit = createRateLimitMiddleware('WEDDING_READ');
    const limited = await rateLimit.check(`${getClientIP(req)}:${weddingId}:ics`);
    if (limited.limited) return limited.response;

    const db = getSupabaseAdminClient() as any;
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, bride_name, groom_name, planner_calendar_token')
        .eq('id', weddingId)
        .is('deleted_at', null)
        .maybeSingle();

    if (
        weddingError ||
        !wedding ||
        !wedding.planner_calendar_token ||
        !tokensEqual(String(wedding.planner_calendar_token), token)
    ) {
        return NextResponse.json({ error: 'Calendar feed not found' }, { status: 404 });
    }

    const { data: events, error } = await db
        .from('planner_events')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('starts_at', { ascending: true })
        .limit(1000);

    if (error) {
        console.error('Planner ICS feed query error:', error);
        return NextResponse.json({ error: 'Unable to load calendar feed.' }, { status: 500 });
    }

    const calendarName = `${wedding.bride_name || 'QuickWeds'} & ${wedding.groom_name || 'Wedding'} Planner`;
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//QuickWeds//Planner Calendar//EN',
        `X-WR-CALNAME:${escapeIcs(calendarName)}`,
        ...(events || []).flatMap((event: any) => {
            const start = toIcsDate(event.starts_at);
            if (!start) return [];
            const stamp = toIcsDate(event.updated_at || event.created_at || event.starts_at) || start;
            const end = toIcsDate(event.ends_at);
            return [
                'BEGIN:VEVENT',
                `UID:${escapeIcs(String(event.id))}@quickweds`,
                `DTSTAMP:${stamp}`,
                `DTSTART:${start}`,
                end ? `DTEND:${end}` : '',
                `SUMMARY:${escapeIcs(event.title)}`,
                event.location ? `LOCATION:${escapeIcs(event.location)}` : '',
                event.notes ? `DESCRIPTION:${escapeIcs(event.notes)}` : '',
                'END:VEVENT',
            ].filter(Boolean);
        }),
        'END:VCALENDAR',
    ];

    return new NextResponse(lines.join('\r\n'), {
        headers: {
            ...limited.headers,
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="quickweds-${weddingId}-calendar.ics"`,
            'Cache-Control': 'no-store',
        },
    });
}
