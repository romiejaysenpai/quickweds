import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

function escapeIcs(value: string | null | undefined) {
    return (value || '')
        .replaceAll('\\', '\\\\')
        .replaceAll('\n', '\\n')
        .replaceAll(',', '\\,')
        .replaceAll(';', '\\;');
}

function toIcsDate(value: string | null | undefined) {
    if (!value) return '';
    return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const weddingId = searchParams.get('weddingId') || '';
    const token = searchParams.get('token') || '';

    if (!weddingId || !token) {
        return NextResponse.json({ error: 'Missing calendar feed details' }, { status: 400 });
    }

    const db = getSupabaseAdminClient() as any;
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, bride_name, groom_name, planner_calendar_token')
        .eq('id', weddingId)
        .maybeSingle();

    if (weddingError || !wedding || wedding.planner_calendar_token !== token) {
        return NextResponse.json({ error: 'Calendar feed not found' }, { status: 404 });
    }

    const { data: events, error } = await db
        .from('planner_events')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('starts_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const calendarName = `${wedding.bride_name || 'QuickWeds'} & ${wedding.groom_name || 'Wedding'} Planner`;
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//QuickWeds//Planner Calendar//EN',
        `X-WR-CALNAME:${escapeIcs(calendarName)}`,
        ...(events || []).flatMap((event: any) => [
            'BEGIN:VEVENT',
            `UID:${event.id}@quickweds`,
            `DTSTAMP:${toIcsDate(event.updated_at || event.created_at || event.starts_at)}`,
            `DTSTART:${toIcsDate(event.starts_at)}`,
            event.ends_at ? `DTEND:${toIcsDate(event.ends_at)}` : '',
            `SUMMARY:${escapeIcs(event.title)}`,
            event.location ? `LOCATION:${escapeIcs(event.location)}` : '',
            event.notes ? `DESCRIPTION:${escapeIcs(event.notes)}` : '',
            'END:VEVENT',
        ].filter(Boolean)),
        'END:VCALENDAR',
    ];

    return new NextResponse(lines.join('\r\n'), {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="quickweds-${weddingId}-calendar.ics"`,
        },
    });
}
