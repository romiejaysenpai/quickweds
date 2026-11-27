import { expect, test, type Page } from '@playwright/test';
import { escapedFields, layoutWeddingId, mockPlannerLayout } from './fixtures/planner-layout';

const website = 'https://ourwedding.example.test';
const connection = {
  id: layoutWeddingId,
  bride_name: 'Alexandra', groom_name: 'Christopher',
  wedding_date: '2027-12-18', wedding_time: '15:30', venue_name: 'A beautiful garden wedding venue',
  rsvp_deadline: '2027-11-18', motif_color: '#A35165',
  external_website_url: website, rsvp_page_enabled: false, planner_only: true,
};

async function mockConnection(page: Page, options: { canManage?: boolean; failSave?: boolean } = {}) {
  let saved = { ...connection };
  const patches: Record<string, unknown>[] = [];
  await page.route('**/api/planner/connection**', async route => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();
      patches.push(body);
      if (options.failSave) return route.fulfill({ status: 503, json: { error: 'Unable to save this connection. Please try again.' } });
      saved = { ...saved, bride_name: body.brideName, groom_name: body.groomName, external_website_url: body.externalWebsiteUrl, rsvp_page_enabled: body.rsvpPageEnabled };
    }
    return route.fulfill({ json: { wedding: saved, canManage: options.canManage ?? true } });
  });
  return patches;
}

