'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral px-6">
            <div className="noise-overlay" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2rem] p-10 soft-shadow relative z-10 border border-border"
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-20 w-auto object-contain mb-4 hover:scale-105 transition-transform" />
                    </Link>
                    <p className="text-text-secondary text-sm italic">Continue creating your dream wedding</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-error-bg text-error-text text-sm rounded-xl border border-border italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral border border-border focus:border-primary focus:bg-white outline-none transition-all placeholder:text-text-secondary/30"
                                placeholder="hello@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary">Password</label>
                            <Link href="/forgot-password" title="Forgot Password" className="text-xs text-primary font-bold hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral border border-border focus:border-primary focus:bg-white outline-none transition-all placeholder:text-text-secondary/30"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:bg-primary-disabled"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Login <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <p className="mt-8 text-center text-text-secondary">
                    Don&apos;t have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
                </p>
            </motion.div>
        </div>
    );
}
