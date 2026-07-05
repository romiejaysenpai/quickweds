import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PRICING } from '@/lib/stripe';
import { checkoutSchema, validateRequest } from '@/lib/validations';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, getClientIP, sanitizeWeddingId } from '@/lib/rate-limit';
import { getWeddingAccess } from '@/lib/wedding-access';

export async function POST(req: NextRequest) {
    if (req.headers.get('x-quickweds-client') === 'ios-capacitor') {
        return NextResponse.json(
            { error: 'Paid upgrades are managed on the QuickWeds website.' },
            { status: 403 }
        );
    }

    const rateLimit = createRateLimitMiddleware('CHECKOUT');
    const rateKey = getClientIP(req);
    const limited = await rateLimit.check(rateKey);
    if (limited.limited) return limited.response;

    try {
        const body = await req.json();
        const validation = validateRequest(checkoutSchema, body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.errors }, { status: 400 });
        }

        const requestedScope = validation.data.scope || (validation.data.weddingId ? 'wedding' : 'account');
        const scope = requestedScope === 'account' ? 'account' : 'wedding';
        const plan = scope === 'account' ? 'account_pro' : (validation.data.plan || 'planner_pro');
        const weddingId = validation.data.weddingId ? sanitizeWeddingId(validation.data.weddingId) : '';

        let userId: string | null = null;
        const { user, error } = await getRequestUser(req);
        if (!user) {
            return NextResponse.json({ error: error || 'Please sign in to continue checkout.' }, { status: 401 });
        }
        userId = user.id;

        if (scope === 'wedding' && !weddingId) {
            return NextResponse.json({ error: 'Wedding ID is required for Planner Pro checkout.' }, { status: 400 });
        }

        if (scope === 'wedding') {
            const db = getSupabaseAdminClient() as any;
            const access = await getWeddingAccess(db, user, weddingId, {
                select: 'id, user_id, deleted_at',
                collaboratorRoles: ['partner'],
            });

            if (!access.wedding || access.wedding.deleted_at) {
                return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
            }

            if (!access.canManage) {
                return NextResponse.json({ error: 'You do not have permission to upgrade this wedding.' }, { status: 403 });
            }
        }

        const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
        const appUrl = configuredAppUrl || req.nextUrl.origin;
        const price = PRICING.PLANNER_PRO_PRICE;
        const productName = scope === 'account' ? 'QuickWeds Account Pro' : 'QuickWeds Planner Pro';
        const productDescription = scope === 'account'
            ? 'Account-level unlock for more than 3 wedding websites and planner access across owned weddings.'
            : 'One-time unlock for unlimited guest emails, full planner tools, seating, reminders, collaborators, Google Calendar, photo tools, exports, and custom domains.';
        const successUrl = scope === 'account'
            ? `${appUrl}/payment/success?scope=account&plan=${plan}`
            : `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&wedding_id=${weddingId}&plan=${plan}`;
        const cancelUrl = scope === 'account'
            ? `${appUrl}/payment/cancel?scope=account`
            : `${appUrl}/payment/cancel?wedding_id=${weddingId}`;

        const stripe = getStripe();
        const amountCents = Math.round(price * 100);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: PRICING.CURRENCY,
                        product_data: {
                            name: productName,
                            description: productDescription,
                            images: [`${appUrl}/logo.png`],
                        },
                        unit_amount: amountCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                ...(weddingId ? { weddingId } : {}),
                ...(userId ? { userId } : {}),
                scope,
                plan,
                expectedAmount: String(amountCents),
                expectedCurrency: PRICING.CURRENCY,
            },
        });

        return NextResponse.json({ url: session.url }, { headers: limited.headers });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create checkout session';
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
