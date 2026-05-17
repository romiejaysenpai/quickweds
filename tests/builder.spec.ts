import { test, expect } from '@playwright/test';

test.describe('Wedding Builder', () => {
  test('should protect the builder behind login', async ({ page }) => {
    await page.goto('/builder');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  test('should keep the protected builder login usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/builder');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByPlaceholder('hello@example.com')).toBeVisible();
  });
});
