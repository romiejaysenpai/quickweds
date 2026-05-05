import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';

/**
 * GET /api/auth/check-admin
 * Secure server-side admin check
 */
export async function GET(req: NextRequest) {
    try {
        const { user, error } = await getRequestUser(req);

        if (error || !user?.email) {
            console.log('Admin check — no user or email:', error);
            return NextResponse.json({ isAdmin: false }, { status: 401 });
        }

        const userEmail = user.email.toLowerCase();
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const publicAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();

        // Debug: always log the comparison in dev
        if (process.env.NODE_ENV === 'development') {
            console.log('Admin check — user email:', userEmail);
            console.log('Admin check — ADMIN_EMAIL:', adminEmail);
            console.log('Admin check — NEXT_PUBLIC_ADMIN_EMAIL:', publicAdminEmail);
        }

        const isAdmin = isKnownAdminEmail(userEmail);

        return NextResponse.json({ isAdmin, userEmail, adminEmail });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}
