import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { REFERENCE_INVITATIONS } from '../src/lib/reference-invitations';
import { mockWeddingPage } from './fixtures/wedding-preview';

const artifacts = '/tmp/quickweds-design-polish-qa';
const natives = ['editorial-romance', 'envelope-wax-seal', 'pearl-coastal', 'watercolor-meadow', 'velure-editorial', 'torn-paper-terracotta', 'love-letter', 'butter-blue', 'ribbon-romance'];
mkdirSync(artifacts, { recursive: true });

for (let start = 0; start < 50; start += 10) {
  test(`reference ${start + 1}–${start + 10}: narrow screen and design preview`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const reference of REFERENCE_INVITATIONS.slice(start, start + 10)) {
      await page.setViewportSize({ width: 390, height: 844 });
      await mockWeddingPage(page, reference.templateId, {
        template_style: reference.id, motif_color: reference.accent,
        font_style: reference.fontStyle || 'Elegant', section_title_font_style: reference.titleFontStyle || 'default',
        card_style: 'default', background_style: 'gradient', rsvp_search_guest_list: false,
      });
      await page.locator('.wedding-template h1').first().waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${artifacts}/${reference.id}-hero.png` });
      const monogram = page.locator('svg[aria-label="AM wedding monogram"]').first();
      if (await monogram.count()) {
        const fills = await monogram.evaluate(element => {
          const text = element.querySelector('text');
          const circle = element.querySelector('circle');
          return text && circle ? { text: getComputedStyle(text).fill, backing: getComputedStyle(circle).fill } : null;
        });
        if (fills) expect(fills.text, `${reference.id}: initials remain visible on the seal`).not.toBe(fills.backing);
      }
      await page.locator('#timeline').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${artifacts}/${reference.id}-timeline.png` });
      await page.setViewportSize({ width: 320, height: 740 });
      await mockWeddingPage(page, reference.templateId, {
        template_style: reference.id, motif_color: reference.accent,
        font_style: reference.fontStyle || 'Elegant', section_title_font_style: reference.titleFontStyle || 'default',
        bride_name: 'Alexandria-Marguerite de la Cruz', groom_name: 'Sebastian-Maximilian Montgomery',
        card_style: 'default', background_style: 'gradient', rsvp_search_guest_list: false,
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), reference.id).toBeLessThanOrEqual(2);
      const heading = page.locator('.wedding-template h1').first();
      await expect(heading).toContainText('Alexandria-Marguerite');
      const bounds = await heading.boundingBox();
      expect(bounds!.x, `${reference.id}: name starts inside viewport`).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width, `${reference.id}: name fits viewport`).toBeLessThanOrEqual(321);
      const submit = page.getByRole('button', { name: 'Submit RSVP', exact: true });
      await submit.focus();
      await expect(submit).toBeFocused();
      const photos = page.getByRole('button', { name: /^View wedding photo \d+$|^Open wedding gallery image \d+$/ });
      await expect(photos).toHaveCount(6);
      await photos.first().click();
      await expect(page.getByAltText('Wedding gallery image 1', { exact: true }).last()).toBeVisible();
      await page.getByRole('button', { name: 'Next photo', exact: true }).click();
      await expect(page.getByAltText('Wedding gallery image 2', { exact: true }).last()).toBeVisible();
      await page.getByRole('button', { name: 'Close photo', exact: true }).click();
      const targets = await page.locator('[data-wedding-control="primary"]').evaluateAll(elements => elements.map(element => ({ text: element.textContent?.trim(), height: element.getBoundingClientRect().height })).filter(item => item.height > 0 && item.height < 40));
      writeFileSync(`${artifacts}/${reference.id}-small-targets.json`, JSON.stringify(targets, null, 2));
    }
  });
}

