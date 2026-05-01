import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event: Stripe.Event;

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
            const plan = session.metadata?.plan || 'planner_pro';

            if (weddingId) {
                const supabase: any = getSupabaseAdminClient();
                const { error } = await supabase
                    .from('weddings')
                    .update({
                        payment_status: 'paid',
                        payment_amount: (session.amount_total || 0) / 100,
                        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
                        is_premium: true,
                        plan_type: plan,
                    })
                    .eq('id', weddingId);

                if (error) {
                    throw error;
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Webhook handler failed';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
