import type { NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Use a server-safe client for validating JWT tokens to prevent "Auth session missing!" 
// errors that happen when using the shared browser client on the server.
let serverSupabase: SupabaseClient | null = null;

function getServerSupabase() {
    if (serverSupabase) return serverSupabase;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;

    serverSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
    return serverSupabase;
}

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

    // Reject malformed values locally instead of paying for a failed remote
    // auth request and emitting an avoidable Supabase stack trace.
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3 || tokenParts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) {
        return { user: null, error: 'Malformed authorization token' };
    }

    const supabase = getServerSupabase();
    if (!supabase) {
        return { user: null, error: 'Authentication service is not configured' };
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return { user: null, error: error?.message || 'Invalid authorization token' };
    }

    return { user: data.user, error: null };
}
