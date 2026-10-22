import { expect, test, } from '@playwright/test';
import { mockWeddingPage } from './fixtures/wedding-preview';
import { TEMPLATES, getTemplateStyleVariants } from '../src/lib/template-catalog';

const TEMPLATE_IDS = [...TEMPLATES.map(template => template.id), 'nordic', 'riviera'];
const VIEWPORTS = [
  { name: 'mobile-dark', width: 360, height: 800, colorScheme: 'dark' as const },
  { name: 'desktop-light', width: 1440, height: 900, colorScheme: 'light' as const },
];

test.describe('complete wedding design catalogue', () => {
  for (const viewport of VIEWPORTS) {
    for (const template of TEMPLATE_IDS) {
      test(`${template}: every style at ${viewport.name}`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.setViewportSize(viewport);
        await page.emulateMedia({ colorScheme: viewport.colorScheme, reducedMotion: 'reduce' });
        const styles = getTemplateStyleVariants(template);
        for (const style of styles) {
          await test.step(style.id, async () => {
            await mockWeddingPage(page, template, { template_style: style.id });
            await expect(page.locator('.wedding-template')).toHaveAttribute('data-template-style', style.id);
            for (const id of ['details', 'rsvp', 'timeline', 'gallery', 'gift', 'faq', 'guestbook', 'venue', 'entourage', 'attire']) {
              await expect(page.locator(`#${id}`), `${template}/${style.id}: unique ${id}`).toHaveCount(1);
            }
            await expect(page.locator('.wedding-signature')).toHaveCount(1);
            // Do not let hidden horizontal overflow conceal broken component geometry.
            const overflow = await page.evaluate(() => {
              const root = document.querySelector('.wedding-template')!;
              return root.scrollWidth - root.clientWidth;
            });
            expect(overflow, `${template}/${style.id}: no horizontal overflow`).toBeLessThanOrEqual(2);
            expect(await page.locator('.wedding-page').evaluate(el => getComputedStyle(el).getPropertyValue('--color-white').trim())).toBe('#FFFFFF');
            await expect(page.locator('.wedding-template h1').first()).toBeVisible();
          });
        }
      });
    }
  }

  test('labeled mobile navigation reaches sections and closes More', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWeddingPage(page, 'midnight');
    await page.locator('#details').scrollIntoViewIfNeeded();
    const nav = page.getByRole('navigation', { name: 'Wedding page sections' });
    await expect(nav).toBeVisible();
    for (const label of ['Details', 'Directions', 'RSVP', 'More']) await expect(nav.getByRole('button', { name: label, exact: true })).toBeVisible();
    await nav.getByRole('button', { name: 'More', exact: true }).click();
    await page.locator('#wedding-navigation-more').getByRole('button', { name: 'Gallery', exact: true }).click();
    await expect(page.locator('#wedding-navigation-more')).toHaveCount(0);
    await expect(page.locator('#gallery')).toBeInViewport();
  });

  test('composition choices change the invitation layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const layouts: string[] = [];
    for (const variation of ['v2', 'v3', 'v4', 'v5']) {
      await mockWeddingPage(page, 'garden', { template_style: `garden_${variation}` });
      const hero = page.locator('.wedding-composed-hero');
      layouts.push(await hero.evaluate(el => {
        const style = getComputedStyle(el);
        const copy = el.querySelector('.wedding-composed-copy')!.getBoundingClientRect();
        const photo = el.querySelector('.wedding-composed-image');
        return JSON.stringify([style.display, style.gridTemplateColumns, Math.round(copy.x), Boolean(photo), el.querySelectorAll('img').length]);
      }));
    }
    expect(new Set(layouts).size).toBe(4);
  });

  test('supports no-photo and long-name invitations without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    for (const template_style of ['minimal_v2', 'minimal_v5']) {
      await mockWeddingPage(page, 'minimal', { template_style, hero_image: '', couple_photo: '', bride_name: 'Alexandria Isabella Rose', groom_name: 'Christopher Alexander James' });
      await expect(page.locator('.wedding-template h1')).toBeVisible();
      expect(await page.locator('.wedding-template').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(2);
    }
  });

  test('hides the entourage section when couples opt out', async ({ page }) => {
    await mockWeddingPage(page, 'classic', { include_entourage_section: false });
    await expect(page.locator('#entourage')).toHaveCount(0);
    await expect(page.getByText('Lena Park')).toHaveCount(0);
  });

  test('shared section titles remain readable in dark themes and browser modes', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const template of ['classic', 'midnight', 'celestial', 'moonlit']) {
      await mockWeddingPage(page, template);
      for (const id of ['details', 'guestbook', 'rsvp', 'faq']) {
        const heading = page.locator(`#${id} h2`).first();
        await heading.scrollIntoViewIfNeeded();
        await expect(heading).toBeInViewport();
        const colors: string[] = [];
        for (const colorScheme of ['light', 'dark'] as const) {
          await page.emulateMedia({ colorScheme });
          colors.push(await heading.evaluate(el => getComputedStyle(el).color));
        }
        expect(colors[0], `${template}/${id} keeps chosen palette`).toBe(colors[1]);
        const channels = colors[0].match(/[\d.]+/g)!.slice(0, 3).map(Number);
        const brightness = channels.reduce((total, channel) => total + channel, 0) / 3;
        if (template === 'classic') expect(brightness).toBeLessThan(140);
        else expect(brightness).toBeGreaterThan(200);
      }
    }
  });

  test('RSVP reply card shows its themed confirmation after a successful response', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWeddingPage(page, 'moonlit', { template_style: 'moonlit_v3', rsvp_search_guest_list: false });
    await page.route('**/api/public/rsvp', route => route.fulfill({ json: { success: true } }));
    await page.route('**/api/analytics/track', route => route.fulfill({ json: { ok: true } }));
    const rsvp = page.locator('#rsvp');
    await rsvp.getByPlaceholder('Enter your full name').fill('Guest Example');
    await rsvp.getByPlaceholder('For your RSVP confirmation').fill('guest@example.com');
    await rsvp.getByRole('button', { name: 'Submit RSVP', exact: true }).click();
    await expect(rsvp.getByRole('heading', { name: 'Thank You!' })).toBeVisible();
  });

  test('original templates without a photograph receive a written invitation', async ({ page }) => {
    test.setTimeout(60_000);
    for (const template of ['classic', 'royal', 'garden', 'heirloom', 'film']) {
      await mockWeddingPage(page, template, { hero_image: '', couple_photo: '' });
      await expect(page.locator('.wedding-composition')).toHaveAttribute('data-composition', 'v5');
      await expect(page.locator('.wedding-composed-hero h1')).toContainText('Amelia Rose');
      await expect(page.locator('.wedding-composed-hero img')).toHaveCount(0);
    }
  });

});
