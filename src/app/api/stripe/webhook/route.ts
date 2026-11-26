import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PRICING } from '@/lib/stripe';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

function isPaidCheckoutSession(session: Stripe.Checkout.Session) {
    const minAmountCents = Math.round(PRICING.PLANNER_PRO_PRICE * 100);
    return (
        session.mode === 'payment' &&
        session.payment_status === 'paid' &&
        session.currency === PRICING.CURRENCY &&
        typeof session.amount_total === 'number' &&
        session.amount_total >= minAmountCents
    );
}

async function claimWebhookEvent(supabase: any, eventId: string, eventType: string): Promise<'claimed' | 'duplicate' | 'unavailable'> {
    try {
        const { error } = await supabase
            .from('stripe_webhook_events')
            .insert({
                event_id: eventId,
                event_type: eventType,
                processed_at: new Date().toISOString(),
            });

        if (!error) return 'claimed';
        if (error.code === '23505') return 'duplicate';
        if (error.code === '42P01' || error.code === 'PGRST205') return 'unavailable';
        throw error;
    } catch (err: any) {
        if (err?.code === '42P01' || err?.code === 'PGRST205') return 'unavailable';
        throw err;
    }
}

async function revokeByPaymentIntent(supabase: any, paymentIntentId: string, status: 'refunded' | 'disputed') {
    const now = new Date().toISOString();
    const [weddingRes, profileRes] = await Promise.all([
        supabase
            .from('weddings')
            .update({
                is_premium: false,
                payment_status: status,
                plan_type: 'free',
            })
            .eq('stripe_payment_intent_id', paymentIntentId),
        supabase
            .from('user_app_profiles')
            .update({
                is_pro: false,
                payment_status: status,
                plan_type: 'free',
                updated_at: now,
            })
            .eq('stripe_payment_intent_id', paymentIntentId),
    ]);

    if (weddingRes.error) throw weddingRes.error;
    if (profileRes.error && profileRes.error.code !== '42P01' && profileRes.error.code !== 'PGRST205') {
        throw profileRes.error;
    }
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const stripe = getStripe();

        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } else if (process.env.NODE_ENV === 'development') {
            event = JSON.parse(body) as Stripe.Event;
        } else {
            return NextResponse.json(
                { error: 'STRIPE_WEBHOOK_SECRET is missing in production' },
                { status: 500 }
            );
        }
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    try {
        const supabase: any = getSupabaseAdminClient();
        const claimStatus = await claimWebhookEvent(supabase, event.id, event.type);
        if (claimStatus === 'duplicate') {
            return NextResponse.json({ received: true, duplicate: true });
        }

        if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
            const session = event.data.object as Stripe.Checkout.Session;
            const weddingId = session.metadata?.weddingId;
            const userId = session.metadata?.userId;
            // Default safely to 'wedding' when weddingId is present so wedding checkouts never escalate to account_pro.
            const scope = session.metadata?.scope || (weddingId ? 'wedding' : 'account');
            const plan = scope === 'account' ? 'account_pro' : 'planner_pro';
            const expectedAmount = Number(session.metadata?.expectedAmount || 0);
            const expectedCurrency = session.metadata?.expectedCurrency || PRICING.CURRENCY;

            if (!isPaidCheckoutSession(session)) {
                console.warn('Ignoring unpaid or underpaid Stripe checkout session:', session.id);
                return NextResponse.json({ received: true });
            }

            if (expectedCurrency !== PRICING.CURRENCY) {
                console.warn('Ignoring Stripe checkout session with unexpected currency:', session.id);
                return NextResponse.json({ received: true });
            }

            if (expectedAmount > 0 && session.amount_total !== expectedAmount) {
                console.warn('Ignoring Stripe checkout session with unexpected amount:', session.id);
                return NextResponse.json({ received: true });
            }

            if (scope === 'account' && userId) {
                const { data: existing } = await supabase
                    .from('user_app_profiles')
                    .select('stripe_checkout_session_id, payment_status')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (existing?.stripe_checkout_session_id === session.id && existing?.payment_status === 'paid') {
                    return NextResponse.json({ received: true });
                }

                const { error } = await supabase
                    .from('user_app_profiles')
                    .upsert({
                        user_id: userId,
                        is_pro: true,
                        plan_type: 'account_pro',
                        payment_status: 'paid',
                        payment_amount: (session.amount_total || 0) / 100,
                        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
                        stripe_checkout_session_id: session.id,
                        pro_unlocked_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id' });

                if (error) throw error;
            } else if (weddingId) {
                const { data: wedding, error: lookupError } = await supabase
                    .from('weddings')
                    .select('id, stripe_checkout_session_id, payment_status, deleted_at')
                    .eq('id', weddingId)
                    .maybeSingle();

                if (lookupError) throw lookupError;
                if (!wedding || wedding.deleted_at) {
                    console.warn('Ignoring Stripe session for missing or deleted wedding:', session.id, weddingId);
                    return NextResponse.json({ received: true });
                }
                if (wedding.stripe_checkout_session_id === session.id && wedding.payment_status === 'paid') {
                    return NextResponse.json({ received: true });
                }

                const { error } = await supabase
                    .from('weddings')
                    .update({
                        payment_status: 'paid',
                        payment_amount: (session.amount_total || 0) / 100,
                        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
                        stripe_checkout_session_id: session.id,
                        is_premium: true,
                        plan_type: plan,
                    })
                    .eq('id', weddingId);

                if (error) throw error;
            }
        } else if (event.type === 'charge.refunded') {
            const charge = event.data.object as Stripe.Charge;
            const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
            if (paymentIntentId && charge.refunded) {
                await revokeByPaymentIntent(supabase, paymentIntentId, 'refunded');
            }
        } else if (event.type === 'charge.dispute.created') {
            const dispute = event.data.object as Stripe.Dispute;
            const paymentIntentId = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : null;
            if (paymentIntentId) {
                await revokeByPaymentIntent(supabase, paymentIntentId, 'disputed');
            }
        } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
            return NextResponse.json({ received: true });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook processing failed:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
