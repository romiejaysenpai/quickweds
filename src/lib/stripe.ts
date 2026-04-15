import Stripe from 'stripe';

// Initialize Stripe with strict checking
// We use a fallback to prevent build-time errors if env vars aren't present
// The API routes will perform their own checks before using the client
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia',
});

export const PRICING = {
    PREMIUM_PRICE: 14.99,
    ELITE_PRICE: 59.00,
    CURRENCY: 'usd',
} as const;
