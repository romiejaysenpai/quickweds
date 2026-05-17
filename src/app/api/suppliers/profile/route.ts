import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRequestUser } from '@/lib/api-auth';
import { getPrimaryAdminEmail, isKnownAdminEmail } from '@/lib/admin';
import { sendEmail } from '@/lib/email';
import { getPublicAppUrl } from '@/lib/site-url';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    buildSupplierSlug,
    normalizeSupplierProfileInput,
    type SupplierProfile,
    type SupplierProfileStatus,
} from '@/lib/suppliers';
import { getSupplierReviewUrl } from '@/lib/supplier-review';
import { sendSupplierUnderReviewEmail } from '@/lib/supplier-notifications';

const REVIEW_EMAIL_SOURCE_STATUSES: SupplierProfileStatus[] = ['draft', 'rejected', 'inactive'];

function getErrorMessage(error: unknown, fallback: string) {
    const missingSupplierTableMessage = 'Supplier directory database table is missing. Run supabase-supplier-directory.sql in the Supabase SQL editor, then try again.';
    if (error instanceof Error) {
        if (error.message.includes("Could not find the table 'public.supplier_profiles'")) {
            return missingSupplierTableMessage;
        }
        return error.message;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        const message = String((error as { message?: unknown }).message || fallback);
        const code = 'code' in error ? String((error as { code?: unknown }).code || '') : '';

        if (code === 'PGRST205' || message.includes("Could not find the table 'public.supplier_profiles'")) {
            return missingSupplierTableMessage;
        }

        return message;
    }
    return fallback;
}

function getSupplierAdminClientOrNull() {
    try {
        return getSupabaseAdminClient() as any;
    } catch {
        return null;
    }
}

function getSupplierUserClient(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const authorization = req.headers.get('authorization') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase public configuration');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        global: {
            headers: {
                Authorization: authorization,
            },
        },
    }) as any;
}

async function getUniqueSupplierSlug(db: any, baseSlug: string, existingId?: string) {
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
        let query = db.from('supplier_profiles').select('id').eq('slug', slug);
        if (existingId) query = query.neq('id', existingId);

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (!data) return slug;

        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
}

