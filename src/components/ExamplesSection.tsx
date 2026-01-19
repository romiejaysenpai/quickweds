'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const EXAMPLES = [
    {
        id: 'ex-1',
        bride_name: 'Isabella Rossi',
        groom_name: 'Julian Sterling',
        wedding_date: '2026-06-15',
        venue_name: 'The Ritz-Carlton, Paris',
        story: 'From a chance meeting at a bookstore in the Latin Quarter to a lifetime of shared chapters.',
        motif_color: '#D4AF37',
        template: 'ArtDeco',
        font: 'Classic',
        hero_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop',
        quote: 'A celebration in the city of lights.',
        hashtag: '#SterlingUnion'
    },
    {
        id: 'ex-2',
        bride_name: 'Amara Okafor',
        groom_name: 'Kojo Mensah',
        wedding_date: '2025-09-20',
        venue_name: 'Zion National Park, Utah',
        story: 'Bound by a love for adventure and the great outdoors, we chose the desert to say our forever.',
        motif_color: '#e2725b',
        template: 'Boho',
        font: 'Romantic',
        hero_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1465495910483-34a1d374bb15?q=80&w=2070&auto=format&fit=crop',
        quote: 'Wild at heart, together forever.',
        hashtag: '#AmaraKojoAdventures'
    },
    {
        id: 'ex-3',
        bride_name: 'Sloane Vanderbilt',
        groom_name: 'Xavier Knight',
        wedding_date: '2026-12-31',
        venue_name: 'The Glass House, NYC',
        story: 'Modern love in the heart of the city. A New Years Eve to remember.',
        motif_color: '#000000',
        template: 'Editorial',
        font: 'Modern',
        hero_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1544120190-275135a1da6b?q=80&w=2070&auto=format&fit=crop',
        quote: 'The ultimate metropolitan union.',
        hashtag: '#VogueWedding26'
    },
    {
        id: 'ex-4',
        bride_name: 'Elena Petrova',
        groom_name: 'Maximilian Duke',
        wedding_date: '2026-05-12',
        venue_name: 'Blenheim Palace, UK',
        story: 'A fairy tale beginning for two souls destined for a lifetime of grandeur.',
        motif_color: '#4B0082',
        template: 'Royal',
        font: 'Elegant',
        hero_image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=2070&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop',
        quote: 'By Royal Proclamation.',
        hashtag: '#DukePetrovaWedding'
    },
    {
        id: 'ex-5',
        bride_name: 'Mia Sun-Hee',
        groom_name: 'Oliver Thorne',
        wedding_date: '2026-04-05',
        venue_name: 'The Cherry Blossom Garden',
        story: 'Our love bloomed like the spring, constant and beautiful.',
        motif_color: '#ffc0cb',
        template: 'Whimsical',
        font: 'Traditional',
        hero_image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=1974&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
        quote: 'Where magic happens.',
        hashtag: '#BloomWithThorne'
    },
    {
        id: 'ex-6',
        bride_name: 'Jaxson Reed',
        groom_name: 'Tatum Brooks',
        wedding_date: '2025-11-14',
        venue_name: 'Industry City Loft, Brooklyn',
        story: 'Late nights, city lights, and a love that redefined everything.',
        motif_color: '#ff4500',
        template: 'Urban',
        font: 'Classic',
        hero_image: 'https://images.unsplash.com/photo-1519225495810-75178ed4e4ed?q=80&w=2070&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=2070&auto=format&fit=crop',
        quote: 'The city belongs to us.',
        hashtag: '#UrbanVows25'
    },
    {
        id: 'ex-7',
        bride_name: 'Leilani Kai',
        groom_name: 'Kai Noa',
        wedding_date: '2026-07-22',
        venue_name: 'Wailea Beach, Maui',
        story: 'The ocean brought us together, and the shore will hear our vows.',
        motif_color: '#008080',
        template: 'Tropical',
        font: 'Romantic',
        hero_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2069&auto=format&fit=crop',
        quote: 'Sun, Sand & Our Soulmate.',
        hashtag: '#KaiNoaMaui'
    },
    {
        id: 'ex-8',
        bride_name: 'Charlotte Moore',
        groom_name: 'William Sterling',
        wedding_date: '2026-08-08',
        venue_name: 'St. Pauls Cathedral',
        story: 'A classic love story, written in the stars and celebrated with tradition.',
        motif_color: '#f5f5dc',
        template: 'Classic',
        font: 'Elegant',
        hero_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=2070&auto=format&fit=crop',
        quote: 'Together with their families.',
        hashtag: '#MooreSterlingUnion'
    },
    {
        id: 'ex-9',
        bride_name: 'Iris Chen',
        groom_name: 'Leo Sato',
        wedding_date: '2026-10-10',
        venue_name: 'The Modern Art Museum',
        story: 'Minimalism at its finest. One love, one life, one perfect day.',
        motif_color: '#c0c0c0',
        template: 'Minimal',
        font: 'Traditional',
        hero_image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2072&auto=format&fit=crop',
        quote: 'Less is more, but love is everything.',
        hashtag: '#IrisLeoMinimal'
    },
    {
        id: 'ex-10',
        bride_name: 'Daisy Meadows',
        groom_name: 'Arthur Finch',
        wedding_date: '2025-06-01',
        venue_name: 'The Old Oak House',
        story: 'A vintage celebration of a love that has stood the test of time.',
        motif_color: '#8b4513',
        template: 'Vintage',
        font: 'Traditional',
        hero_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
        couple_photo: 'https://images.unsplash.com/photo-1519225421980-6e107db58848?q=80&w=2070&auto=format&fit=crop',
        quote: 'A tale from the archives of love.',
        hashtag: '#OldOakMeadows'
    }
];

export default function ExamplesSection({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const router = useRouter();

    const handleUseExample = (example: any) => {
        // Prepare data for the builder
        const builderData = {
            step: 1,
            bride_name: example.bride_name,
            groom_name: example.groom_name,
            wedding_date: example.wedding_date,
            venue_name: example.venue_name,
            story: example.story,
            motif_color: example.motif_color,
            template: example.template,
            font: example.font,
            quote: example.quote,
            hashtag: example.hashtag,
            // Images need special handling, but common URLs are fine
            hero_image_preview: example.hero_image,
            couple_photo_preview: example.couple_photo
        };

        localStorage.setItem('quickweds_builder_init', JSON.stringify(builderData));
        router.push('/builder?init=true');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md overflow-y-auto px-6 py-12"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-4xl font-serif text-white mb-2">Inspiration Gallery</h2>
                                <p className="text-white/60">Choose a starting point or explore our premium designs</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all flex items-center justify-center"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {EXAMPLES.map((example) => (
                                <motion.div
                                    key={example.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="group relative bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all"
                                >
                                    <div className="aspect-[16/10] overflow-hidden">
                                        <img
                                            src={example.hero_image}
                                            alt={`${example.bride_name} and ${example.groom_name} Wedding`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/20 to-transparent" />
                                    </div>

                                    <div className="p-8 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                                                {example.template} Theme
                                            </span>
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: example.motif_color }} />
                                        </div>

                                        <h3 className="text-2xl font-serif text-white mb-2">{example.bride_name.split(' ')[0]} & {example.groom_name.split(' ')[0]}</h3>
                                        <p className="text-white/40 text-sm line-clamp-2 mb-8 font-serif italic">&quot;{example.story}&quot;</p>

                                        <button
                                            onClick={() => handleUseExample(example)}
                                            className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-primary transition-all group/btn"
                                        >
                                            Use This Template <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
