export type AttirePreference = {
    attire: string;
    color: string;
};

export type DressCodeSettings = {
    sponsors: AttirePreference;
    guests: AttirePreference;
};

type SerializedDressCode = {
    v: 2;
    sponsors: AttirePreference;
    guests: AttirePreference;
};

const DEFAULT_COLOR = '#D16C78';
const DEFAULT_ATTIRE = 'Formal Attire';

function normalizeColor(value: unknown, fallback: string) {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim();
    return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : fallback;
}

function normalizeAttire(value: unknown, fallback = DEFAULT_ATTIRE) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function parseDressCodeValue(value?: string, motifColor?: string): DressCodeSettings {
    const fallbackColor = normalizeColor(motifColor, DEFAULT_COLOR);
    const fallback: DressCodeSettings = {
        sponsors: { attire: DEFAULT_ATTIRE, color: fallbackColor },
        guests: { attire: DEFAULT_ATTIRE, color: fallbackColor },
    };

    if (!value?.trim()) return fallback;

    if (value.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(value) as Partial<SerializedDressCode>;
            if (parsed.v === 2 && parsed.sponsors && parsed.guests) {
                return {
                    sponsors: {
                        attire: normalizeAttire(parsed.sponsors.attire),
                        color: normalizeColor(parsed.sponsors.color, fallbackColor),
                    },
                    guests: {
                        attire: normalizeAttire(parsed.guests.attire),
                        color: normalizeColor(parsed.guests.color, fallbackColor),
                    },
                };
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
        sponsors: { attire: DEFAULT_ATTIRE, color },
        guests: { attire: normalizeAttire(legacyAttire), color },
    };
}

export function serializeDressCodeValue(settings: DressCodeSettings) {
    const guestsColor = normalizeColor(settings.guests.color, DEFAULT_COLOR);
    const sponsorsColor = normalizeColor(settings.sponsors.color, guestsColor);
    const payload: SerializedDressCode = {
        v: 2,
        sponsors: {
            attire: normalizeAttire(settings.sponsors.attire),
            color: sponsorsColor,
        },
        guests: {
            attire: normalizeAttire(settings.guests.attire),
            color: guestsColor,
        },
    };

    return JSON.stringify(payload);
}
