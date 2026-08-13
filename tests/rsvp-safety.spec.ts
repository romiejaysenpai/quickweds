import { expect, test } from '@playwright/test';

test.describe('public RSVP safety', () => {
  test('rejects malformed submissions before any database or email work', async ({ request }) => {
    const response = await request.post('/api/public/rsvp', {
      data: {
        weddingId: '',
        guestName: '',
        attendance: 'Definitely',
      },
    });

    expect(response.status()).toBe(400);
    await expect(response).not.toBeOK();
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('Wedding ID is required'),
    });
  });
});
