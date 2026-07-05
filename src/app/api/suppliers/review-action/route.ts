import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { isSupplierReviewAction, verifySupplierReviewAction } from '@/lib/supplier-review';
import {
    getSupplierOwnerEmail,
    sendSupplierApprovedEmail,
    sendSupplierRejectedEmail,
} from '@/lib/supplier-notifications';
import type { SupplierProfile } from '@/lib/suppliers';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limit';

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderReviewResult(title: string, message: string, status = 200) {
    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);

    return new NextResponse(
        `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${safeTitle} | QuickWeds</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #faf7f4; color: #34272b; }
    main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    section { max-width: 560px; width: 100%; background: #fff; border: 1px solid #eadeda; border-radius: 24px; padding: 32px; box-shadow: 0 24px 80px rgba(52, 39, 43, 0.08); }
    h1 { margin: 0 0 12px; color: #D16C78; font-size: 28px; }
    p { margin: 0 0 24px; line-height: 1.7; color: #6f6266; }
    a { display: inline-block; border-radius: 12px; background: #D16C78; color: white; padding: 13px 18px; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <section>
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
      <a href="/supplier/dashboard">Open Supplier Dashboard</a>
    </section>
  </main>
</body>
</html>`,
        {
            status,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store',
            },
        }
    );
}

export async function GET(req: NextRequest) {
    const rateLimit = createRateLimitMiddleware('SUPPLIER_REVIEW');
    const limited = await rateLimit.check(getClientIP(req));
    if (limited.limited) return limited.response;

    const params = req.nextUrl.searchParams;
    const supplierId = params.get('supplierId') || '';
    const action = params.get('action');
    const expires = params.get('expires') || '';
    const token = params.get('token') || '';

    if (!supplierId || !isSupplierReviewAction(action) || !expires || !token) {
        return renderReviewResult('Invalid Review Link', 'This supplier review link is missing required information.', 400);
    }

    const expiresAt = Number(expires);
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
        return renderReviewResult('Review Link Expired', 'This supplier review link has expired. Please review the listing from the admin dashboard.', 410);
    }

    try {
        if (!verifySupplierReviewAction(supplierId, action, expires, token)) {
            return renderReviewResult('Invalid Review Link', 'This supplier review link could not be verified.', 403);
        }

        const update = action === 'approve'
            ? { status: 'approved', is_active: true }
            : { status: 'rejected', is_active: false };

        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
            .from('supplier_profiles')
            .update({ ...update, updated_at: new Date().toISOString() })
            .eq('id', supplierId)
            .select('*')
            .single();

        if (error) throw error;

        const profile = data as SupplierProfile;
        const ownerEmail = await getSupplierOwnerEmail(db, profile);
        if (action === 'approve') {
            await sendSupplierApprovedEmail(profile, ownerEmail);
        } else {
            await sendSupplierRejectedEmail(profile, ownerEmail);
        }

        const businessName = data?.business_name || 'This supplier';
        const message = action === 'approve'
            ? `${businessName} has been approved and is now eligible to appear in the public supplier directory.`
            : `${businessName} was not approved and will not appear in the public supplier directory.`;

        return renderReviewResult(action === 'approve' ? 'Listing Approved' : 'Listing Not Approved', message);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to review supplier listing.';
        return renderReviewResult('Review Failed', message, 500);
    }
}
