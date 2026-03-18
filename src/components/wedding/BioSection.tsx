'use client';

import { Quote } from 'lucide-react';
import type { Wedding } from '@/types/wedding';

interface BioSectionProps {
    wedding: Wedding;
}

export default function BioSection({ wedding }: BioSectionProps) {
    return (
        <section className="max-w-6xl mx-auto px-6 py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="relative">
                    <div className="aspect-[4/5] rounded-[4rem] overflow-hidden soft-shadow border-[12px] border-white -rotate-2">
                        <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover" />
                    </div>
                </div>
                <div>
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6 block">Our Love Story</span>
                    <h2 className="text-6xl font-serif mb-8 text-[#4A4444] leading-tight">Meant to Be</h2>
                    <p className="text-xl leading-relaxed text-foreground/70 font-serif italic mb-12 opacity-80">
                        {wedding.story || "They say when you know, you know. For us, every moment since we met has been a beautiful step towards this day."}
                    </p>
                    <div className="p-10 rounded-[3rem] bg-white border border-primary/5 soft-shadow flex gap-6 items-start text-left">
                        <Quote className="w-12 h-12 text-primary opacity-20 flex-shrink-0" />
                        <p className="italic text-primary/80 font-serif text-lg leading-relaxed">
                            {wedding.quote || "A successful marriage requires falling in love many times, always with the same person."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
