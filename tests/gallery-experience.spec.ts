import { expect, test } from '@playwright/test';
import { mockWeddingPage } from './fixtures/wedding-preview';

for (const template of ['classic', 'midnight', 'heirloom', 'love-letter']) {
  test(`${template} gallery is usable on mobile and by keyboard`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWeddingPage(page, template, { gallery_layout: 'grid' });

    const gallery = page.locator('#gallery');
    await expect(gallery.getByText('Explore 6 photos')).toBeVisible();
    const photos = gallery.getByRole('button', { name: /Open wedding gallery image/ });
    const first = await photos.nth(0).boundingBox();
    const second = await photos.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(Math.abs(first!.y - second!.y)).toBeLessThan(2);

    await photos.first().click();
    const dialog = page.getByRole('dialog', { name: 'Wedding photo viewer' });
    await expect(dialog.getByRole('button', { name: 'Close photo' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('img', { name: 'Wedding gallery image 2' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(photos.first()).toBeFocused();
  });
}
