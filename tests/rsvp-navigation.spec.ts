import { test, expect } from '@playwright/test';
import { mockWeddingPage } from './fixtures/wedding-preview';

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`RSVP First thank-you mode links to existing details at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockWeddingPage(page, 'rsvpfocus', { is_thank_you_mode: true });
    await expect(page.locator('#rsvp')).toHaveCount(0);
    await expect(page.locator('a[href="#rsvp"]')).toHaveCount(0);
    await page.getByRole('link', { name: 'Wedding Details', exact: true }).click();
    await expect(page.locator('#details')).toBeInViewport();
  });

  test(`RSVP First invitation reaches its RSVP form at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockWeddingPage(page, 'rsvpfocus');
    await page.getByRole('link', { name: 'RSVP Here', exact: true }).click();
    await expect(page.locator('#rsvp input').first()).toBeInViewport();
  });

  test(`invitation RSVP reaches the form on first click at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockWeddingPage(page, 'classic');
    await page.locator('a[href="#rsvp"]').first().click();
    await expect.poll(async () => page.locator('#rsvp').evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    })).toBe(true);
    await expect(page.locator('#rsvp input').first()).toBeInViewport();
  });
  test(`floating RSVP navigation reaches the form on first click at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockWeddingPage(page, 'classic');
    await page.evaluate(() => window.scrollTo(0, 250));
    await page.getByRole('navigation', { name: 'Wedding page sections' }).getByRole('button', { name: 'RSVP', exact: true }).click();
    await expect.poll(async () => page.locator('#rsvp').evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    })).toBe(true);
    await expect(page.locator('#rsvp input').first()).toBeInViewport();
  });
}
