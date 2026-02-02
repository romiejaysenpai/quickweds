import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICING } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const { weddingId } = await req.json();

        if (!weddingId) {
            return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: PRICING.CURRENCY,
                        product_data: {
                            name: 'QuickWeds Premium',
                            description: 'Unlock all premium features: 45 fonts, monogram logos, all templates, unlimited gallery',
                            images: [`${appUrl}/logo.png`],
                        },
                        unit_amount: Math.round(PRICING.PREMIUM_PRICE * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&wedding_id=${weddingId}`,
            cancel_url: `${appUrl}/payment/cancel?wedding_id=${weddingId}`,
            metadata: {
                weddingId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
