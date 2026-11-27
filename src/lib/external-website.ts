import { z } from 'zod';

import { normalizeExternalWebsiteUrl } from '@/lib/url-safety';
export { normalizeExternalWebsiteUrl } from '@/lib/url-safety';

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Enter a valid date.');

export const externalWebsiteConnectionSchema = z.object({
    weddingId: z.string().min(1).max(100),
    externalWebsiteUrl: z.string().trim().max(2048).refine(value => !value || Boolean(normalizeExternalWebsiteUrl(value)), 'Enter a full https:// website address.'),
    rsvpPageEnabled: z.boolean(),
    brideName: z.string().trim().min(1).max(100),
    groomName: z.string().trim().min(1).max(100),
    weddingDate: z.union([day, z.literal('')]),
    weddingTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/).or(z.literal('')),
    venueName: z.string().trim().max(300),
    rsvpDeadline: z.union([day, z.literal('')]),
    motifColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    heroImage: z
        .string()
        .trim()
        .max(2048)
        .refine(value => !value || Boolean(normalizeExternalWebsiteUrl(value)), 'Use a valid https:// photo URL.')
        .optional(),
}).superRefine((value, context) => {
    if (!value.rsvpPageEnabled) return;
    if (!value.externalWebsiteUrl || !value.weddingDate || !value.rsvpDeadline) {
        context.addIssue({ code: 'custom', message: 'Add your website, wedding date and RSVP deadline before publishing.' });
    }
    if (value.weddingDate && value.rsvpDeadline && value.rsvpDeadline > value.weddingDate) {
        context.addIssue({ code: 'custom', message: 'The RSVP deadline must be on or before your wedding date.' });
    }
});
