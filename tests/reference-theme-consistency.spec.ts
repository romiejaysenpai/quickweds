import { expect, test, type Locator } from '@playwright/test';
import fs from 'node:fs';
import { mockWeddingPage } from './fixtures/wedding-preview';
import { REFERENCE_INVITATIONS } from '../src/lib/reference-invitations';

const representativeIds = [6, 14, 19, 26, 28, 29];
const motif = '#224466';

async function tokenStyle(locator: Locator, property: 'color' | 'backgroundColor' | 'fontFamily', token: string) {
  return locator.evaluate((element, { property, token }) => {
    const probe = document.createElement('span');
    const cssProperty = property.replace(/[A-Z]/g, character => `-${character.toLowerCase()}`);
    probe.style.setProperty(cssProperty, `var(${token})`, 'important');
    // Inputs are void elements; a probe inside them has no computed style.
    (element.parentElement || element).appendChild(probe);
    const expected = getComputedStyle(probe)[property];
    probe.remove();
    return { actual: getComputedStyle(element)[property], expected };
  }, { property, token });
}

async function expectToken(locator: Locator, property: 'color' | 'backgroundColor' | 'fontFamily', token: string) {
  await expect(locator).toHaveCount(1);
  const { expected } = await tokenStyle(locator, property, token);
  await expect.poll(async () => (await tokenStyle(locator, property, token)).actual,
    { message: `${locator.toString()}: ${property} follows ${token}` }).toBe(expected);
}