function escapeHtml(value?: string | null) {
    return (value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getSupplierReviewEmailHtml(profile: SupplierProfile, ownerEmail?: string | null) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const approveUrl = getSupplierReviewUrl(profile.id, 'approve', expiresAt);
    const rejectUrl = getSupplierReviewUrl(profile.id, 'reject', expiresAt);
    const dashboardUrl = `${getPublicAppUrl()}/supplier/dashboard`;
    const location = [profile.city, profile.province].filter(Boolean).join(', ');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; border: 1px solid #eadeda; border-radius: 24px; background: #ffffff;">
            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #D16C78;">Supplier Directory Review</p>
            <h1 style="margin: 0 0 16px; color: #34272b; font-size: 28px;">New business listing submitted</h1>
            <p style="margin: 0 0 24px; color: #6f6266; line-height: 1.7;">
                A supplier submitted a listing for QuickWeds review. Approving it will publish the business in the public directory. Not approving it will keep it hidden.
            </p>

            <div style="background: #fff8f4; border-radius: 18px; padding: 22px; margin: 0 0 24px;">
                <p style="margin: 0 0 6px; color: #7A5A61; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Business</p>
                <p style="margin: 0 0 18px; color: #34272b; font-size: 20px; font-weight: 700;">${escapeHtml(profile.business_name)}</p>

                <p style="margin: 0 0 6px; color: #7A5A61; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Category</p>
                <p style="margin: 0 0 18px; color: #34272b;">${escapeHtml(profile.category)}</p>

                <p style="margin: 0 0 6px; color: #7A5A61; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Location</p>
                <p style="margin: 0 0 18px; color: #34272b;">${escapeHtml(location || 'Not provided')}</p>

                <p style="margin: 0 0 6px; color: #7A5A61; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Contact</p>
                <p style="margin: 0 0 18px; color: #34272b;">
                    Owner: ${escapeHtml(ownerEmail || 'Unknown')}<br />
                    Business email: ${escapeHtml(profile.email || 'Not provided')}<br />
                    Phone: ${escapeHtml(profile.phone || profile.whatsapp || 'Not provided')}
                </p>

                <p style="margin: 0 0 6px; color: #7A5A61; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Summary</p>
                <p style="margin: 0; color: #34272b; line-height: 1.7;">${escapeHtml(profile.summary || profile.description || 'No summary provided')}</p>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
                <a href="${approveUrl}" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 14px 18px; font-weight: 700;">Approve Listing</a>
                <a href="${rejectUrl}" style="display: inline-block; background: #be123c; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 14px 18px; font-weight: 700;">Not Approve</a>
                <a href="${dashboardUrl}" style="display: inline-block; background: #D16C78; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 14px 18px; font-weight: 700;">Open Supplier Dashboard</a>
            </div>

            <p style="margin: 0; color: #8a7c80; font-size: 12px; line-height: 1.6;">
                These review links expire on ${expiresAt.toUTCString()}.
            </p>
        </div>
    `;
}

async function sendSupplierReviewEmail(profile: SupplierProfile, ownerEmail?: string | null) {
    const adminEmail = getPrimaryAdminEmail();
    if (!adminEmail) {
        console.warn('Supplier review email skipped: ADMIN_EMAIL or ADMIN_EMAILS is not configured.');
        return;
    }

    try {
        const result = await sendEmail({
            to: adminEmail,
            subject: `New supplier listing review: ${profile.business_name}`,
            html: getSupplierReviewEmailHtml(profile, ownerEmail),
        });

        if (!result.success) {
            console.warn('Supplier review email failed:', result.error);
        }
    } catch (error) {
        console.warn('Supplier review email failed:', error);
    }
}

export async function GET(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    try {
        const adminDb = getSupplierAdminClientOrNull();
        const db = adminDb || getSupplierUserClient(req);
        const isAdmin = isKnownAdminEmail(user.email);

        const { data: profile, error: profileError } = await db
            .from('supplier_profiles')
            .select('*')
            .eq('owner_user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (profileError) throw profileError;

        let reviewQueue: SupplierProfile[] = [];
        if (isAdmin && adminDb) {
            const { data, error: queueError } = await db
                .from('supplier_profiles')
                .select('*')
                .in('status', ['pending_review', 'approved', 'rejected', 'inactive'])
                .order('status', { ascending: false })
                .order('updated_at', { ascending: false });

            if (queueError) throw queueError;
            reviewQueue = (data || []) as SupplierProfile[];
        }

        return NextResponse.json({ profile, reviewQueue, isAdmin });
    } catch (err) {
        const message = getErrorMessage(err, 'Unable to load supplier profile');
        console.error('Supplier profile load failed:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    try {
        const body = await req.json();
        const intent = body.intent === 'submit' ? 'submit' : 'draft';
        const input = normalizeSupplierProfileInput(body.profile || body);

        if (!input.business_name || !input.category || !input.city || !input.province) {
            return NextResponse.json(
                { error: 'Business name, category, city, and province are required.' },
                { status: 400 }
            );
        }

        const adminDb = getSupplierAdminClientOrNull();
        const db = adminDb || getSupplierUserClient(req);
        const requestedId = body.profile?.id || body.id;

        let existing: SupplierProfile | null = null;
        if (requestedId) {
            const { data, error: existingError } = await db
                .from('supplier_profiles')
                .select('*')
                .eq('id', requestedId)
                .eq('owner_user_id', user.id)
                .maybeSingle();

            if (existingError) throw existingError;
            existing = data as SupplierProfile | null;
        }

        if (!existing) {
            const { data, error: ownError } = await db
                .from('supplier_profiles')
                .select('*')
                .eq('owner_user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();

            if (ownError) throw ownError;
            existing = data as SupplierProfile | null;
        }

        const baseSlug = buildSupplierSlug(input);
        const slug = adminDb
            ? await getUniqueSupplierSlug(db, baseSlug, existing?.id)
            : `${baseSlug}-${user.id.slice(0, 8)}`;
        const status: SupplierProfileStatus = intent === 'submit'
            ? existing?.status === 'approved'
                ? 'approved'
                : 'pending_review'
            : 'draft';
        const shouldNotifyAdmin = intent === 'submit'
            && (!existing || REVIEW_EMAIL_SOURCE_STATUSES.includes(existing.status));
        const updatePayload = {
            ...input,
            owner_user_id: user.id,
            slug,
            status,
            is_active: status !== 'draft',
            updated_at: new Date().toISOString(),
        };

        if (existing?.id) {
            const { data, error: updateError } = await db
                .from('supplier_profiles')
                .update(updatePayload)
                .eq('id', existing.id)
                .eq('owner_user_id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;
            if (shouldNotifyAdmin) {
                await sendSupplierReviewEmail(data as SupplierProfile, user.email);
                await sendSupplierUnderReviewEmail(data as SupplierProfile, user.email);
            }
            return NextResponse.json({ profile: data });
        }

        const { data, error: insertError } = await db
            .from('supplier_profiles')
            .insert(updatePayload)
            .select()
            .single();

        if (insertError) throw insertError;
        if (shouldNotifyAdmin) {
            await sendSupplierReviewEmail(data as SupplierProfile, user.email);
            await sendSupplierUnderReviewEmail(data as SupplierProfile, user.email);
        }
        return NextResponse.json({ profile: data });
    } catch (err) {
        const message = getErrorMessage(err, 'Unable to save supplier profile');
        console.error('Supplier profile save failed:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
