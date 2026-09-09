import { createClient } from '@supabase/supabase-js';

// The generated database type is not yet checked into this project. Keep the
// server client permissive so newly migrated tables do not collapse to `never`.
let cachedAdminClient: ReturnType<typeof createClient<any>> | null = null;

export function getSupabaseAdminClient() {
    if (cachedAdminClient) {
        return cachedAdminClient;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase admin configuration');
    }

    cachedAdminClient = createClient<any>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return cachedAdminClient;
}
