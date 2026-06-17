export type PhotoPortalSettings = {
    disposable_camera_enabled: boolean;
    reveal_datetime: string | null;
    guest_name_required: boolean;
    allow_anonymous_uploads: boolean;
    require_approval: boolean;
    photo_limit_per_guest: number;
    film_frame_enabled: boolean;
    nostalgic_ui_enabled: boolean;
    date_stamp_enabled: boolean;
    enabled_filter_ids: string[];
};

export const DEFAULT_PHOTO_FILTER_IDS = [
    'none',
    'soft-film',
    'warm-vintage',
    'black-white',
    'romantic-glow',
    'polaroid-fade',
    'golden-hour',
    'classic-disposable',
] as const;

export const DEFAULT_PHOTO_PORTAL_SETTINGS: PhotoPortalSettings = {
    disposable_camera_enabled: false,
    reveal_datetime: null,
    guest_name_required: false,
    allow_anonymous_uploads: true,
    require_approval: true,
    photo_limit_per_guest: 3,
    film_frame_enabled: false,
    nostalgic_ui_enabled: false,
    date_stamp_enabled: false,
    enabled_filter_ids: [...DEFAULT_PHOTO_FILTER_IDS],
};

export function normalizePhotoPortalSettings(row?: Partial<PhotoPortalSettings> | null): PhotoPortalSettings {
    return {
        disposable_camera_enabled: Boolean(row?.disposable_camera_enabled),
        reveal_datetime: row?.reveal_datetime || null,
        guest_name_required: Boolean(row?.guest_name_required),
        allow_anonymous_uploads: row?.allow_anonymous_uploads !== false,
        require_approval: row?.require_approval !== false,
        photo_limit_per_guest: Math.min(50, Math.max(1, Number(row?.photo_limit_per_guest || 3))),
        film_frame_enabled: Boolean(row?.film_frame_enabled),
        nostalgic_ui_enabled: Boolean(row?.nostalgic_ui_enabled),
        date_stamp_enabled: Boolean(row?.date_stamp_enabled),
        enabled_filter_ids: Array.isArray(row?.enabled_filter_ids) && row.enabled_filter_ids.length > 0
            ? row.enabled_filter_ids.filter((value): value is string => typeof value === 'string')
            : [...DEFAULT_PHOTO_FILTER_IDS],
    };
}

export function isGalleryHiddenByReveal(settings?: PhotoPortalSettings | null, now = new Date()) {
    if (!settings?.disposable_camera_enabled || !settings.reveal_datetime) return false;
    const revealDate = new Date(settings.reveal_datetime);
    return Number.isFinite(revealDate.getTime()) && revealDate.getTime() > now.getTime();
}

export function isSchemaMissingError(error: any) {
    const text = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return (
        text.includes('schema cache') ||
        text.includes('does not exist') ||
        text.includes('could not find') ||
        text.includes('column') ||
        error?.code === 'PGRST204' ||
        error?.code === 'PGRST205' ||
        error?.code === '42P01' ||
        error?.code === '42703'
    );
}

export async function getPhotoPortalSettings(db: any, weddingId: string): Promise<PhotoPortalSettings> {
    const result = await db
        .from('photo_portal_settings')
        .select('disposable_camera_enabled, reveal_datetime, guest_name_required, allow_anonymous_uploads, require_approval, photo_limit_per_guest, film_frame_enabled, nostalgic_ui_enabled, date_stamp_enabled, enabled_filter_ids')
        .eq('wedding_id', weddingId)
        .maybeSingle();

    if (result.error) {
        if (isSchemaMissingError(result.error)) return DEFAULT_PHOTO_PORTAL_SETTINGS;
        throw result.error;
    }

    return normalizePhotoPortalSettings(result.data);
}
