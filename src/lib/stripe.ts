import Stripe from 'stripe';

// Initialize Stripe with strict checking
// We use a fallback to prevent build-time errors if env vars aren't present
// The API routes will perform their own checks before using the client
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia',
});

const parsePrice = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const PRICING = {
    PLANNER_PRO_PRICE: parsePrice(process.env.STRIPE_PLANNER_PRO_PRICE, 29),
    PREMIUM_PRICE: parsePrice(process.env.STRIPE_PLANNER_PRO_PRICE, 29),
    ELITE_PRICE: parsePrice(process.env.STRIPE_PLANNER_PRO_PRICE, 29),
    CURRENCY: 'usd',
} as const;
