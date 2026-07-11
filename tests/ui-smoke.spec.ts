import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test.describe('Public UI smoke checks', () => {
  test('landing page is clean and usable on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = collectRuntimeErrors(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Plan, invite, and manage your wedding all in one place/i })).toBeVisible();
    await expect(page.locator('footer a[href="#"]')).toHaveCount(0);
    await expect(page.getByLabel('QuickWeds on Facebook')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('landing and reset states fit a mobile viewport without runtime errors', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const errors = collectRuntimeErrors(page);

    await page.goto('/');
    await expectNoHorizontalOverflow(page);

    await page.goto('/reset-password');
    await expect(page.getByRole('heading', { name: 'Reset link unavailable' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });
});
