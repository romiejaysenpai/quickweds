export const SUPPLIER_CATEGORIES = [
    'Venue',
    'Catering',
    'Photography',
    'Videography',
    'Florist',
    'Coordination',
    'Hair & Makeup',
    'Attire',
    'Cake & Desserts',
    'Music & Entertainment',
    'Lights & Sounds',
    'Invitation & Stationery',
    'Styling & Decor',
    'Transportation',
    'Jewelry',
    'Other',
] as const;

export const SUPPLIER_PRICE_BANDS = [
    'Budget-friendly',
    'Mid-range',
    'Premium',
    'Luxury',
    'Custom quote',
] as const;

export const PHILIPPINE_SUPPLIER_LOCATIONS = [
    'Metro Manila',
    'Cavite',
    'Laguna',
    'Batangas',
    'Rizal',
    'Bulacan',
    'Pampanga',
    'Cebu',
    'Iloilo',
    'Davao del Sur',
    'Baguio / Benguet',
    'Palawan',
    'Boracay / Aklan',
] as const;

export type SupplierProfileStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'inactive';

export type SupplierProfile = {
    id: string;
    owner_user_id: string | null;
    slug: string;
    business_name: string;
    category: string;
    city: string;
    province: string;
    service_areas: string[] | null;
    summary: string | null;
    description: string | null;
    price_band: string | null;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    website_url: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    cover_image_url: string | null;
    gallery_images: string[] | null;
    status: SupplierProfileStatus;
    is_featured: boolean | null;
    is_active: boolean | null;
    display_order: number | null;
    created_at?: string;
    updated_at?: string;
};

export type SupplierProfileInput = Partial<SupplierProfile> & {
    service_areas?: string[] | string | null;
    gallery_images?: string[] | string | null;
};

export function slugifySupplier(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 70);
}

export function buildSupplierSlug(profile: Pick<SupplierProfileInput, 'business_name' | 'city'>) {
    const base = slugifySupplier(`${profile.business_name || 'supplier'} ${profile.city || ''}`);
    return base || `supplier-${Date.now()}`;
}

export function parseSupplierList(value: string[] | string | null | undefined) {
    if (Array.isArray(value)) {
        return value.map((item) => item.trim()).filter(Boolean);
    }

    if (!value) return [];

    return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export function sanitizeSupplierUrl(value: string | null | undefined) {
    const trimmed = (value || '').trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

export function normalizeSupplierProfileInput(input: SupplierProfileInput) {
    const galleryImages = parseSupplierList(input.gallery_images)
        .map(sanitizeSupplierUrl)
        .filter((url): url is string => Boolean(url));

    return {
        business_name: (input.business_name || '').trim(),
        category: (input.category || 'Other').trim(),
        city: (input.city || '').trim(),
        province: (input.province || '').trim(),
        service_areas: parseSupplierList(input.service_areas),
        summary: (input.summary || '').trim(),
        description: (input.description || '').trim(),
        price_band: (input.price_band || 'Custom quote').trim(),
        phone: (input.phone || '').trim() || null,
        email: (input.email || '').trim().toLowerCase() || null,
        whatsapp: (input.whatsapp || '').trim() || null,
        website_url: sanitizeSupplierUrl(input.website_url),
        instagram_url: sanitizeSupplierUrl(input.instagram_url),
        facebook_url: sanitizeSupplierUrl(input.facebook_url),
        cover_image_url: sanitizeSupplierUrl(input.cover_image_url),
        gallery_images: galleryImages,
    };
}

export function supplierStatusLabel(status?: SupplierProfileStatus | null) {
    switch (status) {
        case 'approved':
            return 'Approved';
        case 'pending_review':
            return 'Pending approval';
        case 'rejected':
            return 'Needs changes';
        case 'inactive':
            return 'Inactive';
        default:
            return 'Draft';
    }
}

export function getSupplierDisplayLocation(profile: Pick<SupplierProfile, 'city' | 'province'>) {
    return [profile.city, profile.province].filter(Boolean).join(', ');
}
