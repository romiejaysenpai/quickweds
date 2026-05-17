import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';

/**
 * GET /api/auth/check-admin
 * Server-authoritative admin check. Do not leak configured admin emails.
 */
export async function GET(req: NextRequest) {
    try {
        const { user } = await getRequestUser(req);

        if (!user?.email) {
            return NextResponse.json({ isAdmin: false }, { status: 401 });
        }

        return NextResponse.json({ isAdmin: isKnownAdminEmail(user.email) });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}
