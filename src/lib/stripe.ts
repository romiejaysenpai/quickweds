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

export { PRICING, formatPrice, DEFAULT_PLANNER_PRO_PRICE_PHP } from './pricing';
