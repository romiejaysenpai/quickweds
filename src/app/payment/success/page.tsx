'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

function SuccessContent() {
    const searchParams = useSearchParams();
    const weddingId = searchParams?.get('wedding_id');
    const scope = searchParams?.get('scope');
    const [verified, setVerified] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            if (scope === 'account') {
                const { data: userData } = await supabase.auth.getUser();
                const userId = userData.user?.id;
                if (!userId) {
                    setChecking(false);
                    return;
                }

                const { data } = await supabase
                    .from('user_app_profiles')
                    .select('is_pro, payment_status')
                    .eq('user_id', userId)
                    .single();

                if (data?.is_pro || data?.payment_status === 'paid') {
                    setVerified(true);
                }
                setChecking(false);
                return;
            }

            if (!weddingId) {
                setChecking(false);
                return;
            }

            const { data } = await supabase
                .from('weddings')
                .select('is_premium, payment_status')
                .eq('id', weddingId)
                .single();

            if (data?.is_premium) {
                setVerified(true);
            }
            setChecking(false);
        };

        void verifyPayment();
        const interval = setInterval(verifyPayment, 2000);
        setTimeout(() => clearInterval(interval), 15000);

        return () => clearInterval(interval);
    }, [weddingId, scope]);

    return (
        <div className="min-h-screen bg-neutral flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-border"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-24 h-24 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-8"
                >
                    <CheckCircle2 className="w-12 h-12 text-accent" />
                </motion.div>

                <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                    {checking ? 'Processing Payment...' : verified ? (scope === 'account' ? 'Account Pro Unlocked!' : 'Planner Pro Unlocked!') : 'Payment Successful!'}
                </h1>

                <p className="text-lg text-text-secondary mb-8">
                    {checking
                        ? "We're activating your Planner Pro workspace..."
                        : verified
                            ? (scope === 'account' ? 'Your account can now create more wedding websites and open planners for owned weddings.' : 'Your complete planning workspace is ready.')
                            : 'Your payment was successful. Planner Pro will be available shortly.'}
                </p>

                <div className="bg-neutral rounded-2xl p-6 mb-8 text-left">
                    <h3 className="text-sm uppercase tracking-widest font-bold text-text-secondary mb-4">
                        {scope === 'account' ? 'Account Pro includes' : 'Planner Pro includes'}
                    </h3>
                    <ul className="space-y-3 text-foreground">
                        {[
                            ...(scope === 'account' ? ['More than 3 wedding websites', 'Planner access for owned weddings'] : ['Seating chart and guest placement tools']),
                            'Budget, vendor, and checklist management',
                            'Collaborator access for your partner or planner',
                            'Photo sharing and thank-you tools',
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {weddingId ? (
                        <Link
                            href={`/dashboard/${weddingId}/planner`}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                        >
                            Open Planner <ArrowRight className="w-5 h-5" />
                        </Link>
                    ) : null}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-neutral text-foreground font-bold border border-border hover:bg-neutral-hover transition-all"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <SuccessContent />
        </Suspense>
    );
}
