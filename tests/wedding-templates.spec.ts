import { expect, test, type Page } from '@playwright/test';
import { TEMPLATES, getTemplateStyleVariants } from '../src/lib/template-catalog';

const TEMPLATE_IDS = [...TEMPLATES.map(template => template.id), 'nordic', 'riviera'];
const VIEWPORTS = [
  { name: 'mobile-dark', width: 360, height: 800, colorScheme: 'dark' as const },
  { name: 'desktop-light', width: 1440, height: 900, colorScheme: 'light' as const },
];

const imageData =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600"%3E%3Crect width="1200" height="1600" fill="%23f4d7c8"/%3E%3Ccircle cx="600" cy="620" r="260" fill="%23d16c78" opacity=".35"/%3E%3Cpath d="M260 1120c180-210 420-210 600 0" fill="none" stroke="%233a2a2d" stroke-width="32" stroke-linecap="round"/%3E%3C/svg%3E';

function weddingForTemplate(template: string, overrides: Record<string, unknown> = {}) {
  return {
    id: `template-${template}`,
    public_slug: `template-${template}`,
    user_id: '11111111-1111-4111-8111-111111111111',
    bride_name: 'Amelia Rose',
    groom_name: 'Mateo James',
    wedding_date: '2027-06-20',
    wedding_time: '4:30 PM',
    venue_name: 'The Glass Garden Estate',
    venue_address: '123 Celebration Lane, Napa, CA',
    maps_link: 'https://maps.google.com/?q=The+Glass+Garden+Estate',
    story: 'We met on a rainy afternoon and have been finding sunshine together ever since.',
    quote: 'Together is our favorite place to be.',
    hero_image: imageData,
    couple_photo: imageData,
    teaser_video: '',
    gallery_images: JSON.stringify([imageData, imageData, imageData, imageData, imageData, imageData]),
    custom_domain: '',
    template,
    font_style: 'Elegant',
    motif_color: template === 'midnight' || template === 'royal' ? '#D6B87C' : '#D16C78',
    dress_code: 'Formal garden attire||Blush, sage, champagne',
    contact_person: 'Lena, Wedding Coordinator',
    hashtag: 'AmeliaAndMateo',
    rsvp_deadline: '2027-05-01',
    program_timeline: '4:30 PM - Ceremony\n5:30 PM - Cocktails\n7:00 PM - Dinner\n8:30 PM - Dancing',
    faq_items: JSON.stringify([
      { question: 'Can I bring a plus one?', answer: 'Please refer to the names listed on your invitation.' },
      { question: 'Is parking available?', answer: 'Yes, valet and self-parking are available at the venue.' },
    ]),
    invitation_image: imageData,
    accent_style: 'none',
    logo_initials: 'AM',
    logo_shape: 'circle',
    logo_color: '',
    logo_font: 'serif',
    gift_bank: 'QuickWeds Bank',
    gift_account_name: 'Amelia Rose and Mateo James',
    gift_account_number: '1234 5678 9012',
    gift_qr_image: imageData,
    gift_registry_links: JSON.stringify([{ title: 'Home Registry', url: 'https://example.com/registry' }]),
    cash_funds: JSON.stringify([{ title: 'Honeymoon Fund', description: 'A little help for our first adventure.', targetAmount: 5000, current: 1200, currency: '$' }]),
    payment_links: JSON.stringify([{ label: 'PayPal', url: 'https://example.com/pay' }]),
    is_premium: true,
    payment_status: 'paid',
    plan_type: 'pro',
    wedding_party: JSON.stringify([{ name: 'Lena Park', role: 'Maid of Honor', bio: 'Best friend and dance floor captain.' }]),
    include_entourage_section: true,
    spotify_playlist_url: 'https://open.spotify.com/',
    is_save_the_date: false,
    is_thank_you_mode: false,
    thank_you_message: '',
    photo_album_link: '',
    voice_greeting_url: '',
    couple_email: 'couple@example.com',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

async function mockWeddingPage(page: Page, template: string, overrides: Record<string, unknown> = {}) {
  const wedding = weddingForTemplate(template, overrides);
  if (!page.url().includes('/preview')) await page.goto('/preview?preview=qa', { waitUntil: 'domcontentloaded' });
  await page.evaluate((wedding) => {
    window.sessionStorage.setItem(`quickweds_entrance_seen_${wedding.id}`, '1');
    window.sessionStorage.setItem('quickweds-builder-preview:qa', JSON.stringify({
      type: 'UPDATE_PREVIEW', wedding, gallery: JSON.parse(wedding.gallery_images), previewRevision: 1,
    }));
  }, wedding);
  await page.route('**/api/public/guest-book**', route => route.fulfill({ json: { entries: [] } }));
  await page.route('**/www.google.com/maps**', route => route.fulfill({ body: '', contentType: 'text/html' }));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#details')).toHaveCount(1);
}

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
    await mockWeddingPage(page, 'moonlit', { template_style: 'moonlit_v3' });
    await page.route('**/api/public/rsvp', route => route.fulfill({ json: { success: true } }));
    await page.route('**/api/analytics/track', route => route.fulfill({ json: { ok: true } }));
    const rsvp = page.locator('#rsvp');
    await rsvp.getByPlaceholder('Enter your full name').fill('Guest Example');
    await rsvp.getByPlaceholder('For your confirmation').fill('guest@example.com');
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
