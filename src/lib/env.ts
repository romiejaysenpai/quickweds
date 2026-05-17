import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, 'Invalid Supabase anon key'),

    STRIPE_SECRET_KEY: z.string().min(10, 'Invalid Stripe secret key'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Stripe webhook secret must start with whsec_').optional(),
    STRIPE_PUBLIC_KEY: z.string().startsWith('pk_', 'Stripe publishable key must start with pk_').optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Stripe publishable key must start with pk_').optional(),

    RESEND_API_KEY: z.string().min(10, 'Invalid Resend API key'),
    RESEND_FROM_EMAIL: z.string().min(5, 'Invalid from email'),
    RESEND_COUPLE_TEMPLATE_ID: z.string().optional(),

    CLOUDINARY_URL: z.string().startsWith('cloudinary://', 'Invalid Cloudinary URL').optional(),

    VERCEL_PROJECT_ID: z.string().optional(),
    VERCEL_TOKEN: z.string().optional(),

    NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').optional(),
    NEXT_PUBLIC_ROOT_DOMAIN: z.string().optional(),
    GOOGLE_CALENDAR_CLIENT_ID: z.string().optional(),
    GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional(),
    GOOGLE_OAUTH_STATE_SECRET: z.string().optional(),

    ADMIN_EMAIL: z.string().email('Invalid admin email').optional(),
    ADMIN_EMAILS: z.string().optional(),
    SUPPLIER_REVIEW_SECRET: z.string().min(32, 'Supplier review secret should be at least 32 characters').optional(),
    SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url('Invalid public Sentry DSN').optional(),
    GHL_SIGNUP_WEBHOOK_URL: z.string().url('Invalid GHL signup webhook URL').optional(),
});

export function validateEnv() {
    const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        RESEND_COUPLE_TEMPLATE_ID: process.env.RESEND_COUPLE_TEMPLATE_ID,
        CLOUDINARY_URL: process.env.CLOUDINARY_URL,
        VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
        VERCEL_TOKEN: process.env.VERCEL_TOKEN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        GOOGLE_CALENDAR_CLIENT_ID: process.env.GOOGLE_CALENDAR_CLIENT_ID,
        GOOGLE_CALENDAR_CLIENT_SECRET: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        GOOGLE_OAUTH_STATE_SECRET: process.env.GOOGLE_OAUTH_STATE_SECRET,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_EMAILS: process.env.ADMIN_EMAILS,
        SUPPLIER_REVIEW_SECRET: process.env.SUPPLIER_REVIEW_SECRET,
        SENTRY_DSN: process.env.SENTRY_DSN,
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        GHL_SIGNUP_WEBHOOK_URL: process.env.GHL_SIGNUP_WEBHOOK_URL,
    };

    const result = envSchema.safeParse(envVars);

    if (!result.success) {
        console.error('Invalid environment variables:');
        result.error.issues.forEach((err) => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        console.error('\nPlease check your environment variables against .env.example');
        throw new Error('Environment validation failed');
    }

    console.log('Environment variables validated successfully');
    return result.data;
}
