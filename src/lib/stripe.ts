import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
});

export const PRICING = {
    PREMIUM_PRICE: 14.99,
    ELITE_PRICE: 59.00,
    CURRENCY: 'usd',
} as const;
