import { expect, type Page } from '@playwright/test';

const imageData =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600"%3E%3Crect width="1200" height="1600" fill="%23f4d7c8"/%3E%3Ccircle cx="600" cy="620" r="260" fill="%23d16c78" opacity=".35"/%3E%3Cpath d="M260 1120c180-210 420-210 600 0" fill="none" stroke="%233a2a2d" stroke-width="32" stroke-linecap="round"/%3E%3C/svg%3E';

export function weddingForTemplate(template: string, overrides: Record<string, unknown> = {}) {
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

export async function mockWeddingPage(page: Page, template: string, overrides: Record<string, unknown> = {}) {
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
