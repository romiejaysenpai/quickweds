export const SUPPORTED_CURRENCY_CODES = [
    'USD',
    'CAD',
    'AUD',
    'NZD',
    'GBP',
    'EUR',
    'PHP',
    'JPY',
    'SGD',
    'INR',
] as const;

export type SupportedCurrencyCode = typeof SUPPORTED_CURRENCY_CODES[number];

type CurrencyMeta = {
    code: SupportedCurrencyCode;
    label: string;
    symbol: string;
    locale: string;
};

const CURRENCY_META: Record<SupportedCurrencyCode, Omit<CurrencyMeta, 'code'>> = {
    USD: { label: 'US Dollar', symbol: '$', locale: 'en-US' },
    CAD: { label: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
    AUD: { label: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
    NZD: { label: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ' },
    GBP: { label: 'British Pound', symbol: '\u00a3', locale: 'en-GB' },
    EUR: { label: 'Euro', symbol: '\u20ac', locale: 'de-DE' },
    PHP: { label: 'Philippine Peso', symbol: '\u20b1', locale: 'en-PH' },
    JPY: { label: 'Japanese Yen', symbol: '\u00a5', locale: 'ja-JP' },
    SGD: { label: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
    INR: { label: 'Indian Rupee', symbol: '\u20b9', locale: 'en-IN' },
};

const CURRENCY_ALIASES: Record<string, SupportedCurrencyCode> = {
    dollar: 'USD',
    dollars: 'USD',
    peso: 'PHP',
    pesos: 'PHP',
    yen: 'JPY',
};

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = SUPPORTED_CURRENCY_CODES.map((code) => ({
    code,
    ...CURRENCY_META[code],
}));

export function getSupportedCurrencyCode(currency?: string | null): SupportedCurrencyCode | null {
    const rawValue = String(currency || '').trim();
    if (!rawValue) return null;

    const upperValue = rawValue.toUpperCase();
    if ((SUPPORTED_CURRENCY_CODES as readonly string[]).includes(upperValue)) {
        return upperValue as SupportedCurrencyCode;
    }

    return CURRENCY_ALIASES[rawValue.toLowerCase()] || null;
}

export function normalizeCurrencyCode(currency?: string | null, fallback: SupportedCurrencyCode = 'USD') {
    return getSupportedCurrencyCode(currency) || fallback;
}

export function getCurrencyMeta(currency?: string | null) {
    const code = normalizeCurrencyCode(currency);
    return {
        code,
        ...CURRENCY_META[code],
    };
}

export function getCurrencySymbol(currency?: string | null) {
    return getCurrencyMeta(currency).symbol;
}

export function formatCurrencyAmount(
    amount: number,
    currency?: string | null,
    options: Intl.NumberFormatOptions = {},
) {
    const meta = getCurrencyMeta(currency);
    return new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency: meta.code,
        maximumFractionDigits: 0,
        ...options,
    }).format(Number.isFinite(amount) ? amount : 0);
}
