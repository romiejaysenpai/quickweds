import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(path = '.env.local') {
    try {
        const file = readFileSync(path, 'utf8');
        for (const line of file.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const index = trimmed.indexOf('=');
            if (index === -1) continue;
            const key = trimmed.slice(0, index).trim();
            let value = trimmed.slice(index + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    } catch {
        // Environment variables may already be loaded.
    }
}

async function main() {
    loadEnvFile();
    const args = process.argv.slice(2);
    let targetEmail = args.find((a) => a.includes('@')) || '';
    for (const arg of args) {
        if (arg.startsWith('--email=')) {
            targetEmail = arg.slice('--email='.length).trim();
        }
    }

    if (!targetEmail) {
        console.error('Usage: node scripts/upgrade-user-to-pro.mjs <user-email>');
        process.exit(1);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase admin configuration in .env.local');
    }

    const db = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    console.log(`Looking up user: ${targetEmail}`);

    let targetUser = null;
    let page = 1;
    const perPage = 100;

    while (true) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage });
        if (error) throw error;
        const users = data?.users || [];
        for (const u of users) {
            if (u.email?.trim().toLowerCase() === targetEmail.toLowerCase()) {
                targetUser = u;
                break;
            }
        }
        if (targetUser || users.length < perPage) break;
        page++;
    }

    if (!targetUser) {
        throw new Error(`Target user not found: ${targetEmail}`);
    }

    const userId = targetUser.id;
    const now = new Date().toISOString();

    const { data: updatedProfile, error: profileErr } = await db
        .from('user_app_profiles')
        .upsert({
            user_id: userId,
            is_pro: true,
            plan_type: 'account_pro',
            payment_status: 'paid',
            pro_unlocked_at: now,
            updated_at: now,
        }, { onConflict: 'user_id' })
        .select()
        .single();

    if (profileErr) {
        throw new Error(`Failed to update user_app_profiles: ${profileErr.message}`);
    }

    const { data: updatedWeddings, error: weddingsErr } = await db
        .from('weddings')
        .update({
            is_premium: true,
            payment_status: 'paid',
            plan_type: 'planner_pro',
        })
        .eq('user_id', userId)
        .select('id, bride_name, groom_name, is_premium, payment_status, plan_type');

    if (weddingsErr) {
        throw new Error(`Failed to update weddings: ${weddingsErr.message}`);
    }

    await db.from('user_notifications').insert({
        user_id: userId,
        title: 'Planner Pro Unlocked',
        message: 'Your account has been upgraded to Planner Pro! Enjoy unlimited guest emails, full planner tools, seating, exports, and more.',
        type: 'system',
        link: '/dashboard',
    });

    console.log(`Successfully upgraded ${targetEmail} to Pro:`, {
        profile: updatedProfile,
        weddings: updatedWeddings,
    });
}

main().catch((err) => {
    console.error('Fatal upgrade error:', err);
    process.exit(1);
});
