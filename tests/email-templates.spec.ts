import { expect, test } from '@playwright/test';
import {
  getCoupleNotificationHtml,
  getGuestConfirmationHtml,
  getGuestReminderHtml,
  getWelcomeEmailHtml,
} from '../src/lib/email-templates';

const baseProps = {
  guestName: 'Guest',
  brideName: 'Bride',
  groomName: 'Groom',
  weddingDate: 'January 1, 2027',
  weddingUrl: 'https://quickweds.site/w/example',
  attendance: 'Yes',
  numGuests: 2,
};

test.describe('Email template safety', () => {
  test('escapes RSVP fields and rejects unsafe links', () => {
    const attack = '<img src=x onerror="alert(1)">';
    const html = getGuestConfirmationHtml({
      ...baseProps,
      guestName: attack,
      venueName: attack,
      mapsLink: 'javascript:alert(1)',
      weddingUrl: 'javascript:alert(1)',
    });

    expect(html).not.toContain(attack);
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(html).not.toContain('href="javascript:');
  });

  test('escapes guest-supplied couple notification details', () => {
    const attack = '</p><script>alert(1)</script>';
    const html = getCoupleNotificationHtml({
      ...baseProps,
      guestName: attack,
      message: attack,
      dietaryDetails: attack,
      songRequest: attack,
      plusOneNames: [attack],
    });

    expect(html).not.toContain(attack);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('escapes reminder and welcome personalization', () => {
    const attack = '<strong>unexpected markup</strong>';
    const reminder = getGuestReminderHtml({ ...baseProps, guestName: attack });
    const welcome = getWelcomeEmailHtml(attack);

    expect(reminder).not.toContain(`Hi ${attack}`);
    expect(reminder).toContain('Hi &lt;strong&gt;unexpected markup&lt;/strong&gt;');
    expect(welcome).not.toContain(`Hi ${attack}`);
    expect(welcome).toContain('Hi &lt;strong&gt;unexpected markup&lt;/strong&gt;');
  });
});
