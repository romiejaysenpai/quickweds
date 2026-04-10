import { supabase } from '@/lib/supabase';

export type CollaboratorRole = 'partner' | 'coordinator';
export type CollaboratorStatus = 'pending' | 'accepted';

export interface WeddingCollaborator {
    id: string;
    wedding_id: string;
    email: string;
    role: CollaboratorRole;
    status: CollaboratorStatus;
    invited_by_user_id?: string;
    created_at?: string;
}

export interface WeddingAnalyticsSummary {
    totalVisits: number;
    uniqueVisitors: number;
    qrScans: number;
    rsvpConversionRate: number;
    shareActions: number;
    remindersSent: number;
    reminderRecipients: number;
    reminderResponses: number;
    sourceBreakdown: Array<{ name: string; value: number }>;
}

export interface WeddingTemplatePreset {
    id: string;
    user_id: string;
    name: string;
    template_id: string;
    description?: string;
    preset_data: Record<string, unknown>;
    created_at?: string;
}

export interface BuilderSectionBlock {
    id: string;
    name: string;
    description: string;
    apply: (current: BuilderPresetSource) => Partial<BuilderPresetSource>;
}

export type BuilderPresetSource = Record<string, unknown> & {
    template?: string;
    motifColor?: string;
    fontStyle?: string;
    backgroundStyle?: string;
    dressCode?: string;
    dressCodeColor?: string;
    quote?: string;
    story?: string;
    programTimeline?: string;
    logoInitials?: string;
    logoFont?: string;
    logoShape?: string;
    logoColor?: string;
    registryLinks?: Array<{ title: string; url: string }>;
    paymentLinks?: Array<{ title: string; url: string }>;
    isThankYouMode?: boolean;
    thankYouMessage?: string;
    photoAlbumLink?: string;
};

const SESSION_KEY = 'quickweds_analytics_session';

function getAnalyticsSessionId() {
    if (typeof window === 'undefined') return 'server-session';

    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
}

export const CURATED_TEMPLATE_PRESETS: Array<{
    id: string;
    name: string;
    description: string;
    template: string;
    preset: Record<string, unknown>;
}> = [
    {
        id: 'editorial-luxe',
        name: 'Editorial Luxe',
        description: 'Bold contrast, fashion-forward typography, and a premium dark palette.',
        template: 'editorial',
        preset: {
            template: 'editorial',
            motifColor: '#8E5C4D',
            fontStyle: 'VogueEdit',
            backgroundStyle: 'minimal',
            logoShape: 'square',
            logoFont: 'Lavish',
            quote: 'Where elegance meets intention, every detail becomes part of the story.',
            story: 'We wanted our invitation to feel like the opening spread of a magazine issue dedicated to our love story.',
        },
    },
    {
        id: 'garden-weekend',
        name: 'Garden Weekend',
        description: 'Soft romantic styling for outdoor ceremonies and intimate weekend celebrations.',
        template: 'garden',
        preset: {
            template: 'garden',
            motifColor: '#7A9A7E',
            fontStyle: 'Fairytale',
            backgroundStyle: 'linen',
            logoShape: 'circle',
            logoFont: 'SoftScript',
            quote: 'Meet us where the light is soft, the flowers are in bloom, and love feels easy.',
            story: 'A celebration designed for lingering conversations, fresh air, and a slow beautiful day with our favorite people.',
        },
    },
    {
        id: 'minimal-city',
        name: 'Modern City',
        description: 'A pared-back preset for contemporary venues and clean, structured storytelling.',
        template: 'minimal',
        preset: {
            template: 'minimal',
            motifColor: '#2F4B56',
            fontStyle: 'ModernGrotesk',
            backgroundStyle: 'white',
            logoShape: 'minimal',
            logoFont: 'ModernGrotesk',
            quote: 'Simple lines. Strong feeling. One unforgettable evening.',
            story: 'We built this invitation to feel clear, modern, and effortless, just like the celebration we are planning.',
        },
    },
];

