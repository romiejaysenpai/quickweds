type PhotoReminderEmailParams = {
    guestName?: string | null;
    coupleName: string;
    photoUploadUrl: string;
    weddingDate?: string | null;
};

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function getPhotoReminderEmailHtml({
    guestName,
    coupleName,
    photoUploadUrl,
    weddingDate,
}: PhotoReminderEmailParams) {
    const safeGuestName = escapeHtml((guestName || 'there').trim());
    const safeCoupleName = escapeHtml(coupleName);
    const safeUrl = escapeHtml(photoUploadUrl);
    const safeWeddingDate = weddingDate ? escapeHtml(weddingDate) : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Share your wedding photos</title>
</head>
<body style="margin:0; padding:0; background:#FFF8F9; font-family:Arial, sans-serif; color:#3D2E33;">
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background:#FFF8F9; padding:28px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="max-width:620px; background:#FFFFFF; border:1px solid #F1D8DD; border-radius:24px; overflow:hidden;">
                    <tr>
                        <td style="padding:34px 28px 22px; text-align:center;">
                            <p style="margin:0; color:#D16C78; font-size:11px; font-weight:800; letter-spacing:0.16em; text-transform:uppercase;">QuickWeds Photo Drop</p>
                            <h1 style="margin:14px 0 0; font-family:Georgia, serif; font-size:32px; line-height:1.15; color:#2F2327;">Share your favorite moments</h1>
                            <p style="margin:14px 0 0; font-size:15px; line-height:1.7; color:#7A5A61;">Hi ${safeGuestName}, ${safeCoupleName} would love to collect the photos and memories you captured${safeWeddingDate ? ` from ${safeWeddingDate}` : ''}.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 28px 28px; text-align:center;">
                            <a href="${safeUrl}" style="display:inline-block; background:#D16C78; color:#FFFFFF; text-decoration:none; font-weight:800; border-radius:14px; padding:15px 24px;">Upload Photos</a>
                            <p style="margin:18px 0 0; font-size:12px; line-height:1.6; color:#8A7278;">If the button does not work, copy and paste this link into your browser:</p>
                            <p style="margin:8px 0 0; word-break:break-all; font-size:12px; line-height:1.6; color:#D16C78;">${safeUrl}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
