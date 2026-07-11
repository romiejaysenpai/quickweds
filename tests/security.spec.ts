import { expect, test } from '@playwright/test';

test.describe('Side-effecting endpoints', () => {
  test('planner reminder cron fails closed without authorization', async ({ request }) => {
    const response = await request.get('/api/planner/event-reminders');

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  test('thank-you delivery requires an authenticated owner', async ({ request }) => {
    const response = await request.post('/api/weddings/thank-you/send', {
      data: { weddingId: 'test-wedding' },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'weddingId and authorization token are required',
    });
  });

  test('thank-you delivery rejects malformed note identifiers before querying data', async ({ request }) => {
    const response = await request.post('/api/weddings/thank-you/send', {
      headers: { Authorization: 'Bearer invalid-test-token' },
      data: { weddingId: 'test-wedding', noteId: 'not-a-uuid' },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'noteId must be a valid UUID' });
  });
});
