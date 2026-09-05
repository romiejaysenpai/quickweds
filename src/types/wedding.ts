export interface Wedding {
    id: string;
    public_slug?: string;
    user_id: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string;
    wedding_time: string;
    event_timezone?: string;
    venue_name: string;
    venue_address?: string;
    maps_link?: string;
    reception_venue_name?: string;
    reception_venue_address?: string;
    reception_maps_link?: string;
    reception_venue_photos?: string[] | string;
    story?: string;
    quote?: string;
    hero_image?: string;
    couple_photo?: string;
    teaser_video?: string;
    gallery_images?: string | string[];
    gallery_layout?: string;
    custom_domain?: string;
    template: string;
    template_style?: string;
    card_style?: string;
    background_style?: string;
    section_title_font_style?: string;
    section_title_color_style?: string;
    font_style: string;
    motif_color: string;
    dress_code?: string;
    contact_person?: string;
    hashtag?: string;
    rsvp_deadline: string;
    rsvp_events?: WeddingRsvpEvent[] | string;
    program_timeline?: string;
    faq_items?: string | unknown[];
    invitation_image?: string; // Opt-in image
    accent_style?: string; // Vector design accent style
    // Monogram / Logo
    logo_initials?: string;
    logo_shape?: string;
    logo_color?: string;
    logo_font?: string;
    logo_animation?: 'none' | 'draw' | 'bloom' | 'shimmer' | 'float' | 'reveal' | string;
    // Gift
    gift_bank?: string;
    gift_account_name?: string;
    gift_account_number?: string;
    gift_qr_image?: string;
    gift_registry_links?: string | unknown[];
    cash_funds?: string | unknown[];
    payment_links?: string | unknown[];
    // Premium
    is_premium: boolean;
    payment_status?: string;
    payment_amount?: number;
    stripe_payment_intent_id?: string;
    plan_type?: string;
    // Wedding party
    wedding_party?: string | unknown[];
    include_entourage_section?: boolean;
    spotify_playlist_url?: string;
    background_music_url?: string;
    background_music_title?: string;
    background_music_enabled?: boolean;
    // Mode
    is_save_the_date?: boolean;
    is_thank_you_mode?: boolean;
    thank_you_message?: string;
    photo_album_link?: string;
    voice_greeting_url?: string;
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
    rsvp_status?: 'pending' | 'confirmed' | 'declined';
    guest_group?:
        | 'bride_family'
        | 'groom_family'
        | 'bride_friends'
        | 'groom_friends'
        | 'mutual'
        | 'coworkers'
        | 'vip'
        | 'vendors';
    table_assignment?: string;
    invitation_sent?: boolean;
    invitation_sent_at?: string;
    plus_one_allowed?: boolean;
    plus_one_name?: string;
    plus_one_email?: string;
    plus_one_rsvp_status?: 'not_invited' | 'invited' | 'confirmed' | 'declined';
    manual_entry?: boolean;
    meal_preference?: string;
    dietary_details?: string;
    message?: string;
    plus_one_names?: string;
    song_request?: string;
    children_count?: number;
    household_name?: string;
    household_members?: string[];
    event_responses?: RsvpEventResponse[];
    created_at: string;
}

export interface WeddingRsvpEvent {
    id: string;
    name: string;
    date?: string;
    time?: string;
    venue?: string;
    description?: string;
}

export interface RsvpEventResponse {
    eventId: string;
    attendance: 'Yes' | 'No' | 'Maybe';
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
    memberKey?: string;
    id?: string;
    name: string;
    role: string;
    bio?: string;
    email?: string;
    proposalTemplateKey?: 'heartfelt' | 'elegant' | 'simple' | 'playful' | 'formal';
    proposalMessage?: string;
    proposalCardTheme?: 'classic' | 'blush' | 'emerald' | 'midnight' | 'gold';
    proposalTitle?: string;
    /** Optional image shown in the header of this member's proposal email. */
    proposalHeroImage?: string;
    requestAttireSize?: boolean;
    requestDietaryNotes?: boolean;
    requestPhoneNumber?: boolean;
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
