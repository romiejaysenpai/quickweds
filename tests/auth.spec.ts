import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Sign Up/i);
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  });
});
