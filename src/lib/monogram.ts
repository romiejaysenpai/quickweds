export const FREE_MONOGRAM_SHAPE_IDS = [
    'minimal',
    'circle',
    'square',
    'double-ring',
    'oval',
    'diamond',
    'crest',
    'laurel',
    'editorial',
] as const;

export const PRO_MONOGRAM_SHAPE_IDS = [
    'intertwined',
    'wax-seal',
    'arched',
    'botanical-frame',
    'ribbon',
    'monoline',
] as const;

export const MONOGRAM_SHAPE_IDS = [...FREE_MONOGRAM_SHAPE_IDS, ...PRO_MONOGRAM_SHAPE_IDS] as const;
export type MonogramShape = (typeof MONOGRAM_SHAPE_IDS)[number];

export const MONOGRAM_ANIMATION_IDS = ['none', 'draw', 'bloom', 'shimmer', 'float', 'reveal'] as const;
export type MonogramAnimation = (typeof MONOGRAM_ANIMATION_IDS)[number];

export function isMonogramShape(value: unknown): value is MonogramShape {
    return typeof value === 'string' && (MONOGRAM_SHAPE_IDS as readonly string[]).includes(value);
}

export function isProMonogramShape(value: unknown) {
    return typeof value === 'string' && (PRO_MONOGRAM_SHAPE_IDS as readonly string[]).includes(value);
}

export function isMonogramAnimation(value: unknown): value is MonogramAnimation {
    return typeof value === 'string' && (MONOGRAM_ANIMATION_IDS as readonly string[]).includes(value);
}

export function getSafeMonogramConfig(input: { shape?: unknown; animation?: unknown }, hasProAccess: boolean) {
    const requestedShape = isMonogramShape(input.shape) ? input.shape : 'minimal';
    const shape = !hasProAccess && isProMonogramShape(requestedShape) ? 'minimal' : requestedShape;
    const requestedAnimation = isMonogramAnimation(input.animation) ? input.animation : 'none';

    return {
        shape,
        animation: hasProAccess ? requestedAnimation : 'none' as MonogramAnimation,
    };
}
