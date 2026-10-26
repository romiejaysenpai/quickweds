import { expect, test } from '@playwright/test';
import { mockWeddingPage } from './fixtures/wedding-preview';

const templates = ['editorial-romance', 'envelope-wax-seal', 'pearl-coastal', 'watercolor-meadow', 'velure-editorial', 'torn-paper-terracotta', 'love-letter', 'butter-blue', 'ribbon-romance'];
for (const template of templates) {
  test(`${template}: native composition applies builder palette, typography and frames`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWeddingPage(page, template, {
      template_style: 'default', motif_color: '#eef3c5', background_style: 'rose', font_style: 'Modern',
      section_title_font_style: 'modern-sans', section_title_color_style: 'rose-gold',
      card_style: 'arch_panel', rsvp_search_guest_list: false,
      logo_initials: 'ZX', logo_shape: 'diamond', logo_color: '#224466', logo_font: 'montserrat',
    });
    const native = page.locator('[data-native-template], [data-stationery]');
    await expect(native).toHaveCount(1);
    await expect(native).toHaveCSS('background-color', 'rgb(255, 245, 245)');
    await expect(native.locator('h1')).toContainText('Amelia Rose');
    await expect(native.locator('h1')).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    const mismatch = await native.locator('h1').evaluate(element => {
      const probe = document.createElement('span');
      probe.style.fontFamily = 'var(--builder-heading-font)';
      element.parentElement!.append(probe);
      const result = getComputedStyle(element).fontFamily !== getComputedStyle(probe).fontFamily;
      probe.remove(); return result;
    });
    expect(mismatch).toBe(false);
    const card = native.locator('[data-native-card]').first();
    if (await card.count()) await expect(card).toHaveCSS('border-radius', '40px 40px 8px 8px');
    const action = native.locator('a[data-wedding-control="primary"]').first();
    if (await action.count()) {
      await expect(action).toHaveCSS('background-color', 'rgb(238, 243, 197)');
      await expect(action).toHaveCSS('color', 'rgb(0, 0, 0)');
    }
    expect(await native.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
    await page.screenshot({ path: `/tmp/quickweds-native-qa/${template}.png` });
    await expect(page.locator('#rsvp')).toHaveCount(1);
    await expect(page.locator('#faq')).toContainText('Is parking available?');
    if (['editorial-romance', 'envelope-wax-seal', 'velure-editorial', 'torn-paper-terracotta', 'love-letter', 'butter-blue'].includes(template)) {
      await expect(native.locator('svg').filter({ has: page.locator('text', { hasText: 'ZX' }) }).first()).toBeAttached();
    }
  });
}
for (const template of ['envelope-wax-seal', 'velure-editorial']) {
  test(`${template}: native music uses the configured source and obeys enabled`, async ({ page }) => {
    await mockWeddingPage(page, template, { background_music_enabled: true, background_music_title: 'Our chosen track', background_music_url: '/test-wedding-song.mp3' });
    const player = page.locator('[data-native-template] audio');
    await expect(player).toHaveAttribute('src', '/test-wedding-song.mp3');
    await expect(player).toHaveAttribute('controls', '');
    await expect(player).toHaveAccessibleName('Our chosen track');
    await mockWeddingPage(page, template, { background_music_enabled: false, background_music_url: '/test-wedding-song.mp3' });
    await expect(page.locator('[data-native-template] audio')).toHaveCount(0);
  });
}

test('native defaults retain their wireframes on desktop', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const template of templates) {
    await mockWeddingPage(page, template, { background_style: 'gradient', template_style: 'default', card_style: 'default' });
    const native = page.locator('[data-native-template], [data-stationery]');
    await expect(native.locator('h1')).toBeVisible();
    expect(await native.evaluate(element => element.scrollWidth - element.clientWidth), template).toBeLessThanOrEqual(2);
    await page.screenshot({ path: `/tmp/quickweds-native-qa/${template}-desktop.png` });
  }
});
