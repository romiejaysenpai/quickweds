'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesSection() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/templates');
                const data = await res.json();
                if (data.success) {
                    setTemplates(data.templates);
                }
            } catch (err) {
                console.error('Error fetching templates:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Sparkles className="w-3 h-3" /> Curated Collection
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
                            Pick a <span className="italic text-primary">Masterpiece</span>
                        </h2>
                        <p className="text-white/50 text-lg leading-relaxed">
                            Discover high-end designs created by our community and design experts.
                            Every template is fully customizable and responsive.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-white/30 font-bold uppercase tracking-widest text-xs">Curating Styles...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {templates.map((tmpl, idx) => (
                            <motion.div
                                key={tmpl.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative"
                            >
                                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-primary/20">
                                    <img
                                        src={tmpl.hero_image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                                        alt={tmpl.bride_name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-80" />

                                    <div className="absolute inset-0 p-10 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
                                                {tmpl.template}
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-serif font-bold text-white mb-2">
                                            {tmpl.bride_name} & {tmpl.groom_name}
                                        </h3>
                                        <p className="text-white/60 text-sm mb-8 line-clamp-2">
                                            A beautiful {tmpl.template} design featuring {tmpl.font_style} typography.
                                        </p>
                                        <Link
                                            href={`/builder?template=${tmpl.template}&copyFrom=${tmpl.id}`}
                                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:bg-primary hover:text-white transition-all w-fit"
                                        >
                                            Use This Template <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
