import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail, getThankYouNoteHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const weddingId = typeof body?.weddingId === 'string' ? body.weddingId : '';
        const authHeader = req.headers.get('authorization') || '';
        const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

        if (!weddingId || !accessToken) {
            return NextResponse.json({ error: 'weddingId and authorization token are required' }, { status: 400 });
        }

        const { data: authUser, error: authError } = await supabase.auth.getUser(accessToken);
        if (authError || !authUser.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: wedding, error: weddingError } = await supabase
            .from('weddings')
            .select('id, bride_name, groom_name, wedding_date, user_id')
            .eq('id', weddingId)
            .single();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
        }
        if (wedding.user_id !== authUser.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: notes, error: notesError } = await supabase
            .from('thank_you_notes')
            .select('*')
            .eq('wedding_id', weddingId)
            .eq('status', 'draft');

        if (notesError) {
            return NextResponse.json({ error: notesError.message }, { status: 500 });
        }

        if (!notes?.length) {
            return NextResponse.json({ sentCount: 0, failedCount: 0 });
        }

        const settled = await Promise.all(notes.map(async (note) => {
            const html = getThankYouNoteHtml({
                recipientName: note.recipient_name,
                brideName: wedding.bride_name,
                groomName: wedding.groom_name,
                weddingDate: wedding.wedding_date,
                personalizedMessage: note.personalized_message || undefined,
            });
            const result = await sendEmail({
                to: note.recipient_email,
                subject: `Thank you from ${wedding.bride_name} & ${wedding.groom_name}`,
                html,
            });

            const nextStatus = result.success ? 'sent' : 'failed';
            await supabase
                .from('thank_you_notes')
                .update({
                    status: nextStatus,
                    generated_html: html,
                    sent_at: result.success ? new Date().toISOString() : null,
                })
                .eq('id', note.id);

            return result.success;
        }));

        const sentCount = settled.filter(Boolean).length;
        const failedCount = settled.length - sentCount;

        return NextResponse.json({ sentCount, failedCount });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send thank-you notes' }, { status: 500 });
    }
}
