import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/auth/check-admin
 * Secure server-side admin check
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ isAdmin: false }, { status: 401 });
        }

        const token = authHeader.slice(7);

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user?.email) {
            console.log('Admin check failed — no user or email:', error?.message);
            return NextResponse.json({ isAdmin: false }, { status: 401 });
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const publicAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

        // Debug log (remove in production if needed)
        if (process.env.NODE_ENV === 'development') {
            console.log('Admin check — user email:', user.email);
            console.log('Admin check — ADMIN_EMAIL env:', adminEmail);
            console.log('Admin check — NEXT_PUBLIC_ADMIN_EMAIL env:', publicAdminEmail);
        }

        const isAdmin = adminEmail ? user.email.toLowerCase() === adminEmail.toLowerCase() : false;

        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}