function contrast(foreground: string, background: string) {
  const luminance = (value: string) => {
    const channels = value.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(channel => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

for (const width of [390, 1440]) {
  for (const reference of REFERENCE_INVITATIONS.filter(reference => representativeIds.includes(reference.reference))) {
    test(`${reference.id} full page follows custom motif and fonts at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockWeddingPage(page, reference.templateId, {
        template_style: reference.id, motif_color: motif, font_style: 'Modern',
        rsvp_search_guest_list: false, dress_code: 'Garden formal||#c87892',
      });
      const root = page.locator('.wedding-page');
      await expect(root).toHaveAttribute('data-invitation-style', reference.id);
      await expect(root).toHaveAttribute('data-invitation-theme', reference.layout);
      expect(await root.evaluate(element => getComputedStyle(element).getPropertyValue('--invitation-motif').trim())).toBe(motif);

      for (const selector of ['h1', '#details h2', '#gift h2', '#rsvp h2', '#faq h2']) {
        await expectToken(root.locator(selector).first(), 'fontFamily', '--invitation-heading-font');
      }
      for (const selector of ['#bio > p', '#faq summary', '#rsvp input[type="email"]']) {
        await expectToken(root.locator(selector).first(), 'fontFamily', '--invitation-body-font');
      }
      await expectToken(page.locator('#gift [data-wedding-badge]').first(), 'backgroundColor', '--invitation-subtle');
      await expectToken(page.locator('#gift [data-wedding-badge]').first(), 'color', '--invitation-ink');
      await expectToken(page.locator('#gift h3').first(), 'fontFamily', '--invitation-heading-font');
      await expectToken(page.locator('#gift h3').first(), 'color', '--invitation-ink');
      const submit = page.getByRole('button', { name: 'Submit RSVP', exact: true });
      await expectToken(submit, 'backgroundColor', '--invitation-action');
      await expectToken(submit, 'color', '--invitation-on-action');
      await expectToken(submit, 'fontFamily', '--invitation-body-font');
      await expectToken(page.locator('#faq summary').first(), 'color', '--invitation-ink');
      await expect(page.locator('.wedding-signature')).toHaveCount(1);
      await expectToken(page.locator('.wedding-signature'), 'color', '--invitation-ink');

      const more = page.getByRole('button', { name: 'More', exact: true });
      await page.locator('#details').scrollIntoViewIfNeeded();
      await more.click();
      await expect(page.locator('#wedding-navigation-more')).toBeVisible();
      await expectToken(page.locator('#wedding-navigation-more'), 'color', '--invitation-ink');
      await more.press('Escape');
      await expect(more).toBeFocused();

      // User-selected dress colours and QR readability must survive theme overrides.
      const swatches = page.locator('#attire span[title="#c87892"]');
      expect(await swatches.count()).toBeGreaterThan(0);
      for (const swatch of await swatches.all()) await expect(swatch).toHaveCSS('background-color', 'rgb(200, 120, 146)');
      const qr = page.getByAltText('Payment QR code for digital gifting');
      await expect(qr).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      expect(await root.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
    });
  }
}

for (const customMotif of ['#f4e9bf', '#182d37']) {
  test(`action labels remain readable with motif ${customMotif}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWeddingPage(page, 'garden', { template_style: 'reference-26', motif_color: customMotif, rsvp_search_guest_list: false });
    const submit = page.getByRole('button', { name: 'Submit RSVP', exact: true });
    const colors = await submit.evaluate(element => {
      const style = getComputedStyle(element);
      return { foreground: style.color, background: style.backgroundColor };
    });
    expect(contrast(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
    await expectToken(submit, 'backgroundColor', '--invitation-action');
    await expectToken(submit, 'color', '--invitation-on-action');
  });
}

test('themed RSVP retains submission and success state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockWeddingPage(page, 'elopement', { template_style: 'reference-06', motif_color: motif, font_style: 'Modern', rsvp_search_guest_list: false });
  await page.route('**/api/public/rsvp', route => route.fulfill({ json: { success: true } }));
  await page.route('**/api/analytics/track', route => route.fulfill({ json: { ok: true } }));
  const form = page.locator('#rsvp');
  await form.getByPlaceholder('Enter your full name').fill('Theme Test Guest');
  await form.getByPlaceholder('For your RSVP confirmation').fill('theme-test@example.com');
  await form.getByRole('button', { name: 'Submit RSVP', exact: true }).click();
  const success = form.getByRole('heading', { name: 'Thank You!' });
  await expect(success).toBeVisible();
  await expectToken(success, 'fontFamily', '--invitation-heading-font');
  await expectToken(success, 'color', '--invitation-ink');
  const statusIcon = form.locator('[data-wedding-status="success"]');
  await expect(statusIcon).toHaveClass(/text-emerald-500/);
  const statusColors = await tokenStyle(statusIcon, 'color', '--invitation-ink');
  expect(statusColors.actual).not.toBe(statusColors.expected);
});

test('selected title treatments and card settings apply across native and shared sections', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockWeddingPage(page, 'garden', {
    template_style: 'reference-26', motif_color: motif, font_style: 'Modern',
    section_title_font_style: 'romantic-script', section_title_color_style: 'rose-gold',
    card_style: 'arch_panel', background_style: 'white', rsvp_search_guest_list: false,
  });
  for (const selector of ['#bio h2', '#timeline h2', '#attire h2', '#gallery h2', '#details h2', '#gift h2', '#rsvp h2', '#faq h2']) {
    const heading = page.locator(selector).first();
    await expectToken(heading, 'fontFamily', '--invitation-title-font');
    await expect(heading).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await expect(heading).toHaveCSS('background-clip', 'text');
    await expect(heading).toHaveCSS('background-image', /linear-gradient.*184, 92, 122.*214, 184, 124.*242, 193, 204/);
  }
  await expect(page.locator('.wedding-page')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  for (const id of ['details', 'gift', 'rsvp']) {
    const card = page.locator(`#${id} [data-wedding-card]`).first();
    await expect(card).toHaveCSS('border-radius', '40px 40px 8px 8px');
    await expectToken(card, 'backgroundColor', '--invitation-subtle');
    await expect(page.locator(`#${id}`)).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  }
  const logo = page.locator('[data-wedding-footer] img');
  await expect(logo).toHaveCSS('filter', 'grayscale(1) brightness(0.3)');
  expect(await logo.evaluate(element => getComputedStyle(element).filter)).not.toContain('invert');

  fs.mkdirSync('/tmp/quickweds-full-theme-qa', { recursive: true });
  for (const id of ['rsvp', 'faq', 'gift']) {
    const section = page.locator(`#${id}`);
    for (const child of await section.locator('h2, h3, [data-wedding-card]').all()) {
      await child.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
    }
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await page.waitForTimeout(500);
    await section.screenshot({ path: `/tmp/quickweds-full-theme-qa/themed-${id}.png`, animations: 'disabled', style: '[data-wedding-navigation], nextjs-portal { visibility: hidden !important; }' });
  }
});

for (const baroqueMotif of [undefined, '#f4e9bf']) {
  test(`baroque program copy contrasts with dark silk for ${baroqueMotif || 'default motif'}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWeddingPage(page, 'royal', {
      template_style: 'reference-14', motif_color: baroqueMotif || '',
    });
    const program = page.locator('#timeline');
    const backgrounds = await program.evaluate(element => {
      const colors = getComputedStyle(element).backgroundImage.match(/(?:rgba?|color)\([^)]*\)|#[0-9a-f]{6}/gi) || [];
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d')!;
      return colors.map(color => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const pixel = context.getImageData(0, 0, 1, 1).data;
        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      });
    });
    expect(backgrounds.length).toBeGreaterThan(0);
    for (const selector of ['li p', 'li time']) {
      const text = program.locator(selector).first();
      const color = await text.evaluate(element => getComputedStyle(element).color);
      await expect(text).toHaveCSS('color', 'rgb(255, 250, 240)');
      for (const background of backgrounds) expect(contrast(color, background), `${selector} against silk stop ${background}`).toBeGreaterThanOrEqual(4.5);
    }
    await expect(page.locator('[data-wedding-footer] img')).toHaveCSS('filter', 'grayscale(1) brightness(0.3)');
  });
}
