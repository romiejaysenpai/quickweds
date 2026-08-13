'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPublicRedirectUrl } from '@/lib/site-url';
import LoadingState from '@/components/ui/LoadingState';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const rateResponse = await fetch('/api/auth/rate-limit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'password-reset', email: normalizedEmail }),
            });
            if (!rateResponse.ok) {
                const rateData = await rateResponse.json().catch(() => ({}));
                throw new Error(rateData.error || 'Too many requests. Please try again later.');
            }

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
                redirectTo: getPublicRedirectUrl('/reset-password'),
            });
            if (resetError) throw resetError;
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mobile-safe-screen flex items-center justify-center bg-neutral px-4 sm:px-6 mobile-safe-bottom">
            <div className="noise-overlay" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-md w-full rounded-[2rem] p-6 sm:p-10 soft-shadow relative z-10 border border-border ${sent ? 'bg-success-bg' : 'bg-white'}`}
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-20 w-auto object-contain mb-4 hover:scale-105 transition-transform" />
                    </Link>
                    <p className="text-text-secondary text-sm italic">We&apos;ll help you get back to planning</p>
                </div>

                {sent ? (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-10 h-10 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-serif text-primary">Check Your Email</h3>
                            <p className="text-text-secondary mt-2">We&apos;ve sent a password reset link to <span className="font-bold text-foreground">{email}</span></p>
                        </div>
                        <Link href="/login" className="block w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20">
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-error-bg text-error-text text-sm rounded-xl border border-border italic">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 pointer-events-none" />
                                    <input
                                        type="email"
                                        required
                                        inputMode="email"
                                        autoComplete="email"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        className="icon-field-left w-full pl-14 pr-4 py-4 rounded-2xl bg-neutral border border-border focus:border-primary focus:bg-white outline-none transition-all placeholder:text-text-secondary/30"
                                        placeholder="hello@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:bg-primary-disabled"
                            >
                                {loading ? <LoadingState variant="inline" label="Sending reset link…" className="[&>svg]:h-5 [&>svg]:w-5" /> : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link href="/login" className="text-text-secondary font-bold hover:text-primary transition-all flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
