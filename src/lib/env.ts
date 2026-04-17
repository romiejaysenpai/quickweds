import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
    // Required: Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, 'Invalid Supabase anon key'),

    // Required: Stripe
    STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Stripe secret key must start with sk_'),

    // Optional but recommended
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Stripe webhook secret must start with whsec_').optional(),
    STRIPE_PUBLIC_KEY: z.string().startsWith('pk_', 'Stripe publishable key must start with pk_').optional(),

    // Required: Resend
    RESEND_API_KEY: z.string().min(10, 'Invalid Resend API key'),
    RESEND_FROM_EMAIL: z.string().min(5, 'Invalid from email'),

    // Optional: Cloudinary
    CLOUDINARY_URL: z.string().startsWith('cloudinary://', 'Invalid Cloudinary URL').optional(),

    // Optional: Vercel
    VERCEL_PROJECT_ID: z.string().optional(),
    VERCEL_TOKEN: z.string().optional(),

    // Optional: Application URLs
    NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').optional(),
    NEXT_PUBLIC_ROOT_DOMAIN: z.string().optional(),

    // Optional: Admin email
    ADMIN_EMAIL: z.string().email('Invalid admin email').optional(),
    NEXT_PUBLIC_ADMIN_EMAIL: z.string().email('Invalid public admin email').optional(),

    // Optional: Email templates
    RESEND_COUPLE_TEMPLATE_ID: z.string().optional(),
});

export function validateEnv() {
    const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        CLOUDINARY_URL: process.env.CLOUDINARY_URL,
        VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
        VERCEL_TOKEN: process.env.VERCEL_TOKEN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        RESEND_COUPLE_TEMPLATE_ID: process.env.RESEND_COUPLE_TEMPLATE_ID,
    };

    const result = envSchema.safeParse(envVars);

    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        result.error.issues.forEach((err) => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        console.error('\n📝 Please check your .env.local file against .env.example');
        throw new Error('Environment validation failed');
    }

    console.log('✅ Environment variables validated successfully');
    return result.data;
}
