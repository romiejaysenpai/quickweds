import { expect, test } from '@playwright/test';

test('mobile feature pills begin below the hero and fall below the Core Features heading', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const readLayout = async (scrollY: number) => {
    await page.evaluate((nextScrollY) => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, nextScrollY);
    }, scrollY);
    await page.waitForTimeout(50);

    return page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll<HTMLElement>('[data-qw-feature-pill]'));
      const hero = document.querySelector<HTMLElement>('main section');
      const eyebrow = document.querySelector<HTMLElement>('#features p');
      const heading = document.querySelector<HTMLElement>('#features h2');
      const firstCard = document.querySelector<HTMLElement>('.sticky-feature-stack article');
      const firstPillStyle = pills[0] ? getComputedStyle(pills[0]) : null;

      return {
        scrollY: window.scrollY,
        heroBottom: hero?.getBoundingClientRect().bottom ?? null,
        eyebrowTop: eyebrow?.getBoundingClientRect().top ?? null,
        headingTop: heading?.getBoundingClientRect().top ?? null,
        headingBottom: heading?.getBoundingClientRect().bottom ?? null,
        firstCardTop: firstCard?.getBoundingClientRect().top ?? null,
        animationName: firstPillStyle?.animationName ?? null,
        animationRange: firstPillStyle?.getPropertyValue('animation-range') ?? null,
        pills: pills.map((pill) => {
          const rect = pill.getBoundingClientRect();
          const style = getComputedStyle(pill);
          return {
            title: pill.dataset.qwFeaturePill,
            top: rect.top,
            bottom: rect.bottom,
            opacity: Number(style.opacity),
            animationRange: style.getPropertyValue('animation-range'),
          };
        }),
      };
    });
  };

  const initial = await readLayout(650);
  const falling = await readLayout(800);
  const settled = await readLayout(950);

  expect(initial.animationName).toBe('qw-feature-pill-fall-mobile');
  expect(initial.pills).toHaveLength(11);
  expect(new Set(initial.pills.map((pill) => pill.animationRange)).size).toBeGreaterThan(5);
  expect(Math.max(...initial.pills.map((pill) => pill.bottom))).toBeLessThan(initial.eyebrowTop ?? 0);
  expect(falling.pills[0].top).toBeGreaterThan(initial.pills[0].top);
  expect(Math.min(...settled.pills.map((pill) => pill.top))).toBeGreaterThan(settled.headingBottom ?? 0);
  expect((settled.firstCardTop ?? 0) - Math.max(...settled.pills.map((pill) => pill.bottom))).toBeLessThan(160);
  expect((settled.firstCardTop ?? 0) - Math.max(...settled.pills.map((pill) => pill.bottom))).toBeGreaterThan(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('desktop feature pills pause before beginning their scroll-linked fall', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const readTransform = async (scrollY: number) => {
    await page.evaluate((nextScrollY) => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, nextScrollY);
    }, scrollY);
    await page.waitForTimeout(50);

    return page.locator('[data-qw-feature-pill="Wedding Website"]').evaluate((pill) => ({
      transform: getComputedStyle(pill).transform,
      range: getComputedStyle(pill).getPropertyValue('animation-range'),
    }));
  };

  const beforePause = await readTransform(100);
  const afterPause = await readTransform(250);
  const falling = await readTransform(500);

  expect(beforePause.range).toBe('300px 1320px');
  expect(afterPause.transform).toBe(beforePause.transform);
  expect(falling.transform).not.toBe(afterPause.transform);
});