export const SECTION_BLOCK_LIBRARY: BuilderSectionBlock[] = [
    {
        id: 'timeline-ceremony-flow',
        name: 'Ceremony Flow',
        description: 'Prefills a polished event timeline block.',
        apply: () => ({
            programTimeline: [
                '3:00 PM - Guest arrival and welcome refreshments',
                '4:00 PM - Ceremony begins',
                '5:00 PM - Cocktail hour and portraits',
                '6:30 PM - Dinner service',
                '8:00 PM - Toasts and first dance',
                '9:00 PM - Open dance floor and late-night treats',
            ].join('\n'),
        }),
    },
    {
        id: 'story-love-note',
        name: 'Love Note',
        description: 'Adds a warm story block and headline quote.',
        apply: () => ({
            quote: 'Every detail of this day carries a piece of our story.',
            story: 'From our first conversation to this celebration, we have been building a life rooted in warmth, humor, and deep friendship. We are grateful to share this chapter with the people who shaped it.',
        }),
    },
    {
        id: 'registry-hybrid',
        name: 'Registry Starter',
        description: 'Sets up a balanced registry and celebration fund layout.',
        apply: (current) => ({
            registryLinks: current.registryLinks?.length ? current.registryLinks : [
                { title: 'Our Registry', url: 'https://example.com/registry' },
            ],
            paymentLinks: current.paymentLinks?.length ? current.paymentLinks : [
                { title: 'PayPal', url: 'https://example.com/paypal' },
            ],
        }),
    },
    {
        id: 'thank-you-gallery',
        name: 'Thank You Gallery',
        description: 'Adds a polished post-wedding thank-you block.',
        apply: () => ({
            isThankYouMode: true,
            thankYouMessage: 'Thank you for celebrating with us. Your presence, prayers, and love made the day unforgettable.',
            photoAlbumLink: 'https://photos.example.com/our-wedding',
        }),
    },
];

export async function trackWeddingEvent(
    weddingId: string,
    eventType: string,
    metadata: Record<string, unknown> = {}
) {
    try {
        const sessionId = getAnalyticsSessionId();
        const source = typeof metadata.source === 'string' ? metadata.source : 'direct';

        await supabase.from('wedding_analytics_events').insert({
            wedding_id: weddingId,
            event_type: eventType,
            source,
            session_id: sessionId,
            referrer: typeof document !== 'undefined' ? document.referrer : null,
            metadata,
        });
    } catch (error) {
        console.warn('Analytics tracking unavailable:', error);
    }
}

