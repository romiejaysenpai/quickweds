import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

function html(message: string, detail: string) {
    return new NextResponse(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QuickWeds Email Preferences</title>
</head>
<body style="margin:0; font-family: Arial, sans-serif; background:#fff8f4; color:#3a2a2d;">
    <main style="max-width:560px; margin:80px auto; padding:36px; background:#fff; border-radius:24px; box-shadow:0 18px 38px rgba(209,108,120,0.14);">
        <p style="margin:0 0 10px; color:#d16c78; font-size:12px; font-weight:800; letter-spacing:.14em; text-transform:uppercase;">QuickWeds</p>
        <h1 style="margin:0 0 14px; font-size:28px; line-height:1.2;">${message}</h1>
        <p style="margin:0; font-size:16px; line-height:1.7; color:#7a5a61;">${detail}</p>
    </main>
</body>
</html>`, {
        headers: { 'content-type': 'text/html; charset=utf-8' },
    });
}

async function unsubscribeByToken(token: string) {
    const db = getSupabaseAdminClient() as any;
    const { data, error } = await db
        .from('marketing_nurture_subscribers')
        .update({
            status: 'unsubscribed',
            unsubscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('unsubscribe_token', token)
        .select('email')
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function extractTokenFromRequest(req: NextRequest): Promise<string> {
    const queryToken = new URL(req.url).searchParams.get('token')?.trim();
    if (queryToken) return queryToken;

    const contentType = (req.headers.get('content-type') || '').toLowerCase();
    try {
        if (contentType.includes('application/json')) {
            const body = await req.json();
            if (typeof body?.token === 'string') return body.token.trim();
        } else if (
            contentType.includes('application/x-www-form-urlencoded') ||
            contentType.includes('multipart/form-data')
        ) {
            const formData = await req.formData();
            const formToken = formData.get('token');
            if (typeof formToken === 'string') return formToken.trim();
        } else {
            const rawText = await req.text();
            if (rawText) {
                const params = new URLSearchParams(rawText);
                const parsedToken = params.get('token')?.trim();
                if (parsedToken) return parsedToken;
            }
        }
    } catch {
        // Ignore body parse errors if token is missing
    }

    return '';
}

export async function GET(req: NextRequest) {
    const token = new URL(req.url).searchParams.get('token')?.trim();
    if (!token) {
        return html('Missing unsubscribe link', 'The unsubscribe link is incomplete.');
    }

    try {
        const data = await unsubscribeByToken(token);
        if (!data) {
            return html('Link not found', 'This unsubscribe link may have already been removed or replaced.');
        }

        return html('You are unsubscribed', 'You will no longer receive QuickWeds marketing nurture emails.');
    } catch {
        return html('We could not update your preferences', 'Please contact QuickWeds support and we will help right away.');
    }
}

export async function POST(req: NextRequest) {
    const token = await extractTokenFromRequest(req);
    if (!token) {
        return NextResponse.json({ error: 'Missing unsubscribe token' }, { status: 400 });
    }

    try {
        const data = await unsubscribeByToken(token);
        if (!data) {
            return NextResponse.json({ error: 'Unsubscribe link not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, status: 'unsubscribed' }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Unable to update preferences' }, { status: 500 });
    }
}
