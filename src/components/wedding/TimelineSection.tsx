'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimelineSectionProps {
    timeline: string;
}

export default function TimelineSection({ timeline }: TimelineSectionProps) {
    if (!timeline) return null;
    return (
        <section className="py-24 bg-white/30 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <Clock className="w-12 h-12 text-primary mx-auto mb-6 opacity-30" />
                    <h2 className="text-4xl md:text-5xl font-serif text-[#4A4444]">The Program</h2>
                </div>
                <div className="bg-white/50 border border-primary/5 p-8 md:p-12 rounded-[3.5rem] soft-shadow">
                    <p className="whitespace-pre-wrap font-serif text-xl leading-relaxed text-foreground/70 text-center">
                        {timeline}
                    </p>
                </div>
            </div>
        </section>
    );
}
