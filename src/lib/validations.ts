import { z } from 'zod';

// Stripe Checkout Validation
export const checkoutSchema = z.object({
    weddingId: z.string().uuid('Invalid wedding ID format'),
    plan: z.enum(['premium', 'elite']).default('premium'),
});

// Stripe Webhook - raw body validation for signature verification
export const webhookSchema = z.object({
    type: z.string(),
    data: z.object({
        object: z.object({
            id: z.string(),
            metadata: z.object({
                weddingId: z.string().uuid().optional(),
                plan: z.string().optional(),
            }).optional(),
            amount_total: z.number().optional(),
            payment_intent: z.string().optional(),
        }),
    }),
});

// Wedding Reminder Validation
export const reminderSchema = z.object({
    weddingId: z.string().min(1, 'Wedding ID is required'),
    targetStatus: z.enum(['pending', 'confirmed', 'declined']).default('pending'),
});

// Domain Management Validation
export const domainSchema = z.object({
    domain: z.string().min(1, 'Domain is required').regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, 'Invalid domain format'),
});

// RSVP Notification Validation
export const rsvpNotifySchema = z.object({
    weddingId: z.string().min(1, 'Wedding ID is required'),
    guestName: z.string().min(1, 'Guest name is required').max(200),
    guestEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    attendance: z.enum(['Yes', 'No', 'Maybe']),
    numGuests: z.coerce.number().int().min(1).max(50).optional().default(1),
    message: z.string().max(2000).optional().default(''),
    dietaryDetails: z.string().max(1000).optional().default(''),
    songRequest: z.string().max(500).optional().default(''),
    plusOneNames: z.string().max(1000).optional().default(''),
    childrenCount: z.coerce.number().int().min(0).max(20).optional().default(0),
});

// Wedding Builder Validation (partial - core fields)
export const weddingBuilderSchema = z.object({
    brideName: z.string().min(1, 'Bride name is required').max(200),
    groomName: z.string().min(1, 'Groom name is required').max(200),
    weddingDate: z.string(),
    venueName: z.string().max(500).optional(),
    venueAddress: z.string().max(1000).optional(),
    template: z.string().max(100).optional(),
    isPremium: z.boolean().optional().default(false),
    totalBudget: z.coerce.number().min(0).optional().default(0),
    currency: z.enum(['USD', 'PHP', 'JPY', 'EUR', 'GBP']).default('USD'),
    rsvpDeadline: z.string().optional(),
    coupleEmail: z.string().email().optional().or(z.literal('')),
});

// RSVP Submission Validation
export const rsvpSubmissionSchema = z.object({
    weddingId: z.string().min(1, 'Wedding ID is required'),
    guestName: z.string().min(1, 'Guest name is required').max(200),
    guestEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    attendance: z.enum(['Yes', 'No', 'Maybe']),
    numGuests: z.coerce.number().int().min(1).max(50).optional().default(1),
    mealPreference: z.string().max(200).optional(),
    dietaryDetails: z.string().max(1000).optional().default(''),
    songRequest: z.string().max(500).optional().default(''),
    plusOneNames: z.string().max(1000).optional().default(''),
    childrenCount: z.coerce.number().int().min(0).max(20).optional().default(0),
    message: z.string().max(2000).optional().default(''),
});

// Helper function to validate and return error response
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string } {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errorMessages = result.error.issues.map(err => err.message).join(', ');
        return { success: false, errors: errorMessages };
    }

    return { success: true, data: result.data };
}
