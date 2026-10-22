import { test, expect } from '@playwright/test';

const verification = {
  wedding: { rsvp_allow_plus_ones: false, rsvp_allow_children: false, rsvp_events: [{ id: 'ceremony', name: 'Ceremony' }] },
  guest: { id: 'synthetic-guest', guestName: 'Synthetic Guest', guestEmail: 'guest@example.test', attendance: 'Yes', numGuests: 1, invitedGuestCount: 1, plusOneAllowed: false, householdMembers: [], eventResponses: [{ eventId: 'ceremony', attendance: 'Yes' }] },
};

test('secure RSVP link clears its fragment before verification and submits one guest when plus ones are disabled', async ({ page }) => {
  const networkUrls: string[] = [];
  let submitted: Record<string, unknown> | undefined;
  let verificationHash = 'not-checked';
  page.on('request', request => networkUrls.push(request.url()));
  await page.route('**/api/public/rsvp/access', async route => {
    verificationHash = await page.evaluate(() => location.hash);
    expect(route.request().postDataJSON()).toEqual({ action: 'verify', weddingId: 'wedding1', rsvpId: 'synthetic-guest', token: 'synthetic-private-token' });
    await route.fulfill({ json: verification });
  });
  await page.route('**/api/public/rsvp', async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ json: { success: true, rsvpId: 'synthetic-guest', manageRsvpUrl: '/rsvp/manage#synthetic-renewed-token' } });
  });
  // Block external telemetry and assets; exercise only the local UI and mocked APIs.
  await page.route(/^https:\/\//, route => route.abort());
  await page.goto('/rsvp/manage#weddingId=wedding1&rsvpId=synthetic-guest&token=synthetic-private-token');
  await expect(page.getByText('Synthetic Guest', { exact: true })).toBeVisible();
  expect(verificationHash).toBe('');
  expect(new URL(page.url()).hash).toBe('');
  expect(networkUrls.filter(url => url.includes('synthetic-private-token'))).toEqual([]);
  await expect(page.locator('input[type="email"]')).toHaveAttribute('readonly', '');
  await page.getByRole('button', { name: 'Submit RSVP' }).click();
  await expect(page.getByText('Thank You!', { exact: true })).toBeVisible();
  expect(submitted?.numGuests).toBe(1);
  expect(submitted?.accessToken).toBe('synthetic-private-token');
  expect(submitted?.rsvpId).toBe('synthetic-guest');
});

test('expired RSVP link shows recovery guidance without exposing private form', async ({ page }) => {
  await page.route('**/api/public/rsvp/access', route => route.fulfill({ status: 403, json: { error: 'This link is invalid or expired. Request a new link from the invitation.' } }));
  await page.route(/^https:\/\//, route => route.abort());
  await page.goto('/rsvp/manage#weddingId=wedding1&rsvpId=synthetic-guest&token=expired');
  await expect(page.locator('main').getByRole('alert')).toContainText('Request a new link');
  await expect(page.getByRole('button', { name: 'Submit RSVP' })).toHaveCount(0);
  expect(new URL(page.url()).hash).toBe('');
});
