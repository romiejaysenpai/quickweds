'use client';

import type { WeddingPartyMember } from '@/types/wedding';
import { motion } from 'framer-motion';

interface WeddingPartySectionProps {
    members: WeddingPartyMember[];
}

export default function WeddingPartySection({ members }: WeddingPartySectionProps) {
    if (!members || members.length === 0) return null;

    return (
        <section className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block opacity-60">Meet Our People</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-[#4A4444]">The Wedding Party</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {members.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center group"
                        >
                            <div className="w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-6 soft-shadow bg-white p-2 border border-primary/5">
                                {member.photo ? (
                                    <img
                                        src={member.photo}
                                        alt={member.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover rounded-[2rem] group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-[2rem] bg-primary/5 flex items-center justify-center">
                                        <span className="text-4xl font-serif text-primary/30">{member.name.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-serif font-bold text-[#4A4444] mb-1">{member.name}</h3>
                            <p className="text-xs uppercase tracking-widest font-bold text-primary/60 mb-2">{member.role}</p>
                            {member.bio && (
                                <p className="text-sm text-foreground/50 italic font-serif">{member.bio}</p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
