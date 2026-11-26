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

const WEDDING_SHADE_NAMES: readonly { name: string; rgb: readonly [number, number, number] }[] = [
    { name: 'Ivory', rgb: [252, 248, 240] },
    { name: 'Pearl', rgb: [244, 240, 236] },
    { name: 'Champagne', rgb: [232, 213, 183] },
    { name: 'Warm Sand', rgb: [216, 195, 165] },
    { name: 'Taupe', rgb: [168, 149, 134] },
    { name: 'Antique Gold', rgb: [197, 160, 89] },
    { name: 'Honey Ochre', rgb: [204, 148, 72] },
    { name: 'Blush', rgb: [242, 193, 204] },
    { name: 'Dusty Rose', rgb: [209, 108, 120] },
    { name: 'Mauve', rgb: [164, 125, 133] },
    { name: 'Rosewood', rgb: [143, 57, 74] },
    { name: 'Burgundy', rgb: [122, 34, 49] },
    { name: 'Terracotta', rgb: [182, 90, 60] },
    { name: 'Rust', rgb: [152, 74, 48] },
    { name: 'Cinnamon', rgb: [140, 100, 70] },
    { name: 'Espresso', rgb: [74, 51, 36] },
    { name: 'Sage', rgb: [141, 168, 142] },
    { name: 'Eucalyptus', rgb: [106, 125, 84] },
    { name: 'Olive', rgb: [86, 99, 62] },
    { name: 'Forest Green', rgb: [45, 77, 56] },
    { name: 'Emerald', rgb: [16, 110, 84] },
    { name: 'Sea Glass', rgb: [151, 185, 191] },
    { name: 'Powder Blue', rgb: [145, 176, 211] },
    { name: 'Dusty Blue', rgb: [108, 138, 166] },
    { name: 'Cobalt', rgb: [37, 76, 170] },
    { name: 'Midnight Navy', rgb: [29, 35, 48] },
    { name: 'Lavender', rgb: [182, 162, 214] },
    { name: 'Plum', rgb: [112, 62, 92] },
    { name: 'Slate', rgb: [100, 116, 139] },
    { name: 'Charcoal', rgb: [54, 54, 58] },
    { name: 'Noir', rgb: [22, 22, 24] },
];

/**
 * Maps a hex swatch to an understated, editorial wedding shade name
 * so guests see curated color tone names instead of raw hex codes.
 */
export function describeWeddingColor(hex?: string): string {
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex.trim())) return 'Motif Tone';
    const clean = hex.trim().slice(1);
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);

    let closest = WEDDING_SHADE_NAMES[0].name;
    let bestDistance = Infinity;

    for (const shade of WEDDING_SHADE_NAMES) {
        const dr = r - shade.rgb[0];
        const dg = g - shade.rgb[1];
        const db = b - shade.rgb[2];
        const distance = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
        if (distance < bestDistance) {
            bestDistance = distance;
            closest = shade.name;
        }
    }

    return closest;
}
