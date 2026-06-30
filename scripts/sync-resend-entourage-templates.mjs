import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@rsvp.quickweds.site>';

if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY. Set it before syncing Resend templates.');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

const variables = [
  'INVITEE_NAME',
  'MEMBER_ROLE',
  'BRIDE_NAME',
  'GROOM_NAME',
  'WEDDING_DATE',
  'VENUE_NAME',
  'PERSONAL_MESSAGE',
  'ACCEPT_URL',
  'DECLINE_URL',
  'APP_NAME',
].map((key) => ({ key, type: 'string', fallbackValue: '' }));

function shell({ headline, intro, accent = '#C08081' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wedding Entourage Proposal</title>
</head>
<body style="margin:0;padding:0;background:#fbf7f5;color:#2f2726;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid rgba(192,128,129,0.18);box-shadow:0 24px 50px rgba(80,50,45,0.08);">
          <tr>
            <td style="padding:44px 36px 28px;text-align:center;background:${accent};color:#ffffff;">
              <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;">{{{APP_NAME}}}</p>
              <h1 style="margin:0;font-size:34px;line-height:1.18;font-weight:400;">${headline}</h1>
              <p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;opacity:0.9;">{{{BRIDE_NAME}}} &amp; {{{GROOM_NAME}}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:38px 42px 18px;">
              <p style="margin:0 0 18px;font-size:18px;line-height:1.7;">Dear {{{INVITEE_NAME}}},</p>
              <p style="margin:0 0 18px;font-size:17px;line-height:1.75;color:#695c59;">${intro}</p>
              <div style="margin:24px 0;padding:24px;border-radius:22px;background:#fbf7f5;border:1px solid rgba(192,128,129,0.16);">
                <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:${accent};">Your Role</p>
                <h2 style="margin:0;font-size:25px;font-weight:400;color:#2f2726;">{{{MEMBER_ROLE}}}</h2>
                <p style="margin:14px 0 0;font-size:16px;line-height:1.65;color:#695c59;">{{{PERSONAL_MESSAGE}}}</p>
              </div>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#695c59;">
                Wedding date: {{{WEDDING_DATE}}}<br />
                Venue: {{{VENUE_NAME}}}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 42px 42px;">
              <a href="{{{ACCEPT_URL}}}" style="display:inline-block;margin:6px;padding:16px 30px;background:${accent};color:#ffffff;text-decoration:none;border-radius:14px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;">Accept</a>
              <a href="{{{DECLINE_URL}}}" style="display:inline-block;margin:6px;padding:15px 28px;background:#ffffff;color:#695c59;text-decoration:none;border-radius:14px;border:1px solid rgba(105,92,89,0.24);font-family:Arial,sans-serif;font-size:15px;font-weight:700;">Decline</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const templates = [
  {
    name: 'QuickWeds Entourage Proposal - Heartfelt',
    alias: 'quickweds-entourage-heartfelt',
    subject: 'Will you be part of our wedding entourage?',
    html: shell({
      headline: 'Will you stand with us?',
      intro: 'We are getting ready for one of the most meaningful days of our lives, and we cannot imagine it without you close to us.',
    }),
  },
  {
    name: 'QuickWeds Entourage Proposal - Elegant',
    alias: 'quickweds-entourage-elegant',
    subject: 'An invitation to join our wedding entourage',
    html: shell({
      headline: 'A special invitation',
      intro: 'As we prepare for our wedding celebration, we would be honored to have you join our entourage in this special role.',
      accent: '#8E5E58',
    }),
  },
  {
    name: 'QuickWeds Entourage Proposal - Simple',
    alias: 'quickweds-entourage-simple',
    subject: 'Will you join our wedding entourage?',
    html: shell({
      headline: 'Will you join us?',
      intro: 'We would love for you to be part of our wedding entourage and share this day with us in a special way.',
      accent: '#6F8F87',
    }),
  },
];

for (const template of templates) {
  try {
    const request = resend.templates.create({
      ...template,
      from: FROM_EMAIL,
      variables,
    });
    const { data, error } = await request.publish();
    if (error) {
      console.error(`Failed to publish ${template.alias}:`, error);
      continue;
    }
    console.log(`Published ${template.alias}: ${data?.id || 'created'}`);
  } catch (error) {
    console.error(`Unable to sync ${template.alias}. If it already exists, update it in Resend or delete it before rerunning.`);
    console.error(error);
  }
}

