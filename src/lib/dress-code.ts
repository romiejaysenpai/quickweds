export type AttirePreference = {
    attire: string;
    color: string;
    colors?: string[];
    dressColor?: string;
    suitColor?: string;
    notes?: string;
};

export type DressCodeSettings = {
    sponsors: AttirePreference;
    guests: AttirePreference;
    bridesmaids?: AttirePreference;
};

type SerializedDressCode = {
    v: 2 | 3;
    sponsors: AttirePreference;
    guests: AttirePreference;
    bridesmaids?: AttirePreference;
};

const DEFAULT_COLOR = '#D16C78';
const DEFAULT_SUIT_COLOR = '#1D2330';
const DEFAULT_ATTIRE = 'Formal Attire';

function normalizeColor(value: unknown, fallback: string) {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim();
    return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : fallback;
}

function normalizeColorList(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) return fallback;
    const cleaned = value
        .map((c) => (typeof c === 'string' ? c.trim() : ''))
        .filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
    return cleaned.length > 0 ? cleaned : fallback;
}

function normalizeAttire(value: unknown, fallback = DEFAULT_ATTIRE) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeNotes(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizePreference(pref?: Partial<AttirePreference>, fallbackColor = DEFAULT_COLOR, isSponsor = false): AttirePreference {
    const primaryColor = normalizeColor(pref?.color || pref?.dressColor, fallbackColor);
    const dressColor = normalizeColor(pref?.dressColor, primaryColor);
    const suitColor = normalizeColor(pref?.suitColor, isSponsor ? DEFAULT_SUIT_COLOR : '#2D3543');
    const colors = normalizeColorList(pref?.colors, [primaryColor]);

    return {
        attire: normalizeAttire(pref?.attire),
        color: primaryColor,
        colors: colors.length > 0 ? colors : [primaryColor],
        dressColor,
        suitColor,
        notes: normalizeNotes(pref?.notes),
    };
}

export function parseDressCodeValue(value?: string, motifColor?: string): DressCodeSettings {
    const fallbackColor = normalizeColor(motifColor, DEFAULT_COLOR);
    const fallback: DressCodeSettings = {
        sponsors: { attire: DEFAULT_ATTIRE, color: fallbackColor, colors: [fallbackColor], dressColor: fallbackColor, suitColor: DEFAULT_SUIT_COLOR },
        guests: { attire: DEFAULT_ATTIRE, color: fallbackColor, colors: [fallbackColor], dressColor: fallbackColor, suitColor: '#2D3543' },
    };

    if (!value?.trim()) return fallback;

    if (value.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(value) as Partial<SerializedDressCode>;
            if (parsed.sponsors && parsed.guests) {
                const settings: DressCodeSettings = {
                    sponsors: normalizePreference(parsed.sponsors, fallbackColor, true),
                    guests: normalizePreference(parsed.guests, fallbackColor, false),
                };
                if (parsed.bridesmaids && typeof parsed.bridesmaids === 'object') {
                    settings.bridesmaids = normalizePreference(parsed.bridesmaids, '#9B1D20', false);
                }
                return settings;
            }
        } catch {
            return fallback;
        }

        return fallback;
    }

    // Legacy weddings used "guest attire||color". Preserve the guest choice and
    // give principal sponsors a formal default in the same palette.
    const [legacyAttire = '', legacyColor = ''] = value.split('||');
    const color = normalizeColor(legacyColor, fallbackColor);
    return {
        sponsors: { attire: DEFAULT_ATTIRE, color, colors: [color], dressColor: color, suitColor: DEFAULT_SUIT_COLOR },
        guests: { attire: normalizeAttire(legacyAttire), color, colors: [color], dressColor: color, suitColor: '#2D3543' },
    };
}

export function serializeDressCodeValue(settings: DressCodeSettings) {
    const guests = normalizePreference(settings.guests, DEFAULT_COLOR, false);
    const sponsors = normalizePreference(settings.sponsors, guests.color, true);

    const payload: SerializedDressCode = {
        v: 3,
        sponsors,
        guests,
    };

    if (settings.bridesmaids?.attire || settings.bridesmaids?.color) {
        payload.bridesmaids = normalizePreference(settings.bridesmaids, '#9B1D20', false);
    }

    return JSON.stringify(payload);
}
