import { expect, test, type Locator, type Page } from '@playwright/test';
import { TEMPLATES } from '../src/lib/template-catalog';
import { REFERENCE_INVITATIONS } from '../src/lib/reference-invitations';
import { mockWeddingPage } from './fixtures/wedding-preview';

const custom = {
  bride_name: 'Avery Celeste', groom_name: 'Jordan Quinn',
  story: 'Our custom story began beside the lighthouse in September.',
  quote: 'Every adventure leads us home to each other.',
  venue_name: 'Ceremony Orchard', venue_address: '17 Orchard Walk',
  reception_venue_name: 'Reception Conservatory', reception_venue_address: '29 Conservatory Road',
  reception_maps_link: 'https://maps.google.com/?q=Reception+Conservatory',
  contact_person: 'Morgan, our custom coordinator', hashtag: 'AveryAndJordanForever',
  program_timeline: '3:00 PM - Custom orchard ceremony\n6:00 PM - Custom conservatory dinner',
  motif_color: '#224466', background_style: 'white', font_style: 'Modern',
  section_title_font_style: 'romantic-script', section_title_color_style: 'rose-gold',
  card_style: 'arch_panel', gallery_layout: 'horizontal',
  background_music_enabled: false, background_music_url: '',
  rsvp_search_guest_list: false,
  dress_code: JSON.stringify({ v: 3,
    sponsors: { attire: 'Sponsor evening attire', color: '#657a54', colors: ['#657a54'], notes: 'Sponsor custom notes' },
    guests: { attire: 'Guest garden attire', color: '#c87892', colors: ['#c87892'], notes: 'Guest custom notes' },
    bridesmaids: { attire: 'Bridesmaid silk dresses', color: '#8b5575', colors: ['#8b5575'], notes: 'Bridesmaid custom notes' },
  }),
};

async function matchesFont(locator: Locator, token: string) {
  const styles = await locator.evaluate((element, token) => {
    const probe = document.createElement('span');
    probe.style.setProperty('font-family', `var(${token})`, 'important');
    element.parentElement!.appendChild(probe);
    const expected = getComputedStyle(probe).fontFamily;
    probe.remove();
    return { actual: getComputedStyle(element).fontFamily, expected };
  }, token);
  expect(styles.actual).toBe(styles.expected);
}

async function checkContract(page: Page, template: string, templateStyle = 'default') {
  await test.step(`${template} / ${templateStyle}`, async () => {
    await mockWeddingPage(page, template, { ...custom, template_style: templateStyle });
    const root = page.locator('.wedding-page');
    await expect(root).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const detailsPaper = await page.locator('#details').evaluate(element => {
      let current: Element | null = element;
      while (current) {
        const background = getComputedStyle(current).backgroundColor;
        if (background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') return background;
        current = current.parentElement;
      }
      return '';
    });
    expect(detailsPaper).toBe('rgb(255, 255, 255)');
    await matchesFont(page.locator('h1').first(), '--font-serif');
    await expect(page.locator('h1').first()).toHaveCSS('font-family', /montserrat/i);
    await matchesFont(page.locator('#details h2').first(), '--font-script');
    await expect(page.locator('#details h2').first()).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    expect(await page.locator('#details h2').first().evaluate(element => getComputedStyle(element).backgroundImage)).toContain('linear-gradient');
    await expect(page.locator('#details [data-wedding-card]').first()).toHaveCSS('border-radius', '40px 40px 8px 8px');
    await expect(page.locator('#gallery')).toHaveCount(1);
    await expect(page.locator('#gallery .overflow-x-auto')).toHaveCount(1);
    expect(await page.locator('#gallery button').count()).toBeGreaterThanOrEqual(6);
    for (const value of [custom.bride_name, custom.groom_name, custom.story, custom.quote,
      custom.venue_name, custom.venue_address, custom.reception_venue_name,
      custom.reception_venue_address, custom.contact_person, custom.hashtag,
      'Custom orchard ceremony', 'Custom conservatory dinner',
      'Guest garden attire', 'Sponsor evening attire', 'Bridesmaid silk dresses',
      'Guest custom notes', 'Sponsor custom notes', 'Bridesmaid custom notes',
      'Home Registry', 'Honeymoon Fund', 'Lena Park']) {
      await expect(root, `${template}/${templateStyle} preserves ${value}`).toContainText(value);
    }
    await expect(page.locator('#rsvp input[type="email"]')).toHaveCount(1);
    await expect(page.locator('#faq')).toContainText('Can I bring a plus one?');
    await expect(page.locator('.wedding-template audio')).toHaveCount(0);
    expect(await root.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
  });
}

for (let start = 0; start < TEMPLATES.length; start += 10) {
  const templates = TEMPLATES.slice(start, start + 10);
  test(`builder contract: native templates ${start + 1}–${start + templates.length}`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const template of templates) await checkContract(page, template.id);
  });
}

