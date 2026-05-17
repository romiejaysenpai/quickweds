import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/QuickWeds/i);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/QuickWeds/i);
    await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
  });
});