test('nine native designs: narrow layout and photo viewing', async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const template of natives) {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockWeddingPage(page, template, { template_style: 'default', card_style: 'default', background_style: 'gradient', rsvp_search_guest_list: false });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${artifacts}/${template}-hero.png` });
    await page.setViewportSize({ width: 320, height: 740 });
    await mockWeddingPage(page, template, { template_style: 'default', bride_name: 'Alexandria-Marguerite de la Cruz', groom_name: 'Sebastian-Maximilian Montgomery' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), template).toBeLessThanOrEqual(2);
    await expect(page.locator('.wedding-template h1').first()).toContainText('Alexandria-Marguerite');
    const photos = page.getByRole('button', { name: /^View wedding photo \d+$|^Open wedding gallery image \d+$/ });
    await expect(photos).toHaveCount(6);
    await photos.first().click();
    await expect(page.getByAltText('Wedding gallery image 1', { exact: true }).last()).toBeVisible();
    await page.getByRole('button', { name: 'Close photo', exact: true }).click();
  }
});

for (const id of ['reference-31', 'reference-41']) {
  test(`${id}: wedding schedule arrows work by keyboard on mobile`, async ({ page }) => {
    const reference = REFERENCE_INVITATIONS.find(item => item.id === id)!;
    await page.setViewportSize({ width: 320, height: 740 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWeddingPage(page, reference.templateId, { template_style: id, motif_color: reference.accent });
    const schedule = page.getByRole('list', { name: 'Wedding schedule', exact: true });
    const forward = page.getByRole('button', { name: 'Scroll wedding schedule forward', exact: true });
    const backward = page.getByRole('button', { name: 'Scroll wedding schedule backward', exact: true });
    await forward.focus();
    await expect(forward).toBeFocused();
    await expect(forward).toHaveCSS('outline-style', 'solid');
    expect((await forward.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await forward.press('Enter');
    await expect.poll(() => schedule.evaluate(element => element.scrollLeft)).toBeGreaterThan(20);
    await backward.press('Enter');
    await expect.poll(() => schedule.evaluate(element => element.scrollLeft)).toBeLessThan(5);
  });
}

test('shared invitation sections retain readable headings and touch fields', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of ['reference-01', 'reference-14', 'reference-31', 'reference-39', 'reference-42', 'reference-48']) {
    const reference = REFERENCE_INVITATIONS.find(item => item.id === id)!;
    await mockWeddingPage(page, reference.templateId, {
      template_style: id, motif_color: reference.accent, font_style: reference.fontStyle,
      section_title_font_style: reference.titleFontStyle, rsvp_search_guest_list: false,
    });
    for (const section of ['details', 'rsvp', 'faq']) {
      const heading = page.locator(`#${section} h2`).first();
      const size = await heading.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize));
      expect(size, `${id} ${section} heading`).toBeGreaterThanOrEqual(28);
      expect(size, `${id} ${section} heading`).toBeLessThanOrEqual(38);
      if (section === 'details') {
        const divider = page.locator('#details [data-wedding-divider]').first();
        await expect(divider).toHaveCount(1);
        const colors = await divider.evaluate(element => {
          const probe = document.createElement('span');
          probe.style.setProperty('background-color', 'var(--invitation-border)', 'important');
          element.parentElement!.append(probe);
          const result = { expected: getComputedStyle(probe).backgroundColor, actual: getComputedStyle(element).backgroundColor };
          probe.remove();
          return result;
        });
        expect(colors.actual, `${id}: divider follows the invitation palette`).toBe(colors.expected);
        await expect(divider).toHaveCSS('background-image', 'none');
      }
      await heading.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${artifacts}/${id}-${section}.png` });
    }
    const name = page.locator('#rsvp').getByPlaceholder('Enter your full name');
    expect((await name.boundingBox())!.height, `${id}: name touch target`).toBeGreaterThanOrEqual(44);
    expect((await page.locator('#rsvp textarea').first().boundingBox())!.height, `${id}: message field`).toBeGreaterThanOrEqual(112);
  }
});