for (let start = 0; start < REFERENCE_INVITATIONS.length; start += 10) {
  const references = REFERENCE_INVITATIONS.slice(start, start + 10);
  test(`builder contract: reference styles ${start + 1}–${start + references.length}`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const reference of references) await checkContract(page, reference.templateId, reference.id);
  });
}

test('builder contract: composed variations and desktop', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const variation of ['v2', 'v3', 'v4', 'v5']) await checkContract(page, 'minimal', variation);
});

test('thank-you visibility settings apply to legacy, composed, stationery and reference pages', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [template, style] of [['classic', 'default'], ['minimal', 'v2'], ['love-letter', 'default'], ['elopement', 'reference-06'], ['pearl-coastal', 'reference-46']]) {
    await test.step(`${template}/${style}: disabled then enabled memories`, async () => {
      const overrides = { ...custom, template_style: style, is_thank_you_mode: true,
        thank_you_message: 'Our heartfelt custom thanks for sharing our day.' };
      await mockWeddingPage(page, template, { ...overrides,
        show_photos_in_thank_you_mode: false, show_guestbook_in_thank_you_mode: false });
      await expect(page.locator('#gallery')).toHaveCount(0);
      await expect(page.locator('#guestbook')).toHaveCount(0);
      await expect(page.locator('#rsvp')).toHaveCount(0);
      await expect(page.locator('#memories')).toContainText(overrides.thank_you_message);
      await mockWeddingPage(page, template, { ...overrides,
        show_photos_in_thank_you_mode: true, show_guestbook_in_thank_you_mode: true });
      await expect(page.locator('#gallery')).toHaveCount(1);
      await expect(page.locator('#guestbook')).toHaveCount(1);
    });
  }
});

test('customized representative pages remain readable on mobile and desktop', async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [template, style] of [['classic', 'default'], ['luxury', 'default'], ['editorial-romance', 'reference-40'], ['pearl-coastal', 'reference-46']]) {
      await mockWeddingPage(page, template, { ...custom, template_style: style });
      const prefix = `/tmp/quickweds-builder-visual-${width}-${template}-${style}`;
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${prefix}-hero.png` });
      const rsvp = page.locator('#rsvp');
      await rsvp.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${prefix}-rsvp.png` });
      for (const field of await rsvp.locator('input:not([type=hidden]), select, textarea').all()) {
        await expect(field).toHaveCSS('background-color', 'rgb(255, 255, 255)');
        const colors = await field.evaluate(element => {
          const luminance = (value: string) => {
            const rgb = value.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(channel => {
              const c = channel / 255;
              return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
            });
            return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
          };
          const foreground = luminance(getComputedStyle(element).color);
          const placeholder = luminance(getComputedStyle(element, '::placeholder').color);
          return { textContrast: 1.05 / (foreground + .05), placeholderContrast: 1.05 / (placeholder + .05) };
        });
        expect(colors.textContrast).toBeGreaterThanOrEqual(4.5);
        expect(colors.placeholderContrast).toBeGreaterThanOrEqual(4.5);
      }
      const submit = rsvp.getByRole('button', { name: 'Submit RSVP', exact: true });
      await expect(submit).toHaveCSS('background-color', 'rgb(34, 68, 102)');
      await expect(submit).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
  }
});

test('logo font selection does not redefine page fonts', async ({ page }) => {
  await mockWeddingPage(page, 'classic', { font_style: 'Modern', logo_font: '' });
  const initial = await page.locator('h1').first().evaluate(el => getComputedStyle(el).fontFamily);
  expect(initial).toMatch(/montserrat/i);
  await mockWeddingPage(page, 'classic', { font_style: 'Modern', logo_font: 'serif' });
  await expect(page.locator('h1').first()).toHaveCSS('font-family', initial);
  await mockWeddingPage(page, 'classic', { font_style: 'Modern', logo_font: 'montserrat' });
  await expect(page.locator('h1').first()).toHaveCSS('font-family', initial);
  await mockWeddingPage(page, 'classic', { font_style: 'Modern', logo_font: 'Romantic', logo_initials: 'AJ' });
  await expect(page.locator('h1').first()).toHaveCSS('font-family', initial);
  await matchesFont(page.locator('[data-wedding-footer] svg text').first(), '--font-script');
});


test('classic legacy variations and remaining legacy families honor custom settings', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const variation of ['v2', 'v3', 'v4', 'v5']) await checkContract(page, 'classic', variation);
  for (const template of ['nordic', 'riviera']) await checkContract(page, template);
});
