'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Camera, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GuestBookEntry {
    id: string;
    guest_name: string;
    message: string;
    photo_url?: string;
    created_at: string;
}

interface GuestBookProps {
    weddingId: string;
}

export default function GuestBook({ weddingId }: GuestBookProps) {
    const [entries, setEntries] = useState<GuestBookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchEntries = async () => {
            const { data, error } = await supabase
                .from('guest_book')
                .select('*')
                .eq('wedding_id', weddingId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setEntries(data);
            }
            setLoading(false);
        };
        fetchEntries();
    }, [weddingId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('guest_book')
                .insert({
                    wedding_id: weddingId,
                    guest_name: name.trim(),
                    message: message.trim(),
                })
                .select()
                .single();

            if (!error && data) {
                setEntries((prev) => [data, ...prev]);
                setSubmitted(true);
                setName('');
                setMessage('');
                setTimeout(() => setSubmitted(false), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <MessageSquare className="w-12 h-12 text-primary mx-auto mb-6 opacity-30" />
                    <h2 className="text-4xl md:text-5xl font-serif text-[#4A4444] mb-4">Guest Book</h2>
                    <p className="text-foreground/60 font-serif italic text-lg">Leave a message for the happy couple</p>
                </div>

                {/* Submit Form */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 soft-shadow border border-primary/5 mb-12">
                    {submitted ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                            <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
                            <p className="text-xl font-serif text-primary">Thank you for your lovely message! 💕</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                required
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground placeholder:text-text-secondary/30"
                            />
                            <textarea
                                required
                                placeholder="Write your wishes for the couple..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground h-32 resize-none placeholder:text-text-secondary/30"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? 'Sending...' : (
                                    <>Sign the Guest Book <Send className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Entries */}
                {entries.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {entries.map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-[2rem] p-8 soft-shadow border border-primary/5 hover:border-primary/20 transition-colors"
                                >
                                    <p className="font-serif italic text-lg text-foreground/80 mb-4 leading-relaxed">&ldquo;{entry.message}&rdquo;</p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {entry.guest_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{entry.guest_name}</p>
                                            <p className="text-[10px] uppercase tracking-widest opacity-40">
                                                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && entries.length === 0 && (
                    <p className="text-center text-foreground/30 italic font-serif text-lg">Be the first to leave a message! ✨</p>
                )}
            </div>
        </section>
    );
}
