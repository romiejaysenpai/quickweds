import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/auth/check-admin
 * Secure server-side admin check
 * CRITICAL FIX #2: Admin check moved to server-side only
 */
export async function GET(req: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ isAdmin: false }, { status: 401 });
        }

        const token = authHeader.slice(7);
        
        // Verify the user with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user?.email) {
            return NextResponse.json({ isAdmin: false }, { status: 401 });
        }

        // Check against server-side environment variable (NOT exposed to client)
        const adminEmail = process.env.ADMIN_EMAIL;
        const isAdmin = adminEmail ? user.email.toLowerCase() === adminEmail.toLowerCase() : false;

        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}
