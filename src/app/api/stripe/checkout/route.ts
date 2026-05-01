import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICING } from '@/lib/stripe';
import { checkoutSchema, validateRequest } from '@/lib/validations';

export async function POST(req: NextRequest) {
    console.log('Stripe checkout session initiated');
    try {
        const body = await req.json();
        const validation = validateRequest(checkoutSchema, body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.errors }, { status: 400 });
        }

        const { weddingId } = validation.data;
        const plan = 'planner_pro';

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY is missing');
            return NextResponse.json(
                { error: 'Server configuration error: STRIPE_SECRET_KEY is missing' },
                { status: 500 }
            );
        }

        const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
        const appUrl = configuredAppUrl || req.nextUrl.origin;
        const price = PRICING.PLANNER_PRO_PRICE;

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: PRICING.CURRENCY,
                        product_data: {
                            name: 'QuickWeds Planner Pro',
                            description: 'One-time unlock for seating, budgets, vendors, tasks, collaborators, reminders, photo sharing, and thank-you tools.',
                            images: [`${appUrl}/logo.png`],
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&wedding_id=${weddingId}&plan=${plan}`,
            cancel_url: `${appUrl}/payment/cancel?wedding_id=${weddingId}`,
            metadata: {
                weddingId,
                plan,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create checkout session';
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
