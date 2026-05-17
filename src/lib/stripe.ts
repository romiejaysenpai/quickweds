import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        throw new Error('STRIPE_SECRET_KEY is missing');
    }

    if (!stripeClient) {
        stripeClient = new Stripe(stripeKey, {
            apiVersion: '2025-02-24.acacia',
        });
    }

    return stripeClient;
}

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
