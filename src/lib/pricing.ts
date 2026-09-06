export const DEFAULT_PLANNER_PRO_PRICE_PHP = 899;

const parsePrice = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const PRICING = {
    ACCOUNT_PRO_PRICE: parsePrice(
        process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_PRO_PRICE || process.env.STRIPE_ACCOUNT_PRO_PRICE,
        DEFAULT_PLANNER_PRO_PRICE_PHP
    ),
    PLANNER_PRO_PRICE: parsePrice(
        process.env.NEXT_PUBLIC_STRIPE_PLANNER_PRO_PRICE || process.env.STRIPE_PLANNER_PRO_PRICE,
        DEFAULT_PLANNER_PRO_PRICE_PHP
    ),
    PREMIUM_PRICE: parsePrice(
        process.env.NEXT_PUBLIC_STRIPE_PLANNER_PRO_PRICE || process.env.STRIPE_PLANNER_PRO_PRICE,
        DEFAULT_PLANNER_PRO_PRICE_PHP
    ),
    ELITE_PRICE: parsePrice(
        process.env.NEXT_PUBLIC_STRIPE_PLANNER_PRO_PRICE || process.env.STRIPE_PLANNER_PRO_PRICE,
        DEFAULT_PLANNER_PRO_PRICE_PHP
    ),
    CURRENCY: 'php',
    CURRENCY_CODE: 'PHP',
    CURRENCY_SYMBOL: '₱',
} as const;

export function formatPrice(amount: number = PRICING.PLANNER_PRO_PRICE): string {
    return `₱${amount.toLocaleString('en-PH')}`;
}
