'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CURATED_TEMPLATES = [
    {
        id: 'classic',
        name: 'Classic Elegance',
        desc: 'Timeless serif typography with soft floral accents.',
        image: '/templates/classic.png',
        color: '#D16C78'
    },
    {
        id: 'minimal',
        name: 'Modern Minimal',
        desc: 'Clean lines and high contrast for a sophisticated look.',
        image: '/templates/minimal.png',
        color: '#3A2A2D'
    },
    {
        id: 'boho',
        name: 'Boho Dream',
        desc: 'Organic shapes and earthy tones for a warm celebration.',
        image: '/templates/boho.png',
        color: '#7A5A61'
    },
    {
        id: 'royal',
        name: 'Royal Grandeur',
        desc: 'Majestic navy and gold for a truly regal experience.',
        image: '/templates/royal.png',
        color: '#D6B87C'
    },
    {
        id: 'midnight',
        name: 'Midnight Luxury',
        desc: 'Premium dark aesthetic with shimmering gold details.',
        image: '/templates/midnight.png',
        color: '#cfb53b'
    },
    {
        id: 'tropical',
        name: 'Tropical Paradise',
        desc: 'Vibrant teal and sunset hues for a beach-side union.',
        image: '/templates/tropical.png',
        color: '#00695c'
    }
];

export default function TemplatesSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                        Choose Your <span className="text-primary italic">Style</span>
                    </h2>
                    <p className="text-text-secondary max-w-2xl">
                        Select from our curated wireframe templates. Each one is designed to be stunning,
                        mobile-responsive, and fully customizable.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {CURATED_TEMPLATES.map((tmpl, idx) => (
                        <motion.div
                            key={tmpl.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative"
                        >
                            <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden soft-shadow border border-border group-hover:shadow-2xl transition-all duration-500">
                                <img
                                    src={tmpl.image}
                                    alt={tmpl.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                    <p className="text-white/80 text-sm mb-2">{tmpl.desc}</p>
                                    <Link
                                        href={`/builder?template=${tmpl.id}`}
                                        className="inline-flex items-center gap-2 text-white font-bold hover:text-primary transition-colors"
                                    >
                                        Use this Template <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-serif font-bold text-foreground">{tmpl.name}</h3>
                                    <div className="h-1 w-12 bg-primary/30 mt-1 rounded-full group-hover:w-full transition-all duration-500" style={{ backgroundColor: tmpl.color }} />
                                </div>
                                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                    <Heart className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
