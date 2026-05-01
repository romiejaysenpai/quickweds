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
            console.log('Admin check — no user or email:', error?.message);
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

        // Check against ADMIN_EMAIL (server-side only)
        let isAdmin = adminEmail ? userEmail === adminEmail : false;

        // Development fallback: also check hardcoded known emails
        if (!isAdmin && process.env.NODE_ENV === 'development') {
            const possibleAdmins = [
                process.env.ADMIN_EMAIL,
                process.env.NEXT_PUBLIC_ADMIN_EMAIL,
                'romiejaybacasmas@gmail.com',
                'romiejaysenpai@gmail.com',
            ].filter(Boolean).map(e => e!.toLowerCase());

            if (possibleAdmins.includes(userEmail)) {
                console.log('Dev fallback: granting admin based on env check for:', userEmail);
                isAdmin = true;
            }
        }

        return NextResponse.json({ isAdmin, userEmail, adminEmail });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}
