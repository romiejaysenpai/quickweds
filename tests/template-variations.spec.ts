import { test, expect, type Page } from '@playwright/test';
import {
    TEMPLATES,
    getTemplateStyleVariants,
    isTemplateStyleAvailable,
    getTemplateStyleLabel,
} from '../src/lib/template-catalog';
import { TEMPLATE_COMPONENTS } from '../src/components/templates/TemplateRenderer';

test.describe('Template 5-Variation System Audit', () => {
    test('should have 147 total templates in catalog matching template components', () => {
        expect(TEMPLATES.length).toBe(147);
        const componentKeys = Object.keys(TEMPLATE_COMPONENTS);
        expect(componentKeys.length).toBe(147);

        for (const t of TEMPLATES) {
            expect(componentKeys).toContain(t.id);
        }
    });

    test('should return exactly 5 variations for every single template in the catalog', () => {
        for (const t of TEMPLATES) {
            const variants = getTemplateStyleVariants(t.id);
            expect(variants).toBeDefined();
            expect(variants).toHaveLength(5);

            const keys = variants.map((v) => v.variationKey);
            expect(keys).toEqual(['v1', 'v2', 'v3', 'v4', 'v5']);

            // Unique IDs within each template
            const ids = variants.map((v) => v.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(5);

            // Verify all design attributes are present and distinct
            for (const v of variants) {
                expect(v.id).toBeTruthy();
                expect(v.name).toBeTruthy();
                expect(v.desc).toBeTruthy();
                expect(v.heroLayout).toBeTruthy();
                expect(v.typography).toBeTruthy();
                expect(v.sectionArrangement).toBeTruthy();
                expect(v.galleryStyle).toBeTruthy();
                expect(v.buttonStyle).toBeTruthy();
                expect(v.mobileLayout).toBeTruthy();

                // Check template style availability and labels
                expect(isTemplateStyleAvailable(t.id, v.id)).toBe(true);
                expect(getTemplateStyleLabel(v.id)).toBeTruthy();
            }
        }
    });

    test('should preserve bespoke variations for classic, luxury, editorial, and romantic', () => {
        // Classic has 5 bespoke variations
        const classicVariants = getTemplateStyleVariants('classic');
        expect(classicVariants).toHaveLength(5);
        expect(classicVariants[0].id).toBe('classic_v1');
        expect(classicVariants[1].id).toBe('classic_v2');
        expect(classicVariants[2].id).toBe('classic_v3');
        expect(classicVariants[3].id).toBe('classic_v4');
        expect(classicVariants[4].id).toBe('classic_v5');

        // Luxury has bespoke V2 'luxury-planner' and full 5 variations
        const luxuryVariants = getTemplateStyleVariants('luxury');
        expect(luxuryVariants).toHaveLength(5);
        expect(luxuryVariants[1].id).toBe('luxury-planner');
        expect(luxuryVariants[4].variationKey).toBe('v5');

        // Editorial has bespoke V2 'editorial-photo' and full 5 variations
        const editorialVariants = getTemplateStyleVariants('editorial');
        expect(editorialVariants).toHaveLength(5);
        expect(editorialVariants[1].id).toBe('editorial-photo');
        expect(editorialVariants[4].variationKey).toBe('v5');

        // Romantic has bespoke V2 'romantic-estate' and full 5 variations
        const romanticVariants = getTemplateStyleVariants('romantic');
        expect(romanticVariants).toHaveLength(5);
        expect(romanticVariants[1].id).toBe('romantic-estate');
        expect(romanticVariants[4].variationKey).toBe('v5');
    });

    test('should correctly normalize template style IDs and availability', () => {
        expect(isTemplateStyleAvailable('minimal', 'default')).toBe(true);
        expect(isTemplateStyleAvailable('minimal', 'v1')).toBe(true);
        expect(isTemplateStyleAvailable('minimal', 'minimal_v2')).toBe(true);
        expect(isTemplateStyleAvailable('minimal', 'v2')).toBe(true);
        expect(isTemplateStyleAvailable('minimal', 'minimal_v5')).toBe(true);
        expect(isTemplateStyleAvailable('luxury', 'luxury-planner')).toBe(true);
        expect(isTemplateStyleAvailable('luxury', 'v2')).toBe(true);

        expect(getTemplateStyleLabel('default')).toBe('Original (V1)');
        expect(getTemplateStyleLabel('minimal_v2')).toBe('Split-Screen Modern (V2)');
        expect(getTemplateStyleLabel('boho_v3')).toBe('Floating Glass Romance (V3)');
        expect(getTemplateStyleLabel('royal_v4')).toBe('Magazine Monogram Grid (V4)');
        expect(getTemplateStyleLabel('urban_v5')).toBe('Minimalist Couture (V5)');
    });

    test('should render distinct variation DOM styles for all 5 variations of minimal template', async ({ page }) => {
        // V1: Default signature MinimalTemplate (does not have template-variation-v2..v5)
        await page.goto('/w/template-minimal');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('.template-variation-v2')).toHaveCount(0);
        await expect(page.locator('.template-variation-v3')).toHaveCount(0);
        await expect(page.locator('.template-variation-v4')).toHaveCount(0);
        await expect(page.locator('.template-variation-v5')).toHaveCount(0);

        // V2: Split-Screen Modern Editorial
        await page.goto('/w/template-minimal--style-minimal_v2');
        await expect(page.locator('.template-variation-v2')).toBeVisible();

        // V3: Floating Glass Romance
        await page.goto('/w/template-minimal--style-minimal_v3');
        await expect(page.locator('.template-variation-v3')).toBeVisible();

        // V4: Magazine Monogram Grid
        await page.goto('/w/template-minimal--style-minimal_v4');
        await expect(page.locator('.template-variation-v4')).toBeVisible();

        // V5: Minimalist Couture
        await page.goto('/w/template-minimal--style-minimal_v5');
        await expect(page.locator('.template-variation-v5')).toBeVisible();
    });

    test('should render bespoke V2 for luxury template', async ({ page }) => {
        await page.goto('/w/template-luxury--style-luxury-planner');
        await expect(page.locator('text=Planners of a beautiful day')).toBeVisible();
    });
});
