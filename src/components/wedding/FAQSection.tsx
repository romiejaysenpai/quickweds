'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircleQuestion } from 'lucide-react';
import { useSectionContext } from '@/context/SectionContext';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';

interface FAQItem {
    question: string;
    answer: string;
}

function parseFAQItems(value: unknown): FAQItem[] {
    if (Array.isArray(value)) {
        return value
            .map((item) => ({
                question: String((item as FAQItem)?.question || '').trim(),
                answer: String((item as FAQItem)?.answer || '').trim(),
            }))
            .filter((item) => item.question && item.answer);
    }

    if (typeof value !== 'string' || !value.trim()) return [];

    try {
        const parsed = JSON.parse(value);
        return parseFAQItems(parsed);
    } catch {
        return [];
    }
}

export default function FAQSection({ faqItems, wedding, id = 'faq' }: { faqItems?: unknown; wedding?: any; id?: string }) {
    const { registerSection, unregisterSection } = useSectionContext();
    const items = parseFAQItems(faqItems ?? wedding?.faq_items);

    useEffect(() => {
        if (items.length === 0) return;
        registerSection(id, 'FAQs');
        return () => unregisterSection(id);
    }, [id, items.length, registerSection, unregisterSection]);

    if (items.length === 0) return null;

    const template = wedding?.template || 'classic';
    const motifColor = wedding?.motif_color || '#D16C78';
    const visual = getTemplateVisualProfile(template, motifColor, false, wedding?.card_style);
    const titleStyle = wedding ? getSectionTitleStyle(wedding, visual.headingClass) : { className: visual.headingClass, style: undefined };
    const isDark = ['royal', 'midnight', 'cinematic', 'urban', 'glitch', 'film'].includes(template);

    return (
        <section id={id} className={`relative z-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="mb-10 text-center"
                >
                    <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${isDark ? 'border-white/15 bg-white/10' : 'border-primary/15 bg-white/70'} shadow-sm`}>
                        <MessageCircleQuestion className="h-7 w-7 stroke-[1.6] text-primary" />
                    </div>
                    <div className="mb-3 flex items-center justify-center">
                        <span className={visual.badgeStyleClass || `text-[10px] font-black uppercase ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}FAQS` : 'Guest notes'}
                        </span>
                    </div>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl ${titleStyle.className}`} style={titleStyle.style}>Questions & Details</h2>
                    <div className={`mx-auto mt-4 ${visual.dividerClass}`} />
                    <p className={`mx-auto mt-4 max-w-2xl text-sm leading-6 ${isDark ? 'text-white/76' : 'text-[#4A4444]/74'}`}>
                        A clean guide for the details guests usually ask about.
                    </p>
                </motion.div>

                <div className="grid gap-3 md:grid-cols-2">
                    {items.map((item, index) => (
                        <motion.details
                            key={`${item.question}-${index}`}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.04 }}
                            className={`group p-5 backdrop-blur ${visual.cardClass}`}
                        >
                            <summary className="flex cursor-pointer list-none items-start gap-3 font-serif text-lg leading-snug marker:hidden">
                                <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 stroke-[1.6] text-primary" />
                                <span className="flex-1">{item.question}</span>
                                <span className="ml-2 text-primary transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <p className={`mt-4 pl-8 text-sm leading-6 ${isDark ? 'text-white/78' : 'text-[#4A4444]/76'}`}>
                                {item.answer}
                            </p>
                        </motion.details>
                    ))}
                </div>
            </div>
        </section>
    );
}
