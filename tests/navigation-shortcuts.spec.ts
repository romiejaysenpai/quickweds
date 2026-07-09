import { expect, test, type Page } from '@playwright/test';

const fixedNavClearance = 110;

async function expectSectionTarget(page: Page, id: string) {
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
  await expect.poll(
    async () => page.locator(`#${id}`).evaluate((section) => section.getBoundingClientRect().top),
    { timeout: 20_000 },
  ).toBeLessThan(fixedNavClearance);
  expect(await page.locator(`#${id}`).evaluate((section) => section.getBoundingClientRect().top)).toBeGreaterThan(70);
}

test('desktop landing navigation shortcuts reach their sections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  for (const [label, id] of [
    ['Features', 'features'],
    ['Pricing', 'pricing'],
    ['Contact', 'contact'],
  ] as const) {
    await page.locator('nav').getByRole('link', { name: label, exact: true }).click();
    await expectSectionTarget(page, id);
  }
});

test('mobile landing menu shortcuts reach their sections and close the menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  for (const [label, id] of [
    ['Features', 'features'],
    ['Pricing', 'pricing'],
    ['FAQ', 'faq'],
    ['Contact Support', 'contact'],
  ] as const) {
    const menuButton = page.getByRole('button', { name: 'Open navigation menu' });
    await menuButton.click();
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toBeVisible();
    await page.locator('#landing-mobile-menu').getByRole('link', { name: label, exact: true }).click();
    await expect(page.locator('#landing-mobile-menu')).toBeHidden();
    await expectSectionTarget(page, id);
  }
});
