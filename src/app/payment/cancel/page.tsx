'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function CancelContent() {
    const searchParams = useSearchParams();
    const weddingId = searchParams.get('wedding_id');

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
                    className="w-24 h-24 rounded-full bg-error-bg flex items-center justify-center mx-auto mb-8"
                >
                    <XCircle className="w-12 h-12 text-error-text" />
                </motion.div>

                <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                    Payment Cancelled
                </h1>

                <p className="text-lg text-text-secondary mb-8">
                    No charges were made. You can upgrade to premium anytime to unlock all features!
                </p>

                <div className="bg-neutral rounded-2xl p-6 mb-8 text-left">
                    <h3 className="text-sm uppercase tracking-widest font-bold text-text-secondary mb-3">
                        💡 What You're Missing
                    </h3>
                    <ul className="space-y-2 text-sm text-text-secondary">
                        <li>• 45 premium font combinations</li>
                        <li>• Custom monogram logo maker</li>
                        <li>• All premium templates</li>
                        <li>• Unlimited gallery images</li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {weddingId ? (
                        <Link
                            href={`/builder?edit=${weddingId}`}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Builder
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

export default function PaymentCancelPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <CancelContent />
        </Suspense>
    );
}
