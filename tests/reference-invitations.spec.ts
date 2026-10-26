import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import { mockWeddingPage } from './fixtures/wedding-preview';
import { REFERENCE_INVITATIONS } from '../src/lib/reference-invitations';

for (const viewport of [{ width: 360, height: 800 }, { width: 1440, height: 900 }]) {
  for (const reference of REFERENCE_INVITATIONS) {
    test(`${reference.id} ${reference.name} at ${viewport.width}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockWeddingPage(page, reference.templateId, { template_style: reference.id, motif_color: reference.accent });
      await expect(page.locator('[data-reference-invitation]')).toHaveAttribute('data-reference-invitation', reference.id);
      await expect(page.locator('h1').first()).toContainText('Amelia Rose');
      await expect(page.locator('h1').first()).toContainText('Mateo James');
      for (const id of ['details', 'timeline', 'gallery', 'gift', 'rsvp', 'entourage', 'venue', 'faq', 'guestbook', 'attire']) {
        await expect(page.locator(`#${id}`), `unique ${id}`).toHaveCount(1);
      }
      expect(await page.locator('.wedding-template').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(2);
      await expect(page.getByText('Shuttle service available from designated venues.')).toHaveCount(0);
      await expect(page.locator('audio')).toHaveCount(0);
      if (viewport.width === 360) {
        fs.mkdirSync('/tmp/quickweds-reference-qa', { recursive: true });
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.screenshot({ path: `/tmp/quickweds-reference-qa/${reference.id}.png`, fullPage: true });
      }
    });
  }
}

test('reference invitation accepts long names and absent optional media', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 320, height: 800 });
  for (const reference of REFERENCE_INVITATIONS) {
    await mockWeddingPage(page, reference.templateId, {
      template_style: reference.id, bride_name: 'Alexandria Isabella Rose', groom_name: 'Christopher Alexander James',
      hero_image: '', couple_photo: '', gift_qr_image: '', program_timeline: '', wedding_date: '',
    });
    await expect(page.locator('[data-reference-invitation] h1')).toContainText('Alexandria Isabella Rose');
    expect(await page.locator('.wedding-template').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(2);
  }
});

test('reference invitation uses the existing RSVP submission', async ({ page }) => {
  await mockWeddingPage(page, 'elopement', { template_style: 'reference-06', rsvp_search_guest_list: false });
  await page.route('**/api/public/rsvp', route => route.fulfill({ json: { success: true } }));
  await page.route('**/api/analytics/track', route => route.fulfill({ json: { ok: true } }));
  const form = page.locator('#rsvp');
  await form.getByPlaceholder('Enter your full name').fill('Reference Guest');
  await form.getByPlaceholder('For your RSVP confirmation').fill('guest@example.com');
  await form.getByRole('button', { name: 'Submit RSVP', exact: true }).click();
  await expect(form.getByRole('heading', { name: 'Thank You!' })).toBeVisible();
});

test('custom motif changes invitation accents and thank-you mode omits live invitation actions', async ({ page }) => {
  await mockWeddingPage(page, 'velure-editorial', { template_style: 'reference-02', motif_color: '#335577' });
  expect(await page.locator('[data-reference-invitation]').evaluate(el => getComputedStyle(el).getPropertyValue('--ref-accent').trim())).toBe('#335577');
  await page.getByRole('button', { name: 'View wedding photo 1', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close photo', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next photo', exact: true }).click();
  await expect(page.getByAltText('Wedding gallery image 2')).toBeVisible();
  await page.getByRole('button', { name: 'Close photo', exact: true }).click();
  await mockWeddingPage(page, 'velure-editorial', { template_style: 'reference-02', is_thank_you_mode: true, thank_you_message: 'Thank you for celebrating with us.', show_photos_in_thank_you_mode: false });
  await expect(page.locator('#rsvp')).toHaveCount(0);
  await expect(page.locator('#timeline')).toHaveCount(0);
  await expect(page.locator('#countdown')).toHaveCount(0);
  await expect(page.locator('[data-reference-invitation]')).toContainText('Thank you for celebrating with us.');
});
