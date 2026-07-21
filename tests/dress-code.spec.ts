import { expect, test } from '@playwright/test';
import { parseDressCodeValue, serializeDressCodeValue } from '../src/lib/dress-code';

test.describe('dress code settings', () => {
    test('keeps legacy guest attire compatible', () => {
        const settings = parseDressCodeValue('Garden Formal||#276749', '#D16C78');

        expect(settings.guests).toEqual({ attire: 'Garden Formal', color: '#276749' });
        expect(settings.sponsors).toEqual({ attire: 'Formal Attire', color: '#276749' });
    });

    test('round trips separate sponsor and guest settings', () => {
        const serialized = serializeDressCodeValue({
            sponsors: { attire: 'Black Tie', color: '#1A365D' },
            guests: { attire: 'Garden Formal', color: '#6B7A62' },
        });

        expect(parseDressCodeValue(serialized)).toEqual({
            sponsors: { attire: 'Black Tie', color: '#1A365D' },
            guests: { attire: 'Garden Formal', color: '#6B7A62' },
        });
    });

    test('falls back safely for malformed settings', () => {
        expect(parseDressCodeValue('{not-json', '#805AD5')).toEqual({
            sponsors: { attire: 'Formal Attire', color: '#805AD5' },
            guests: { attire: 'Formal Attire', color: '#805AD5' },
        });
    });
});
