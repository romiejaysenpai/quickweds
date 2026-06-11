'use client';

import { motion } from 'framer-motion';
import { Camera, Heart, MapPin, Sparkles, Star } from 'lucide-react';

interface Milestone {
    date: string;
    title: string;
    description: string;
    icon?: 'heart' | 'star' | 'camera' | 'pin' | 'sparkles';
    image?: string;
}

const iconMap = {
    heart: Heart,
    star: Star,
    camera: Camera,
    pin: MapPin,
    sparkles: Sparkles
};

interface MilestoneTimelineProps {
    milestones: Milestone[];
    motifColor: string;
}

export default function MilestoneTimeline({ milestones, motifColor }: MilestoneTimelineProps) {
    if (!milestones || milestones.length === 0) return null;

    return (
        <section className="py-24 px-6 max-w-5xl mx-auto overflow-hidden">
            <div className="text-center mb-20">
                <motion.span 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-[10px] uppercase tracking-[0.5em] font-black text-primary mb-4 block"
                >
                    Our Story
                </motion.span>
                <h2 className="text-4xl md:text-6xl font-serif text-foreground">The Journey to Us</h2>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-primary/20"
                    style={{ backgroundColor: motifColor + '40' }}
                />

                <div className="space-y-24">
                    {milestones.map((milestone, index) => {
                        const Icon = iconMap[milestone.icon || 'heart'];
                        const isEven = index % 2 === 0;

                        return (
                            <div key={index} className={`relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-24 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                {/* Content Card */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                    className="w-full md:w-1/2 flex flex-col items-center z-20"
                                >
                                    <div className={`
                                        p-6 md:p-10 bg-white dark:bg-white/5 border border-border/50 rounded-[2rem] md:rounded-[2.5rem] soft-shadow 
                                        text-center w-full max-w-sm relative group
                                    `}>
                                        {milestone.image && (
                                            <div className="mb-6 rounded-2xl overflow-hidden aspect-video relative">
                                                <img src={milestone.image} alt={milestone.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                                            </div>
                                        )}
                                        <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-3" style={{ color: motifColor }}>
                                            {milestone.date}
                                        </p>
                                        <h3 className="text-xl md:text-2xl font-serif text-foreground mb-4 break-words">{milestone.title}</h3>
                                        <p className="text-sm md:text-base text-text-secondary leading-relaxed font-serif italic break-words">
                                            &quot;{milestone.description}&quot;
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Icon Node */}
                                <div className="absolute left-1/2 -translate-x-1/2 z-10 md:block hidden">
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -45 }}
                                        whileInView={{ scale: 1, rotate: 0 }}
                                        viewport={{ once: true }}
                                        className="w-12 h-12 bg-neutral border-2 border-primary rounded-full flex items-center justify-center shadow-lg"
                                        style={{ borderColor: motifColor }}
                                    >
                                        <Icon className="w-5 h-5 text-primary" style={{ color: motifColor }} />
                                    </motion.div>
                                </div>

                                {/* Placeholder for empty side */}
                                <div className="hidden md:block md:w-1/2" />
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="text-center mt-24">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="inline-block p-4 rounded-full bg-primary/10"
                >
                    <Heart className="w-6 h-6 text-primary fill-primary" style={{ color: motifColor }} />
                </motion.div>
                <p className="font-serif italic text-primary/60 mt-4">And so the story continues...</p>
            </div>
        </section>
    );
}
