import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use a server-safe client for validating JWT tokens to prevent "Auth session missing!" 
// errors that happen when using the shared browser client on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const serverSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

export async function getRequestUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { user: null, error: 'Missing authorization token' };
    }

    const token = authHeader.slice(7).trim();
    
    // Sometimes the client might send literal "undefined" or "null" if session state was weird
    if (token === 'undefined' || token === 'null' || !token) {
        return { user: null, error: 'Invalid authorization token string' };
    }

    console.log('[DEBUG getRequestUser] Token prefix:', token.substring(0, 10));

    const { data, error } = await serverSupabase.auth.getUser(token);

    if (error || !data.user) {
        console.warn('[DEBUG getRequestUser] Error from serverSupabase.auth.getUser:', error);
        return { user: null, error: error?.message || 'Invalid authorization token' };
    }

    return { user: data.user, error: null };
}
