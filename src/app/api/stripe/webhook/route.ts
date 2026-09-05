import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PRICING } from '@/lib/stripe';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

function isPaidCheckoutSession(session: Stripe.Checkout.Session) {
    return (
        session.mode === 'payment' &&
        session.payment_status === 'paid' &&
        session.currency?.toLowerCase() === PRICING.CURRENCY.toLowerCase() &&
        typeof session.amount_total === 'number' &&
        session.amount_total > 0
    );
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event: Stripe.Event;
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

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const weddingId = session.metadata?.weddingId;
            const userId = session.metadata?.userId;
            const scope = session.metadata?.scope || (userId ? 'account' : 'wedding');
            const plan = session.metadata?.plan || 'planner_pro';
            const expectedAmount = Number(session.metadata?.expectedAmount || 0);
            const supabase: any = getSupabaseAdminClient();

            if (!isPaidCheckoutSession(session)) {
                console.warn('Ignoring unpaid or invalid Stripe checkout session:', session.id);
                return NextResponse.json({ received: true });
            }

            if (expectedAmount && session.amount_total !== expectedAmount) {
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

                if (error) {
                    throw error;
                }
            } else if (weddingId) {
                const { data: wedding, error: lookupError } = await supabase
                    .from('weddings')
                    .select('id, stripe_checkout_session_id, payment_status')
                    .eq('id', weddingId)
                    .maybeSingle();

                if (lookupError) throw lookupError;
                if (!wedding) {
                    console.warn('Ignoring Stripe session for missing wedding:', session.id, weddingId);
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

                if (error) {
                    throw error;
                }
            }
        } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
            return NextResponse.json({ received: true });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Webhook handler failed';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
