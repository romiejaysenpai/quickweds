import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    try {
        // Verify webhook signature (skip in development if webhook secret not set)
        let event;
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } else {
            // For development without webhook secret
            event = JSON.parse(body);
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const weddingId = session.metadata?.weddingId;

            if (weddingId) {
                // Update wedding to premium
                const { error } = await supabase
                    .from('weddings')
                    .update({
                        payment_status: 'paid',
                        payment_amount: session.amount_total / 100,
                        stripe_payment_intent_id: session.payment_intent,
                        is_premium: true,
                    })
                    .eq('id', weddingId);

                if (error) {
                    console.error('Failed to update wedding:', error);
                    throw error;
                }

                console.log(`Wedding ${weddingId} upgraded to premium`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: error.message || 'Webhook handler failed' },
            { status: 400 }
        );
    }
}
