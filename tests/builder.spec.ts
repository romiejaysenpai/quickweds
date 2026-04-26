import { test, expect } from '@playwright/test';

test.describe('Wedding Builder', () => {
  test('should load the builder steps', async ({ page }) => {
    // Note: This test assumes the user is logged in or can access the builder
    await page.goto('/builder');
    
    // Check if the first step is active
    await expect(page.getByText(/Wedding Details/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Sarah/i)).toBeVisible(); // Bride Name
    
    // Check if "Next" button is visible
    await expect(page.getByRole('button', { name: /Next/i })).toBeVisible();
  });

  test('should show floating preview button on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/builder');
    
    // The smartphone icon button should be visible
    const previewToggle = page.locator('button:has(svg.lucide-smartphone)');
    await expect(previewToggle).toBeVisible();
  });
});
