import { getEntourageCardTheme, type EntourageCardThemeKey } from './entourage-proposal-templates';

type EntourageProposalEmailInput = {
    inviteeName: string;
    role: string;
    coupleNames: string;
    weddingDate: string;
    venueName: string;
    title: string;
    message: string;
    acceptUrl: string;
    declineUrl: string;
    cardTheme?: EntourageCardThemeKey;
    heroImageUrl?: string | null;
};

const EMAIL_THEME_COLORS: Record<EntourageCardThemeKey, { accent: string; surface: string; text: string }> = {
    classic: { accent: '#8b5e3c', surface: '#fffaf0', text: '#3f2d20' },
    blush: { accent: '#be5b78', surface: '#fff5f7', text: '#521b2c' },
    emerald: { accent: '#18745d', surface: '#f1fbf7', text: '#123d32' },
    midnight: { accent: '#d6a74c', surface: '#18212f', text: '#f8fafc' },
    gold: { accent: '#ad7a12', surface: '#fff9e8', text: '#4b3505' },
};

function escapeHtml(value: string | null | undefined) {
    return String(value || '').replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
    }[character] || character));
}

/** Renders a self-contained email so each proposal can use its own title, theme, and header photo. */
export function getEntourageProposalEmailHtml(input: EntourageProposalEmailInput) {
    const themeKey = getEntourageCardTheme(input.cardTheme).key;
    const theme = EMAIL_THEME_COLORS[themeKey];
    const heroImage = input.heroImageUrl
        ? `<tr><td align="center" style="padding:28px 32px 0;background:${theme.surface};">
            <table role="presentation" cellspacing="0" cellpadding="0" style="border:2px solid #ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 28px rgba(47,39,38,0.22);">
              <tr><td><img src="${escapeHtml(input.heroImageUrl)}" alt="${escapeHtml(input.coupleNames)}" width="160" height="160" style="display:block;width:160px;height:160px;object-fit:cover;border:0;" /></td></tr>
            </table>
          </td></tr>`
        : '';

    return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f8f6f4;color:#302926;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f8f6f4;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;overflow:hidden;background:#ffffff;border:1px solid #e8dfda;border-radius:24px;">
        ${heroImage}
        <tr><td align="center" style="padding:38px 36px 28px;background:${theme.accent};color:#ffffff;">
          <p style="margin:0 0 11px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Wedding Entourage Proposal</p>
          <h1 style="margin:0;font-size:31px;line-height:1.15;font-weight:400;letter-spacing:-0.3px;">${escapeHtml(input.title)}</h1>
          <p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;">${escapeHtml(input.coupleNames)}</p>
        </td></tr>
        <tr><td style="padding:34px 40px 18px;">
          <p style="margin:0 0 18px;font-size:18px;line-height:1.65;">Dear ${escapeHtml(input.inviteeName)},</p>
          <div style="margin:0;padding:24px;border:1px solid ${theme.accent}33;border-radius:18px;background:${theme.surface};color:${theme.text};">
            <p style="margin:0 0 9px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:${theme.accent};">Your role</p>
            <h2 style="margin:0;font-size:24px;font-weight:400;">${escapeHtml(input.role)}</h2>
            <p style="margin:15px 0 0;font-size:16px;line-height:1.7;">${escapeHtml(input.message).replace(/\n/g, '<br />')}</p>
          </div>
          <p style="margin:22px 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#695c59;">Wedding date: ${escapeHtml(input.weddingDate)}<br />Venue: ${escapeHtml(input.venueName)}</p>
        </td></tr>
        <tr><td align="center" style="padding:20px 36px 40px;">
          <a href="${escapeHtml(input.acceptUrl)}" style="display:inline-block;margin:6px;padding:15px 27px;border-radius:12px;background:${theme.accent};color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.02em;text-decoration:none;">Accept</a>
          <a href="${escapeHtml(input.declineUrl)}" style="display:inline-block;margin:6px;padding:14px 25px;border:1px solid #d7cfca;border-radius:12px;background:#ffffff;color:#695c59;font-family:Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.02em;text-decoration:none;">Decline</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
