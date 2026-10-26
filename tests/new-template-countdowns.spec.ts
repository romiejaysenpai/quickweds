import { expect, test } from '@playwright/test';
import { REFERENCE_INVITATIONS } from '../src/lib/reference-invitations';
import { mockWeddingPage } from './fixtures/wedding-preview';

test.use({ timezoneId: 'UTC' });

const nativeTemplates = [
  'editorial-romance', 'envelope-wax-seal', 'pearl-coastal',
  'watercolor-meadow', 'velure-editorial', 'torn-paper-terracotta',
  'love-letter', 'butter-blue', 'ribbon-romance',
];

test('every new invitation has a live countdown driven by the builder date', async ({ page }) => {
  test.setTimeout(180_000);
  await page.clock.install({ time: new Date('2030-06-20T16:29:30.000Z') });
  for (const design of [
    ...nativeTemplates.map(template => ({ template, templateStyle: 'default' })),
    ...REFERENCE_INVITATIONS.map(reference => ({ template: reference.templateId, templateStyle: reference.id })),
  ]) {
    await mockWeddingPage(page, design.template, {
      template_style: design.templateStyle,
      wedding_date: '2030-06-27',
      wedding_time: '4:30 PM',
      is_thank_you_mode: false,
    });
    const countdown = page.locator('#countdown');
    await expect(countdown, `${design.templateStyle} countdown`).toHaveCount(1);
    await expect(countdown).toBeVisible();
    await expect(countdown).toContainText(/Days/i);
    const text = (await countdown.textContent()) || '';
    expect(text, design.templateStyle).toMatch(/[1-9]\d*\s*Days/i);
  }
});

test('thank-you pages do not show an active wedding countdown', async ({ page }) => {
  for (const template of nativeTemplates) {
    await mockWeddingPage(page, template, { is_thank_you_mode: true });
    await expect(page.locator('#countdown'), template).toHaveCount(0);
  }
});


test('12-hour builder time counts down to the correct afternoon hour', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-06-20T16:29:30.000Z') });
  await mockWeddingPage(page, 'velure-editorial', {
    wedding_date: '2030-06-20', wedding_time: '4:30 PM',
  });
  const countdown = page.locator('#countdown');
  await expect(countdown).toBeVisible();
  await expect(countdown).toContainText(/Days/i);
  const text = (await countdown.textContent()) || '';
  expect(text).toMatch(/(?:[12]\d|30)\s*seconds/i);
});

test('reference calendars keep a visible live numeric countdown', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-06-20T16:29:50.000Z') });
  for (const reference of [REFERENCE_INVITATIONS[0], REFERENCE_INVITATIONS[30]]) {
    await mockWeddingPage(page, reference.templateId, {
      template_style: reference.id, wedding_date: '2030-06-20', wedding_time: '4:30 PM',
    });
    const section = page.locator('#countdown');
    const numbers = section.getByRole('timer', { name: 'Time until the wedding' });
    await expect(numbers).toBeVisible();
    await expect(numbers).toContainText(/seconds/i);
    const before = await numbers.textContent();
    await page.clock.runFor(2_000);
    const after = await numbers.textContent();
    expect(after).not.toBe(before);
    const calendar = section.locator('[class*="calendar"]').first();
    const numberBox = await numbers.boundingBox();
    const calendarBox = await calendar.boundingBox();
    expect(numberBox!.y + numberBox!.height).toBeLessThan(calendarBox!.y);
    await section.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `/tmp/${reference.id}-visible-countdown.png` });
  }
});

test('each reference pairs a distinct clock with its calendar treatment', async ({ page }) => {
  test.setTimeout(180_000);
  const treatments = new Map<string, string>();
  for (const reference of REFERENCE_INVITATIONS) {
    await mockWeddingPage(page, reference.templateId, {
      template_style: reference.id, wedding_date: '2030-06-27', wedding_time: '4:30 PM',
    });
    const treatment = await page.locator('#countdown').evaluate(section => {
      const timer = section.querySelector<HTMLElement>('[role="timer"]');
      const cell = timer?.querySelector<HTMLElement>('div');
      const calendar = section.querySelector<HTMLElement>('[class*="calendar"]');
      const mark = section.querySelector<HTMLElement>('[class*="selectedDay"]');
      if (!timer || !cell || !calendar || !mark) return null;
      const signature = (element: HTMLElement) => {
        const style = getComputedStyle(element);
        return [style.borderWidth, style.borderStyle, style.borderRadius, style.backgroundImage, style.backgroundColor].join('|');
      };
      return [signature(timer), signature(cell), signature(calendar), signature(mark)].join('::');
    });
    expect(treatment, `${reference.id} has a styled clock and calendar`).toBeTruthy();
    const duplicate = [...treatments.entries()].find(([, signature]) => signature === treatment)?.[0];
    expect(duplicate, `${reference.id} duplicates ${duplicate || 'another date treatment'}`).toBeUndefined();
    treatments.set(reference.id, treatment!);
  }
  expect(treatments.size).toBe(REFERENCE_INVITATIONS.length);
});

test('reference calendars show zero rather than hiding numbers after the wedding', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-06-20T16:29:50.000Z') });
  for (const reference of [REFERENCE_INVITATIONS[0], REFERENCE_INVITATIONS[30]]) {
    await mockWeddingPage(page, reference.templateId, {
      template_style: reference.id, wedding_date: '2030-06-19', wedding_time: '4:30 PM',
    });
    const section = page.locator('#countdown');
    await expect(section).toContainText('Our wedding day has arrived');
    const numbers = section.getByRole('timer', { name: 'Time until the wedding' });
    await expect(numbers).toBeVisible();
    await expect(numbers).toContainText(/00\s*seconds/i);
  }
});

test('builder date edits immediately recalculate the visible countdown', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-06-20T16:29:50.000Z') });
  for (const design of [
    { template: 'love-letter', style: 'default' },
    { template: REFERENCE_INVITATIONS[0].templateId, style: REFERENCE_INVITATIONS[0].id },
  ]) {
    await mockWeddingPage(page, design.template, {
      template_style: design.style, wedding_date: '2030-06-19', wedding_time: '4:30 PM',
    });
    await expect(page.locator('#countdown')).toContainText('Our wedding day has arrived');
    await mockWeddingPage(page, design.template, {
      template_style: design.style, wedding_date: '2030-06-27', wedding_time: '4:30 PM',
    });
    const countdown = page.locator('#countdown');
    await expect(countdown).toContainText(/[1-9]\d*\s*Days/i);
    await expect(countdown).not.toContainText('Our wedding day has arrived');
  }
});

test('native and shared clocks tick once per second', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-06-20T16:29:50.000Z') });
  for (const template of ['velure-editorial', 'love-letter']) {
    await mockWeddingPage(page, template, {
      wedding_date: '2030-06-20', wedding_time: '4:30 PM',
    });
    const countdown = page.locator('#countdown');
    await expect(countdown).toContainText(/seconds/i);
    const before = await countdown.textContent();
    await page.clock.runFor(2_000);
    const after = await countdown.textContent();
    expect(after, template).not.toBe(before);
  }
});
