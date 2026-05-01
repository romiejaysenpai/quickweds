import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function getRequestUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { user: null, error: 'Missing authorization token' };
    }

    const token = authHeader.slice(7);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return { user: null, error: error?.message || 'Invalid authorization token' };
    }

    return { user: data.user, error: null };
}
