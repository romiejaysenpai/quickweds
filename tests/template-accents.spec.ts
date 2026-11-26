import { expect, test } from '@playwright/test';
import { mockWeddingPage } from './fixtures/wedding-preview';

for (const [template, style] of [['classic', 'default'], ['midnight', 'default'], ['garden', 'garden_v2'], ['pearl-coastal', 'reference-45'], ['love-letter', 'default']]) {
  test(`${template}/${style}: editable section motifs remain usable on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const accent of ['olive', 'pearls', 'coastal', 'deco']) {
      await mockWeddingPage(page, template, { template_style: style, accent_style: accent });
      const ornaments = page.locator(`[data-section-accent="${accent}"]`);
      await expect(ornaments.first()).toBeAttached();
      expect(await ornaments.count()).toBeGreaterThan(1);
      await expect(ornaments.first().locator('svg')).toHaveCount(1);
      await expect(page.locator(`#faq [data-section-accent="${accent}"]`)).toHaveCount(1);
      await expect(page.locator(`footer [data-section-accent="${accent}"]`)).toHaveCount(1);
      await expect(page.locator('#rsvp')).toHaveCount(1);
      expect(await page.locator('.wedding-template').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(2);
    }
    await mockWeddingPage(page, template, { template_style: style, accent_style: 'clean' });
    await expect(page.locator('[data-section-accent]')).toHaveCount(0);
    await expect(page.locator('#rsvp')).toHaveCount(1);
  });
}
