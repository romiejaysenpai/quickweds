'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Heart, Plus, Calendar, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import UpgradeButton from '@/components/UpgradeButton';

export default function DashboardRedirect() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [weddings, setWeddings] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            const fetchWeddings = async () => {
                try {
                    // Supabase Query
                    const { data, error } = await supabase
                        .from('weddings')
                        .select('*, rsvps(id)')
                        .eq('user_id', user.id) // Supabase Auth User ID
                        .order('created_at', { ascending: false });

                    if (error) {
                        console.error('Supabase error:', error);
                    } else {
                        // Assuming the data matches the interface used in render
                        setWeddings(data || []);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setFetching(false);
                }
            };
            fetchWeddings();
        }
    }, [user, loading, router]);

    if (loading || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral/30">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral pb-16 sm:pb-20">
            <div className="bg-white border-b border-border p-3 sm:p-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
                <div className="max-w-6xl mx-auto px-2 sm:px-4 flex justify-between items-center gap-2 sm:gap-4">
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-10 sm:h-12 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                    <Link href="/builder" className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2 min-h-[44px] whitespace-nowrap">
                        <Plus className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Create New</span><span className="sm:hidden">New</span>
                    </Link>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 sm:pt-12">
                <header className="mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Welcome, {user?.user_metadata?.full_name || user?.email || 'Bride & Groom'}</h1>
                    <p className="text-sm sm:text-base text-text-secondary">Manage your wedding invitations and RSVPs</p>
                </header>

                {weddings.length === 0 ? (
                    <div className="bg-white rounded-xl sm:rounded-[2rem] p-6 sm:p-12 md:p-20 text-center soft-shadow border border-border">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-primary/20" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3 sm:mb-4">No weddings yet</h2>
                        <p className="text-sm sm:text-base text-text-secondary mb-6 sm:mb-10 max-w-sm mx-auto">Start by creating your first elegant wedding landing page and invitation.</p>
                        <Link href="/builder" className="inline-flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 min-h-[44px]">
                            Create Your First Wedding <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {weddings.map((wedding, idx) => (
                            <motion.div
                                key={wedding.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-xl sm:rounded-[2rem] overflow-hidden border border-border soft-shadow hover:shadow-2xl hover:translate-y-[-4px] transition-all"
                            >
                                <div className="aspect-[16/10] bg-neutral relative overflow-hidden">
                                    {wedding.hero_image ? (
                                        <img src={wedding.hero_image} alt="Wedding" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/10">
                                            <Heart className="w-16 sm:w-20 h-16 sm:h-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 sm:p-6">
                                        <div className="w-full">
                                            <div className="flex justify-between items-end gap-2">
                                                <h3 className="text-white text-base sm:text-lg md:text-xl font-serif font-bold line-clamp-1">{wedding.bride_name} & {wedding.groom_name}</h3>
                                                <div className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-white/20 flex-shrink-0">
                                                    {wedding.rsvps?.length || 0} RSVPs
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary font-medium">
                                            <Calendar className="w-4 h-4 text-primary/40 flex-shrink-0" /> <span className="line-clamp-1">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary font-medium">
                                            <MapPin className="w-4 h-4 text-primary/40 flex-shrink-0" /> <span className="line-clamp-1">{wedding.venue_name}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 pb-2 sm:pb-3">
                                        <Link href={`/w/${wedding.id}`} target="_blank" className="text-center py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border text-foreground text-xs sm:text-sm font-bold hover:bg-neutral transition-all min-h-[44px] flex items-center justify-center">
                                            View Page
                                        </Link>
                                        <Link href={`/dashboard/${wedding.id}`} className="text-center py-2 sm:py-3 rounded-lg sm:rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all min-h-[44px] flex items-center justify-center">
                                            Manage
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 sm:gap-3 pb-2 sm:pb-3">
                                        <Link href={`/dashboard/${wedding.id}/planner`} className="text-center py-2 sm:py-3 rounded-lg sm:rounded-xl bg-secondary text-white text-xs sm:text-sm font-bold shadow-lg shadow-secondary/10 hover:opacity-90 transition-all flex items-center justify-center gap-2 min-h-[44px]">
                                            <Heart className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Planner Toolkit</span><span className="sm:hidden">Planner</span>
                                        </Link>
                                    </div>
                                    {!wedding.is_premium && !isAdmin && (
                                        <UpgradeButton weddingId={wedding.id} className="w-full text-xs sm:text-sm py-2 sm:py-2.5" />
                                    )}
                                    <Link href={`/builder?edit=${wedding.id}`} className="block w-full text-center py-2 sm:py-3 rounded-lg sm:rounded-xl bg-neutral text-primary text-xs sm:text-sm font-bold border border-primary/20 hover:bg-neutral-hover transition-all min-h-[44px] flex items-center justify-center">
                                        Edit Design
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
