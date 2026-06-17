import { expect, test, type Page } from '@playwright/test';

const TEST_IMAGE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz8nYQAAAABJRU5ErkJggg==',
  'base64',
);

const disposableSettings = {
  disposable_camera_enabled: true,
  reveal_datetime: '2099-06-18T12:00:00.000Z',
  guest_name_required: true,
  allow_anonymous_uploads: false,
  require_approval: true,
  photo_limit_per_guest: 5,
  film_frame_enabled: true,
  nostalgic_ui_enabled: true,
  date_stamp_enabled: true,
  enabled_filter_ids: ['none', 'soft-film'],
};

async function mockDisposableCameraApis(page: Page) {
  let uploadCalled = false;

  await page.route('**/api/public/photos/test-wedding', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        wedding: {
          id: 'test-wedding',
          bride_name: 'Ava',
          groom_name: 'Noah',
        },
        photos: [],
        settings: disposableSettings,
        galleryHidden: true,
      }),
    });
  });

  await page.route('**/api/public/photos/validate-code', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        remainingUploads: 4,
        maxUploads: 5,
        currentUploads: 1,
      }),
    });
  });

  await page.route('**/api/public/photos/upload', async (route) => {
    uploadCalled = true;
    const body = route.request().postData() || '';
    expect(body).toContain('editMetadata');
    expect(body).toContain('soft-film');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  return {
    wasUploadCalled: () => uploadCalled,
  };
}

test.describe('Disposable Camera Mode', () => {
  test('lets phone guests capture, edit, and upload a disposable camera memory', async ({ page }) => {
    const api = await mockDisposableCameraApis(page);

    await page.goto('/w/test-wedding/photos?code=ROLL2026');

    await expect(page.locator('h1', { hasText: 'Disposable Camera' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Photo roll is developing')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Memories will be revealed on')).toBeVisible();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Capture Moments' }).click();
    const fileChooser = await fileChooserPromise;

    await expect(page.locator('input[type="file"]')).toHaveAttribute('capture', 'environment');
    await fileChooser.setFiles({
      name: 'memory.png',
      mimeType: 'image/png',
      buffer: TEST_IMAGE,
    });

    await expect(page.getByText('Edit your memory')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Soft Film' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Golden Hour' })).toHaveCount(0);
    await expect(page.getByText('Emoji')).toHaveCount(0);

    await page.getByRole('button', { name: 'Soft Film' }).click();
    await page.getByPlaceholder('Add a short caption on the photo').fill('Best night ever');
    await page.getByPlaceholder('Who are you?').fill('Mia');
    await expect(page.getByText('Roll: 1 / 5 memories used')).toBeVisible();

    await page.getByRole('button', { name: 'Add to Roll' }).click();

    await expect(page.getByRole('heading', { name: 'Memory added to the roll!' })).toBeVisible();
    await expect(page.getByText('Photo roll progress')).toBeVisible();
    await expect(page.getByText('2 / 5')).toBeVisible();
    expect(api.wasUploadCalled()).toBe(true);
  });

  test('keeps the normal photo portal free of disposable camera editing when mode is off', async ({ page }) => {
    await page.route('**/api/public/photos/test-wedding', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          wedding: {
            id: 'test-wedding',
            bride_name: 'Ava',
            groom_name: 'Noah',
          },
          photos: [],
          settings: {
            ...disposableSettings,
            disposable_camera_enabled: false,
            nostalgic_ui_enabled: false,
            film_frame_enabled: false,
          },
          galleryHidden: false,
        }),
      });
    });

    await page.goto('/w/test-wedding/photos?code=ROLL2026');

    await expect(page.locator('h1', { hasText: 'Ava & Noah' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Take Photo Now' })).toBeVisible({ timeout: 15000 });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Take Photo Now' }).click();
    const fileChooser = await fileChooserPromise;
    await expect(page.locator('input[type="file"]')).toHaveAttribute('capture', 'environment');
    await fileChooser.setFiles({
      name: 'memory.png',
      mimeType: 'image/png',
      buffer: TEST_IMAGE,
    });

    await expect(page.getByText('Edit your memory')).toHaveCount(0);
    await expect(page.getByText('Wedding filters')).toHaveCount(0);
  });
});
