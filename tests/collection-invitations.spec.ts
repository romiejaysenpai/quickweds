import { expect, test, type Locator } from '@playwright/test';
import { mockWeddingPage } from './fixtures/wedding-preview';
import { REFERENCE_INVITATIONS } from '../src/lib/reference-invitations';

async function themedValue(locator: Locator, property: 'font-family' | 'background-color' | 'color', token: string) {
  return locator.evaluate((element, { property, token }) => {
    const probe = document.createElement('span');
    probe.style.setProperty(property, `var(${token})`, 'important');
    element.parentElement!.appendChild(probe);
    const expected = getComputedStyle(probe).getPropertyValue(property);
    probe.remove();
    return { expected, actual: getComputedStyle(element).getPropertyValue(property) };
  }, { property, token });
}

for (const reference of REFERENCE_INVITATIONS.filter(item => item.reference >= 31)) {
  test(`${reference.id}: editable typography, native panels and shared controls remain aligned`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWeddingPage(page, reference.templateId, {
      template_style: reference.id, motif_color: '#224466', font_style: 'Modern',
      section_title_font_style: 'default', card_style: 'arch_panel', rsvp_search_guest_list: false,
    });
    await expect(page.locator('.wedding-page')).toHaveAttribute('data-invitation-style', reference.id);
    for (const selector of ['h1', '#bio h2', '#timeline h2', '#details h2', '#rsvp h2', '#faq h2']) {
      const locator = page.locator(selector).first();
      const values = await themedValue(locator, 'font-family', '--invitation-heading-font');
      expect(values.actual, `${reference.id} ${selector}`).toBe(values.expected);
    }
    const headingColors = await themedValue(page.locator('#rsvp h2').first(), 'color', '--invitation-ink');
    expect(headingColors.actual, `${reference.id}: shared heading remains readable`).toBe(headingColors.expected);
    await expect(page.locator('#bio')).toHaveCSS('border-radius', '40px 40px 8px 8px');
    const submit = page.getByRole('button', { name: 'Submit RSVP', exact: true });
    for (const [property, token] of [['background-color', '--invitation-action'], ['color', '--invitation-on-action']] as const) {
      const values = await themedValue(submit, property, token);
      expect(values.actual, `${reference.id} ${property}`).toBe(values.expected);
    }
    expect(await page.locator('.wedding-template').evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
    for (const marker of ['rd_invite', 'save_yourdate', 'DELETE AFTER READING', 'reachdreams.ru']) {
      await expect(page.locator('.wedding-template')).not.toContainText(marker);
    }
  });
}

test('new collection retains photo viewing and real RSVP submission', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockWeddingPage(page, 'pearl-coastal', { template_style: 'reference-46', motif_color: '#91b0d3', rsvp_search_guest_list: false });
  await page.getByRole('button', { name: 'View wedding photo 1', exact: true }).click();
  await expect(page.getByAltText('Wedding gallery image 1')).toBeVisible();
  await page.getByRole('button', { name: 'Close photo', exact: true }).click();
  await page.route('**/api/public/rsvp', route => route.fulfill({ json: { success: true } }));
  await page.route('**/api/analytics/track', route => route.fulfill({ json: { ok: true } }));
  const rsvp = page.locator('#rsvp');
  await rsvp.getByPlaceholder('Enter your full name').fill('Collection Guest');
  await rsvp.getByPlaceholder('For your RSVP confirmation').fill('guest@example.com');
  await rsvp.getByRole('button', { name: 'Submit RSVP', exact: true }).click();
  await expect(rsvp.getByRole('heading', { name: 'Thank You!' })).toBeVisible();
});

test('new collection thank-you state hides live invitation sections', async ({ page }) => {
  await mockWeddingPage(page, 'garden', { template_style: 'reference-50', is_thank_you_mode: true, show_photos_in_thank_you_mode: false, thank_you_message: 'Thank you for sharing our day.' });
  for (const id of ['rsvp', 'timeline', 'countdown', 'attire', 'gallery']) await expect(page.locator(`#${id}`)).toHaveCount(0);
  await expect(page.locator('.wedding-template')).toContainText('Thank you for sharing our day.');
});

test('all new design defaults fit mobile with their recommended typography', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const reference of REFERENCE_INVITATIONS.filter(item => item.reference >= 31)) {
    await mockWeddingPage(page, reference.templateId, { template_style: reference.id, motif_color: reference.accent, font_style: reference.fontStyle, section_title_font_style: reference.titleFontStyle });
    await expect(page.locator('.wedding-template h1')).toBeVisible();
    expect(await page.locator('.wedding-template').evaluate(element => element.scrollWidth - element.clientWidth), reference.id).toBeLessThanOrEqual(2);
  }
});
