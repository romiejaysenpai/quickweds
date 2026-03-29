export interface Wedding {
    id: string;
    user_id: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string;
    wedding_time: string;
    venue_name: string;
    venue_address?: string;
    maps_link?: string;
    story?: string;
    quote?: string;
    hero_image?: string;
    couple_photo?: string;
    teaser_video?: string;
    gallery_images?: string | string[];
    custom_domain?: string;
    template: string;
    font_style: string;
    motif_color: string;
    dress_code?: string;
    contact_person?: string;
    hashtag?: string;
    rsvp_deadline: string;
    program_timeline?: string;
    // Monogram / Logo
    logo_initials?: string;
    logo_shape?: 'circle' | 'square' | 'minimal';
    logo_color?: string;
    logo_font?: string;
    // Gift
    gift_bank?: string;
    gift_account_name?: string;
    gift_account_number?: string;
    gift_qr_image?: string;
    gift_registry_links?: string | any[];
    cash_funds?: string | any[];
    payment_links?: string | any[];
    // Premium
    is_premium: boolean;
    payment_status?: string;
    payment_amount?: number;
    stripe_payment_intent_id?: string;
    plan_type?: string;
    // Wedding party
    wedding_party?: string | any[];
    spotify_playlist_url?: string;
    // Mode
    is_save_the_date?: boolean;
    is_thank_you_mode?: boolean;
    thank_you_message?: string;
    photo_album_link?: string;
    couple_email?: string; // Notification email for the couple
    // Metadata
    created_at: string;
    updated_at?: string;
}

export interface RSVP {
    id: string;
    wedding_id: string;
    guest_name: string;
    guest_email?: string; // Email for confirmation
    attendance: 'Yes' | 'No';
    num_guests: number;
    meal_preference?: string;
    dietary_details?: string;
    message?: string;
    plus_one_names?: string;
    song_request?: string;
    children_count?: number;
    created_at: string;
}

export interface GuestBookEntry {
    id: string;
    wedding_id: string;
    guest_name: string;
    message: string;
    photo_url?: string;
    created_at: string;
}

export interface WeddingPartyMember {
    name: string;
    role: string;
    bio?: string;
    photo?: string;
}

export interface GiftRegistryLink {
    label: string;
    url: string;
}

export interface CashFund {
    label: string;
    goal: number;
    current: number;
}

export interface PaymentLink {
    type: 'PayPal' | 'Venmo' | 'GCash' | 'Maya' | 'Other';
    url: string;
    label?: string;
}

export interface TemplateProps {
    wedding: Wedding;
    gallery: string[];
    isExpired: boolean;
}

export interface SectionProps {
    wedding: Wedding;
    invert?: boolean;
}
