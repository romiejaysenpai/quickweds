import { expect, test, type Page } from '@playwright/test';
import { weddingForTemplate } from './fixtures/wedding-preview';
import { REFERENCE_INVITATIONS } from '../src/lib/reference-invitations';
import { TEMPLATES } from '../src/lib/template-catalog';

const key = 'quickweds-builder-preview:entrance-qa';
const weddingId = 'entrance-qa';
const entrance = '[data-wedding-entrance]';

async function preview(page: Page, wedding: ReturnType<typeof weddingForTemplate>, hash = '') {
  await page.addInitScript(({ key, wedding }) => {
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, JSON.stringify({ type: 'UPDATE_PREVIEW', wedding, previewRevision: 1 }));
    }
  }, { key, wedding });
  await page.route('**/api/**', route => route.fulfill({ json: { entries: [] } }));
  await page.route('**/www.google.com/maps**', route => route.fulfill({ body: '', contentType: 'text/html' }));
  await page.goto(`/preview?preview=entrance-qa${hash}`);
  await expect(page.locator('.wedding-template h1').first()).toBeVisible();
}

const designs = [
  ...TEMPLATES.map(({ id, accent }) => ({ template: id, style: 'default', accent })),
  { template: 'nordic', style: 'default', accent: '#59736a' },
  { template: 'riviera', style: 'default', accent: '#537691' },
  ...REFERENCE_INVITATIONS.map(({ id, templateId, accent }) => ({ template: templateId, style: id, accent })),
];

for (let offset = 0; offset < designs.length; offset += 20) {
  test(`invitation entrances follow the active template and theme (${offset + 1}–${Math.min(offset + 20, designs.length)})`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 760 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await preview(page, weddingForTemplate('classic', { id: weddingId }));
    const opening = page.locator(entrance);
    let revision = 1;

    for (const { template, style, accent } of designs.slice(offset, offset + 20)) {
      await test.step(`${template}/${style}`, async () => {
        const wedding = weddingForTemplate(template, { id: weddingId, template_style: style, motif_color: accent, font_style: 'Traditional' });
        await page.evaluate(({ wedding, revision }) => {
          window.postMessage({ type: 'UPDATE_PREVIEW', wedding, previewRevision: revision }, location.origin);
        }, { wedding, revision: ++revision });
        await expect(page.locator('.wedding-template')).toHaveAttribute('data-template', template);
        await expect(page.locator('.wedding-template')).toHaveAttribute('data-template-style', style);
        await page.evaluate(() => window.dispatchEvent(new Event('quickweds:replay-entrance')));
        await expect(opening).toHaveJSProperty('open', true);
        const openButton = opening.getByRole('button', { name: 'Open invitation', exact: true });
        await expect(opening.getByRole('heading')).toContainText(wedding.bride_name);
        const colors = await openButton.evaluate(button => {
          const root = button.closest('.wedding-page')!;
          const themedAccent = getComputedStyle(root).getPropertyValue(
            root.hasAttribute('data-invitation-style') ? '--invitation-action' : '--builder-action'
          ).trim();
          const sample = document.createElement('span');
          sample.style.backgroundColor = themedAccent;
          button.append(sample);
          const values = { action: getComputedStyle(button).backgroundColor, expected: getComputedStyle(sample).backgroundColor };
          sample.remove();
          return values;
        });
        expect(colors.action).toBe(colors.expected);
        await openButton.press('Enter');
        await expect(opening).toHaveCount(0);
      });
    }
  });
}

test('customized gate opens onto the same wedding page and remembers the visit', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 });
  const wedding = weddingForTemplate('garden', {
    id: weddingId,
    template_style: 'reference-37',
    bride_name: 'Alexandria Isabella Rose',
    groom_name: 'Christopher Alexander James',
    motif_color: '#365b49',
    background_style: 'linen',
    font_style: 'Modern',
  });
  await preview(page, wedding);
  const opening = page.locator(entrance);
  await expect(opening).toHaveAttribute('data-entrance-variant', 'arch-doors');
  await expect(opening).toHaveJSProperty('open', true);
  const card = opening.locator('[data-entrance-surface]').last();
  await expect(card).toHaveCSS('background-color', 'rgb(250, 249, 246)');
  const title = opening.getByRole('heading');
  const hero = page.locator('.wedding-template h1').first();
  expect(await title.evaluate(el => getComputedStyle(el).fontFamily)).toBe(await hero.evaluate(el => getComputedStyle(el).fontFamily));
  expect(await opening.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  const pageHeading = await hero.elementHandle();
  const gate = opening.locator('[data-entrance-surface]').first();
  await opening.getByRole('button', { name: 'Open invitation', exact: true }).click();
  await expect(gate).toHaveCSS('transform', /matrix3d/);
  await expect(opening).toHaveCount(0);
  expect(await pageHeading?.evaluate(element => element.isConnected)).toBe(true);
  await expect(hero).toContainText(wedding.bride_name);
  await expect(page.locator('#rsvp')).toHaveCount(1);
  await page.reload();
  await expect(hero).toBeVisible();
  await expect(opening).toHaveCount(0);
});

test('a direct RSVP link bypasses the opening, and replay can skip animation', async ({ page }) => {
  await preview(page, weddingForTemplate('envelope-wax-seal', { id: weddingId }), '#rsvp');
  const opening = page.locator(entrance);
  await expect(page.locator('#rsvp')).toHaveCount(1);
  await expect(opening).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event('quickweds:replay-entrance')));
  await expect(opening).toHaveAttribute('data-entrance-variant', 'envelope');
  await opening.getByRole('button', { name: 'Skip animation' }).click();
  await expect(opening).toHaveCount(0);
});
