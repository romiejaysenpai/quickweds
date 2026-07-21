import { expect, test } from '@playwright/test';
import {
    FREE_MONOGRAM_SHAPE_IDS,
    MONOGRAM_ANIMATION_IDS,
    PRO_MONOGRAM_SHAPE_IDS,
    getSafeMonogramConfig,
} from '../src/lib/monogram';

test.describe('monogram entitlement safeguards', () => {
    test('keeps the existing nine static styles available to Free accounts', () => {
        expect(FREE_MONOGRAM_SHAPE_IDS).toHaveLength(9);
        expect(getSafeMonogramConfig({ shape: 'crest', animation: 'none' }, false)).toEqual({
            shape: 'crest',
            animation: 'none',
        });
    });

    test('falls back advanced styles and motion for a Free public page', () => {
        expect(getSafeMonogramConfig({ shape: 'wax-seal', animation: 'shimmer' }, false)).toEqual({
            shape: 'minimal',
            animation: 'none',
        });
    });

    test('preserves every Pro style and animation for entitled accounts', () => {
        expect(PRO_MONOGRAM_SHAPE_IDS).toHaveLength(6);
        expect(MONOGRAM_ANIMATION_IDS).toEqual(['none', 'draw', 'bloom', 'shimmer', 'float', 'reveal']);
        expect(getSafeMonogramConfig({ shape: 'botanical-frame', animation: 'bloom' }, true)).toEqual({
            shape: 'botanical-frame',
            animation: 'bloom',
        });
    });
});
