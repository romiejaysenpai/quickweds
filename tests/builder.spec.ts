import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error: Error) => errors.push(error.message));
  return errors;
}

test.describe('Wedding Builder', () => {
  test('should protect the builder behind login', async ({ page }) => {
    const errors = collectRuntimeErrors(page);
    await page.goto('/builder');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('should keep the protected builder login usable on mobile', async ({ page }) => {
    const errors = collectRuntimeErrors(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/builder');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByPlaceholder('hello@example.com')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
