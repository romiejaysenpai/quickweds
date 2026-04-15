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

        const { weddingId, plan } = validation.data;

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY is missing');
            return NextResponse.json({ error: 'Server configuration error: STRIPE_SECRET_KEY is missing' }, { status: 500 });
        }
        console.log('Using Stripe Key:', process.env.STRIPE_SECRET_KEY.substring(0, 8) + '...');

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const price = plan === 'elite' ? PRICING.ELITE_PRICE : PRICING.PREMIUM_PRICE;
        const planName = plan === 'elite' ? 'QuickWeds Elite' : 'QuickWeds Premium';
        const planDesc = plan === 'elite'
            ? 'Unlimited Everything: 25+ Templates, 45 Fonts, Monogram, HD Video, Custom Domain Mapping, Priority Support'
            : 'Unlock Premium Features: All Templates, 45 Fonts, Monogram Logo, Teaser Video Upload';

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: PRICING.CURRENCY,
                        product_data: {
                            name: planName,
                            description: planDesc,
                            images: [`${appUrl}/logo.png`],
                        },
                        unit_amount: Math.round(price * 100), // Convert to cents
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
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
