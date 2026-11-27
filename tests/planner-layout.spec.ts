import { expect, test } from '@playwright/test';
import { escapedFields, layoutWeddingId, mockPlannerLayout } from './fixtures/planner-layout';

for (const width of [320, 375, 768, 1024, 1280, 1440]) {
  test(`budget fields stay inside their cards at ${width}px`, async ({ page }) => {
    await mockPlannerLayout(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/dashboard/${layoutWeddingId}/planner?tab=budget`);
    await expect(page.getByRole('heading', { name: 'Budget Tracker', exact: true })).toBeVisible();
    const amount = page.getByRole('spinbutton', { name: 'Whole wedding budget amount' });
    await expect(amount).toHaveValue('280000');
    expect(await escapedFields(page)).toEqual([]);
    const card = page.getByText('Whole Wedding Budget', { exact: true }).locator('..');
    const amountBox = await amount.boundingBox();
    const cardBox = await card.boundingBox();
    expect(amountBox!.x + amountBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width - 8);
    const actions = page.getByRole('button', { name: 'Delete budget item', exact: true });
    await expect(actions).toHaveCount(1);
    expect(await actions.evaluate(button => {
      const row = button.parentElement!.parentElement!;
      return row.scrollWidth - row.clientWidth;
    })).toBeLessThanOrEqual(2);
    await page.getByRole('button', { name: 'Budget currency', exact: true }).click();
    const menu = page.getByRole('listbox', { name: 'Budget currencies' });
    await expect(menu).toBeVisible();
    const menuBox = await menu.boundingBox();
    expect(menuBox!.x).toBeGreaterThanOrEqual(0);
    expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Close currency selector' }).click();
  });
}

for (const width of [375, 1024, 1280]) {
  test(`planner forms stay contained at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await mockPlannerLayout(page);
    await page.setViewportSize({ width, height: 1000 });
    for (const tab of ['overview', 'checklist', 'calendar', 'food', 'vendors', 'seating', 'photos', 'honeymoon']) {
      await test.step(tab, async () => {
        await page.goto(`/dashboard/${layoutWeddingId}/planner?tab=${tab}`);
        await expect(page.getByRole('heading', { name: 'Wedding Planner', exact: true })).toBeVisible();
        await expect(page.locator('input,select,textarea').first()).toBeVisible();
        expect(await escapedFields(page), tab).toEqual([]);
        if (tab === 'photos') {
          const copy = page.getByTitle('Copy QR link', { exact: true });
          await expect(copy).toBeVisible();
          expect(await copy.evaluate(button => button.parentElement!.scrollWidth - button.parentElement!.clientWidth)).toBeLessThanOrEqual(2);
        }
      });
    }
    for (const route of ['wedding-day', 'check-in', 'planner/check-in']) {
      await test.step(route, async () => {
        await page.goto(`/dashboard/${layoutWeddingId}/${route}`);
        await expect(page.locator('form').first()).toBeVisible();
        expect(await escapedFields(page), route).toEqual([]);
      });
    }
  });
}

for (const width of [375, 1280, 1440]) {
  test(`collaborator invite fits its dashboard card at ${width}px`, async ({ page }) => {
    await mockPlannerLayout(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/dashboard/${layoutWeddingId}`);
    if (width < 640) await page.getByRole('button', { name: 'Team', exact: true }).click();
    const email = page.getByPlaceholder('partner@example.com');
    await expect(email).toBeVisible();
    await email.fill('a.long.partner.address@example.test');
    expect(await escapedFields(page)).toEqual([]);
    const invite = page.getByRole('button', { name: 'Invite', exact: true });
    expect(await invite.evaluate(button => button.parentElement!.scrollWidth - button.parentElement!.clientWidth)).toBeLessThanOrEqual(2);
  });
}