for (const width of [320, 1280]) {
  test(`connection publishes saved RSVP links and stays contained at ${width}px`, async ({ page }) => {
    await mockPlannerLayout(page);
    const patches = await mockConnection(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/dashboard/${layoutWeddingId}/connection`);
    const publish = page.getByRole('checkbox', { name: /Enable public RSVP page/ });
    await expect(publish).toBeVisible();
    await expect(page.getByTitle('Copy QR link', { exact: true })).toHaveCount(0);
    await publish.check();
    await expect(page.getByTitle('Copy QR link', { exact: true })).toHaveCount(0);
    expect(await escapedFields(page)).toEqual([]);
    await page.getByRole('button', { name: 'Save connection', exact: true }).click();
    const preview = page.getByRole('link', { name: 'Preview guest RSVP page' });
    await expect(preview).toHaveAttribute('href', new RegExp(`/rsvp/${layoutWeddingId}$`));
    await expect(page.getByRole('link', { name: 'Open wedding website' })).toHaveAttribute('href', website);
    await expect(page.getByTitle('Copy QR link', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Connect your Canva RSVP button' })).toBeVisible();
    await page.screenshot({ path: `/tmp/quickweds-canva-connection-${width}.png`, fullPage: true });
    expect(patches[0]).toMatchObject({ weddingId: layoutWeddingId, externalWebsiteUrl: website, rsvpPageEnabled: true });
    expect(await escapedFields(page)).toEqual([]);
    await publish.uncheck();
    await page.getByRole('button', { name: 'Save connection', exact: true }).click();
    await expect(preview).toHaveCount(0);
    await expect(page.getByTitle('Copy QR link', { exact: true })).toHaveCount(0);
    expect(patches[1]).toMatchObject({ rsvpPageEnabled: false });
  });
}

test('external website gateway creates a private workspace and opens connection setup', async ({ page }) => {
  await mockPlannerLayout(page);
  await mockConnection(page);
  let created: Record<string, unknown> | undefined;
  await page.route('**/api/planner/workspace', async route => {
    created = route.request().postDataJSON();
    return route.fulfill({ json: { id: layoutWeddingId } });
  });
  await page.goto('/planner?goal=external');
  await page.getByLabel('First partner’s name').fill('Alexandra');
  await page.getByLabel('Second partner’s name').fill('Christopher');
  await page.getByLabel('Existing wedding website').fill(website);
  await page.getByRole('button', { name: 'Continue to RSVP setup' }).click();
  await expect(page).toHaveURL(new RegExp(`/dashboard/${layoutWeddingId}/connection$`));
  await expect(page.getByRole('heading', { name: 'Keep the wedding website you love' })).toBeVisible();
  expect(created).toMatchObject({ brideName: 'Alexandra', groomName: 'Christopher', mode: 'external', externalWebsiteUrl: website });
  expect(created?.requestId).toMatch(/^[0-9a-f-]{36}$/);
});

test('connection save failure preserves the draft and keeps the page unpublished', async ({ page }) => {
  await mockPlannerLayout(page);
  await mockConnection(page, { failSave: true });
  await page.goto(`/dashboard/${layoutWeddingId}/connection`);
  const name = page.getByLabel('First partner’s name');
  await name.fill('Alexandra Isabella');
  await page.getByRole('checkbox', { name: /Enable public RSVP page/ }).check();
  await page.getByRole('button', { name: 'Save connection', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to save this connection.' })).toHaveText('Unable to save this connection. Please try again.');
  await expect(name).toHaveValue('Alexandra Isabella');
  await expect(page.getByRole('checkbox', { name: /Enable public RSVP page/ })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Save connection', exact: true })).toBeEnabled();
  await expect(page.getByTitle('Copy QR link', { exact: true })).toHaveCount(0);
});

test('coordinator can view connection details but cannot change publishing', async ({ page }) => {
  await mockPlannerLayout(page);
  await mockConnection(page, { canManage: false });
  await page.goto(`/dashboard/${layoutWeddingId}/connection`);
  await expect(page.getByLabel('First partner’s name')).toBeDisabled();
  await expect(page.getByRole('checkbox', { name: /Enable public RSVP page/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Save connection', exact: true })).toHaveCount(0);
});

for (const width of [320, 1280]) {
  test(`standalone RSVP submits through the existing RSVP API at ${width}px`, async ({ page }) => {
    await mockPlannerLayout(page);
    let submission: Record<string, unknown> | undefined;
    await page.route('**/api/public/rsvp/page?**', route => route.fulfill({ json: { wedding: { ...connection, rsvp_page_enabled: true, rsvp_events: [], rsvp_allow_plus_ones: false, rsvp_allow_children: false, rsvp_search_guest_list: false } } }));
    await page.route('**/api/public/rsvp', async route => {
      submission = route.request().postDataJSON();
      return route.fulfill({ json: { success: true } });
    });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/rsvp/${layoutWeddingId}`);
    await expect(page.getByRole('heading', { name: 'Alexandra & Christopher' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to our wedding website' })).toHaveAttribute('href', `${website}/`);
    await page.getByPlaceholder('Enter your full name').fill('Synthetic Wedding Guest');
    expect(await escapedFields(page)).toEqual([]);
    await page.getByRole('button', { name: 'Submit RSVP', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Thank You!', exact: true })).toBeVisible();
    await page.screenshot({ path: `/tmp/quickweds-standalone-rsvp-${width}.png`, fullPage: true });
    expect(submission).toMatchObject({ weddingId: layoutWeddingId, guestName: 'Synthetic Wedding Guest', attendance: 'Yes', numGuests: 1 });
  });
}

test('private or unavailable public RSVP page does not render a form', async ({ page }) => {
  await mockPlannerLayout(page);
  await page.route('**/api/public/rsvp/page?**', route => route.fulfill({ status: 404, json: { error: 'This RSVP page is not available.' } }));
  await page.goto(`/rsvp/${layoutWeddingId}`);
  await expect(page.getByRole('heading', { name: 'RSVP page unavailable' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'This RSVP page is not available.' })).toHaveText('This RSVP page is not available.');
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Back to our wedding website' })).toHaveCount(0);
});

test('closed standalone RSVP hides its form and page is marked noindex', async ({ page }) => {
  await mockPlannerLayout(page);
  await page.route('**/api/public/rsvp/page?**', route => route.fulfill({ json: { wedding: { ...connection, rsvp_deadline: '2020-01-01' } } }));
  await page.goto(`/rsvp/${layoutWeddingId}`);
  await expect(page.getByRole('heading', { name: 'RSVPs have closed' })).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

for (const enabled of [true, false]) {
  test(`private QR kit shows valid links with RSVP ${enabled ? 'enabled' : 'disabled'}`, async ({ page }) => {
    await mockPlannerLayout(page);
    await page.route('**/api/wedding-day/settings?**', route => route.fulfill({ json: { wedding: { ...connection, rsvp_page_enabled: enabled } } }));
    await page.setViewportSize({ width: 375, height: 1000 });
    await page.goto(`/dashboard/${layoutWeddingId}/qr-kit`);
    await expect(page.getByRole('heading', { name: 'Event QR Codes' })).toBeVisible();
    const cards = page.locator('article');
    await expect(cards).toHaveCount(enabled ? 3 : 2);
    const websiteCard = cards.filter({hasText: 'Main guest website.'});
    await expect(websiteCard).toContainText(`${website}/`);
    await expect(websiteCard.getByRole('button', {name: 'Open', exact: true})).toBeVisible();
    const rsvp = cards.filter({hasText: 'Jump guests to RSVP.'});
    await expect(rsvp).toHaveCount(enabled ? 1 : 0);
    if (enabled) {
      await expect(rsvp).toContainText(`/rsvp/${layoutWeddingId}`);
      await expect(rsvp.getByRole('button', {name: 'Open', exact: true})).toBeVisible();
    }
    await expect(page.getByText('Guest photo portal.', {exact: true})).toHaveCount(0);
    expect(await escapedFields(page)).toEqual([]);
  });
}