export async function getWeddingAnalyticsSummary(weddingId: string, rsvpCount: number): Promise<WeddingAnalyticsSummary> {
    const emptySummary: WeddingAnalyticsSummary = {
        totalVisits: 0,
        uniqueVisitors: 0,
        qrScans: 0,
        rsvpConversionRate: 0,
        shareActions: 0,
        remindersSent: 0,
        reminderRecipients: 0,
        reminderResponses: 0,
        sourceBreakdown: [],
    };

    try {
        const [eventsRes, remindersRes, reminderRsvpRes] = await Promise.all([
            supabase.from('wedding_analytics_events').select('*').eq('wedding_id', weddingId),
            supabase.from('wedding_reminders').select('*').eq('wedding_id', weddingId).order('sent_at', { ascending: false }),
            supabase.from('rsvps').select('created_at').eq('wedding_id', weddingId).order('created_at', { ascending: false }),
        ]);

        const events = eventsRes.data || [];
        const reminders = remindersRes.data || [];
        const reminderRsvps = reminderRsvpRes.data || [];

        const visitEvents = events.filter((event) => event.event_type === 'visit');
        const sourceBreakdownMap = visitEvents.reduce<Record<string, number>>((acc, event) => {
            const key = event.source || 'direct';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const lastReminderAt = reminders[0]?.sent_at ? new Date(reminders[0].sent_at).getTime() : null;
        const reminderResponses = lastReminderAt
            ? reminderRsvps.filter((entry) => new Date(entry.created_at).getTime() > lastReminderAt).length
            : 0;

        const uniqueVisitors = new Set(visitEvents.map((event) => event.session_id).filter(Boolean)).size;
        const totalVisits = visitEvents.length;

        return {
            totalVisits,
            uniqueVisitors,
            qrScans: events.filter((event) => event.event_type === 'qr_scan').length,
            rsvpConversionRate: uniqueVisitors > 0 ? Math.round((rsvpCount / uniqueVisitors) * 100) : 0,
            shareActions: events.filter((event) => event.event_type.startsWith('share_')).length,
            remindersSent: reminders.length,
            reminderRecipients: reminders.reduce((acc, reminder) => acc + (reminder.recipient_count || 0), 0),
            reminderResponses,
            sourceBreakdown: Object.entries(sourceBreakdownMap).map(([name, value]) => ({ name, value })),
        };
    } catch (error) {
        console.warn('Analytics summary unavailable:', error);
        return emptySummary;
    }
}

export async function listWeddingCollaborators(weddingId: string): Promise<WeddingCollaborator[]> {
    try {
        const { data, error } = await supabase
            .from('wedding_collaborators')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.warn('Collaborators unavailable:', error);
        return [];
    }
}

export async function inviteWeddingCollaborator(input: {
    weddingId: string;
    email: string;
    role: CollaboratorRole;
    invitedByUserId: string;
}) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const { data, error } = await supabase
        .from('wedding_collaborators')
        .upsert({
            wedding_id: input.weddingId,
            email: normalizedEmail,
            role: input.role,
            status: 'pending',
            invited_by_user_id: input.invitedByUserId,
        }, {
            onConflict: 'wedding_id,email',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function acceptWeddingInvite(collaboratorId: string) {
    const { data, error } = await supabase
        .from('wedding_collaborators')
        .update({ status: 'accepted' })
        .eq('id', collaboratorId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function removeWeddingCollaborator(collaboratorId: string) {
    const { error } = await supabase
        .from('wedding_collaborators')
        .delete()
        .eq('id', collaboratorId);

    if (error) throw error;
}

export async function getWeddingCollaboratorAccess(weddingId: string, email?: string | null) {
    if (!email) return null;

    try {
        const { data, error } = await supabase
            .from('wedding_collaborators')
            .select('*')
            .eq('wedding_id', weddingId)
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (error) throw error;
        return data as WeddingCollaborator | null;
    } catch (error) {
        console.warn('Collaborator access check unavailable:', error);
        return null;
    }
}

export async function listSharedWeddings(email?: string | null) {
    if (!email) return [];

    try {
        const { data: invites, error: inviteError } = await supabase
            .from('wedding_collaborators')
            .select('*')
            .eq('email', email.toLowerCase())
            .order('created_at', { ascending: false });

        if (inviteError) throw inviteError;
        if (!invites?.length) return [];

        const weddingIds = invites.map((invite) => invite.wedding_id);
        const { data: weddings, error: weddingError } = await supabase
            .from('weddings')
            .select('id, bride_name, groom_name, wedding_date, venue_name, hero_image, template')
            .in('id', weddingIds);

        if (weddingError) throw weddingError;

        return invites.map((invite) => ({
            ...invite,
            wedding: (weddings || []).find((wedding) => wedding.id === invite.wedding_id),
        }));
    } catch (error) {
        console.warn('Shared weddings unavailable:', error);
        return [];
    }
}

export async function listTemplatePresets(userId?: string | null): Promise<WeddingTemplatePreset[]> {
    if (!userId) return [];

    try {
        const { data, error } = await supabase
            .from('wedding_template_presets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.warn('Template presets unavailable:', error);
        return [];
    }
}

export async function saveTemplatePreset(input: {
    userId: string;
    name: string;
    templateId: string;
    description?: string;
    presetData: Record<string, unknown>;
}) {
    const { data, error } = await supabase
        .from('wedding_template_presets')
        .insert({
            user_id: input.userId,
            name: input.name,
            template_id: input.templateId,
            description: input.description || null,
            preset_data: input.presetData,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteTemplatePreset(presetId: string) {
    const { error } = await supabase
        .from('wedding_template_presets')
        .delete()
        .eq('id', presetId);

    if (error) throw error;
}

export function buildPresetPayload(formData: BuilderPresetSource) {
    return {
        template: formData.template,
        motifColor: formData.motifColor,
        fontStyle: formData.fontStyle,
        backgroundStyle: formData.backgroundStyle,
        dressCode: formData.dressCode,
        dressCodeColor: formData.dressCodeColor,
        quote: formData.quote,
        story: formData.story,
        programTimeline: formData.programTimeline,
        logoInitials: formData.logoInitials,
        logoFont: formData.logoFont,
        logoShape: formData.logoShape,
        logoColor: formData.logoColor,
        registryLinks: formData.registryLinks,
        paymentLinks: formData.paymentLinks,
        isThankYouMode: formData.isThankYouMode,
        thankYouMessage: formData.thankYouMessage,
        photoAlbumLink: formData.photoAlbumLink,
    };
}
