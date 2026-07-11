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

  test('should show a safe recovery state without a reset token', async ({ page }) => {
    const response = await page.goto('/reset-password');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Reset link unavailable' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Request a new reset link' })).toHaveAttribute('href', '/forgot-password');
  });

  test('should protect account settings behind login', async ({ page }) => {
    await page.goto('/settings');

    await expect(page).toHaveURL(/\/login\?next=(?:%2F|\/)settings/);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });
});
