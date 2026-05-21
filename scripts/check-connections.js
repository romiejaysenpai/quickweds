const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe').default || require('stripe');
const { Resend } = require('resend');
const cloudinary = require('cloudinary').v2;

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function checkConnections() {
    console.log('Testing connections based on .env.local...\n');

    // 1. Supabase
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error('Supabase URL or Key missing in .env.local');
        const supabase = createClient(url, key);
        // We do a simple query to a table that probably exists, or just checking auth health
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log('✅ Supabase: Connected successfully');
    } catch (e) {
        console.log('❌ Supabase: Failed -', e.message);
    }

    // 2. Stripe
    try {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) throw new Error('STRIPE_SECRET_KEY missing in .env.local');
        const stripe = new Stripe(stripeKey);
        // A safe call to verify auth
        await stripe.balance.retrieve();
        console.log('✅ Stripe: Connected successfully');
    } catch (e) {
        console.log('❌ Stripe: Failed -', e.message);
    }

    // 3. Resend
    try {
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) throw new Error('RESEND_API_KEY missing in .env.local');
        const resend = new Resend(resendKey);
        // Try listing domains to verify API key is valid
        const response = await resend.domains.list();
        if (response.error) throw response.error;
        console.log('✅ Resend: Connected successfully');
    } catch (e) {
        console.log('❌ Resend: Failed -', e.message);
    }

    // 4. Cloudinary
    try {
        const cUrl = process.env.CLOUDINARY_URL;
        if (!cUrl) throw new Error('CLOUDINARY_URL missing in .env.local');
        // Cloudinary will pick up process.env.CLOUDINARY_URL automatically if we let it
        const res = await cloudinary.api.ping();
        console.log('✅ Cloudinary: Connected successfully');
    } catch (e) {
        console.log('❌ Cloudinary: Failed -', e.message);
    }
    
    // 5. Sentry
    try {
        if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
             throw new Error('SENTRY_DSN missing in .env.local');
        }
        console.log('✅ Sentry: Config found (DSN is set)');
    } catch (e) {
        console.log('❌ Sentry: Failed -', e.message);
    }
    
    console.log('\nDone checking connections.');
}

checkConnections().catch(console.error);
