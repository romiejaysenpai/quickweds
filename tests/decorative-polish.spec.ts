import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { REFERENCE_INVITATIONS } from '../src/lib/reference-invitations';
import { mockWeddingPage } from './fixtures/wedding-preview';

const artifacts = '/tmp/quickweds-decorative-polish-qa';
mkdirSync(artifacts, { recursive: true });
const ids = ['reference-01', 'reference-06', 'reference-14', 'reference-21', 'reference-29', 'reference-31', 'reference-39', 'reference-42', 'reference-48', 'reference-49'];

test('section borders and ornaments follow a changed builder motif', async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ids) {
    const reference = REFERENCE_INVITATIONS.find(item => item.id === id)!;
    const samples = [];
    for (const motif of ['#982f51', '#216b74']) {
      await mockWeddingPage(page, reference.templateId, { template_style: id, motif_color: motif, card_style: 'default' });
      const details = page.locator('#details');
      const result = await details.evaluate(element => {
        const style = getComputedStyle(element);
        const probe = document.createElement('i');
        probe.style.color = 'var(--invitation-border)';
        element.append(probe);
        const expected = getComputedStyle(probe).color;
        probe.remove();
        const heading = element.querySelector('h2')!;
        return { border: style.borderTopColor, expected, width: parseFloat(style.borderTopWidth), ornament: getComputedStyle(heading, '::after').content, animation: getComputedStyle(heading).animationName };
      });
      expect(result.width, id).toBeGreaterThan(0);
      expect(result.border, id).toBe(result.expected);
      expect(result.ornament, id).toBe('""');
      expect(result.animation, `${id} reduced motion`).toBe('none');
      samples.push(result.border);
    }
    expect(samples[0], `${id} section rule updates with motif`).not.toBe(samples[1]);
    await page.locator('#details h2').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${artifacts}/${id}-details.png` });
  }
});

test('new stationery borders preserve explicit builder card treatments', async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of ['reference-01', 'reference-29', 'reference-39', 'reference-42', 'reference-49']) {
    const reference = REFERENCE_INVITATIONS.find(item => item.id === id)!;
    for (const card of ['borderless_glass', 'arch_panel', 'editorial_rules']) {
      await mockWeddingPage(page, reference.templateId, { template_style: id, card_style: card, motif_color: '#216b74' });
      const cards = page.locator('#details [data-wedding-card]');
      expect(await cards.count()).toBeGreaterThan(0);
      for (const element of await cards.all()) {
        if (card === 'borderless_glass') await expect(element).toHaveCSS('border-top-width', '0px');
        if (card === 'arch_panel') await expect(element).toHaveCSS('border-top-left-radius', '40px');
        if (card === 'editorial_rules') await expect(element).toHaveCSS('border-left-width', '0px');
      }
    }
  }
});

test('decorated designs fit mobile and desktop with motion disabled', async ({ page }) => {
  test.setTimeout(240_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const designs = [
    ...ids.map(id => { const ref = REFERENCE_INVITATIONS.find(item => item.id === id)!; return { template: ref.templateId, style: id }; }),
    ...['editorial-romance', 'envelope-wax-seal', 'pearl-coastal', 'watercolor-meadow', 'velure-editorial', 'torn-paper-terracotta', 'love-letter', 'butter-blue', 'ribbon-romance'].map(template => ({ template, style: 'default' })),
  ];
  for (const design of designs) {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await mockWeddingPage(page, design.template, { template_style: design.style, card_style: 'default' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${design.template}/${design.style} width ${width}`).toBeLessThanOrEqual(2);
      const headings = page.locator('.wedding-template, .wedding-template *');
      const animations = await headings.evaluateAll(elements => elements.map(element => getComputedStyle(element).animationName).filter(name => /stationeryHeading|Arrival|PaperReveal/.test(name)));
      expect(animations, `${design.template}/${design.style} reduced motion`).toEqual([]);
      if (width === 320) {
        await page.locator('#timeline').scrollIntoViewIfNeeded();
        await page.waitForTimeout(900);
        await page.screenshot({ path: `${artifacts}/${design.style === 'default' ? design.template : design.style}-timeline.png` });
      }
    }
  }
});

test('title arrival finishes with fully visible content when motion is enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const design of [
    { template: 'envelope-wax-seal', style: 'reference-01' },
    { template: 'garden', style: 'reference-49' },
    { template: 'pearl-coastal', style: 'default' },
    { template: 'love-letter', style: 'default' },
  ]) {
    await mockWeddingPage(page, design.template, { template_style: design.style });
    const heading = page.locator('.wedding-template h1').first();
    await expect(heading).toBeVisible();
    const arrival = await heading.evaluate(element => {
      let current: Element | null = element;
      while (current) {
        const css = getComputedStyle(current);
        if (/Arrival/.test(css.animationName)) return { name: css.animationName, iterations: css.animationIterationCount };
        current = current.parentElement;
      }
      return null;
    });
    expect(arrival, design.style).not.toBeNull();
    expect(arrival?.iterations).toBe('1');
    await page.waitForTimeout(750);
    const visible = await heading.evaluate(element => {
      let current: Element | null = element;
      while (current && !current.classList.contains('wedding-template')) {
        if (Number(getComputedStyle(current).opacity) < 1) return false;
        current = current.parentElement;
      }
      return true;
    });
    expect(visible).toBe(true);
  }
});
