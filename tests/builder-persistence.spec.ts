import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Builder Data Persistence & Schema Columns', () => {
  test('planner load route must include all wedding builder fields in optional columns', () => {
    const routeFilePath = path.join(process.cwd(), 'src/app/api/planner/load/route.ts');
    const routeFileContent = fs.readFileSync(routeFilePath, 'utf-8');

    // Expected fields specifically reported by users
    const criticalUserFields = [
      'teaser_video',      // Save the Date (STD) video
      'wedding_party',     // Entourage
      'maps_link',         // Ceremony map link
      'reception_maps_link', // Reception map link
      'reception_venue_name',
      'reception_venue_address',
      'reception_venue_photos',
      'gallery_images',    // Gallery photos
      'payment_links',     // Payment links (GCash, PayPal, Maya, etc.)
      'rsvp_deadline',     // RSVP deadline date
      'gift_registry_links',
      'cash_funds',
      'gift_bank',
      'gift_account_name',
      'gift_account_number',
      'gift_qr_image',
      'couple_photo',
      'background_music_url',
      'background_music_title',
      'background_music_enabled',
      'dress_code',
      'program_timeline',
      'faq_items',
    ];

    for (const field of criticalUserFields) {
      expect(
        routeFileContent.includes(`'${field}'`),
        `Expected ${field} to be defined in route.ts optional columns`
      ).toBe(true);
    }
  });

  test('BuilderForm must safely parse array fields and preserve previews on save', () => {
    const builderFilePath = path.join(process.cwd(), 'src/components/BuilderForm.tsx');
    const builderContent = fs.readFileSync(builderFilePath, 'utf-8');

    // Verify readArrayField is used on all array fields when loading
    expect(builderContent).toContain('weddingParty: readArrayField(data.wedding_party)');
    expect(builderContent).toContain('registryLinks: readArrayField(data.gift_registry_links)');
    expect(builderContent).toContain('cashFunds: readArrayField(data.cash_funds)');
    expect(builderContent).toContain('paymentLinks: readArrayField(data.payment_links)');
    expect(builderContent).toContain('galleryImages: readArrayField(data.gallery_images) as string[]');
    expect(builderContent).toContain('receptionVenuePhotos: readArrayField(data.reception_venue_photos) as string[]');

    // Verify previews state is updated with persisted URLs and mediaFiles cleared on save
    expect(builderContent).toContain('updatedPreviews');
    expect(builderContent).toContain('teaserVideo: payload.teaser_video');
    expect(builderContent).toContain('galleryImages: payload.gallery_images');
  });

  test('BuilderForm teaser video UI must display when previews.teaserVideo is present', () => {
    const builderFilePath = path.join(process.cwd(), 'src/components/BuilderForm.tsx');
    const builderContent = fs.readFileSync(builderFilePath, 'utf-8');

    // UI condition should check previews.teaserVideo in addition to mediaFiles.teaserVideo
    expect(builderContent).toContain('mediaFiles.teaserVideo || previews.teaserVideo');
    expect(builderContent).toContain('video src={previews.teaserVideo}');
  });

  test('Monogram styles and animations must not show PRO marks to Pro users', () => {
    const builderFilePath = path.join(process.cwd(), 'src/components/BuilderForm.tsx');
    const builderContent = fs.readFileSync(builderFilePath, 'utf-8');

    // Ensure PRO badge on shapes is conditioned on !hasMonogramPro
    expect(builderContent).toContain('!hasMonogramPro && shape.pro &&');

    // Ensure PRO badge on animations is conditioned on !hasMonogramPro
    expect(builderContent).toContain("!hasMonogramPro && anim.id !== 'none' &&");

    // Ensure style/animation locked state respects hasMonogramPro
    expect(builderContent).toContain('const isLocked = !hasMonogramPro && shape.pro;');
    expect(builderContent).toContain("const isLocked = !hasMonogramPro && anim.id !== 'none';");

    // Ensure MonogramExporter receives hasMonogramPro
    expect(builderContent).toContain('isPro={hasMonogramPro}');
  });
});

