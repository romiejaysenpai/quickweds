import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('google-logo')).toBeVisible();
    await expect(page).toHaveTitle(/QuickWeds/i);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/QuickWeds/i);
    await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
  });

  test('landing create-site action goes directly to login while signed out', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: /Free Site/i }).click();
    await expect(page).toHaveURL(/\/login\?next=%2Fbuilder/);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });
});
