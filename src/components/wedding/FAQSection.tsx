'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
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
    const isDark = visual.isDark;

    return (
        <section id={id} className={`relative z-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="mx-auto max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="mb-10 text-center"
                >
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl ${titleStyle.className}`} style={titleStyle.style}>Questions & Details</h2>
                    <div className={`mx-auto mt-4 ${visual.dividerClass}`} />
                </motion.div>

                <div className="border-t border-current/15">
                    {items.map((item, index) => (
                        <motion.details
                            key={`${item.question}-${index}`}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.04 }}
                            className={`group border-b py-5 sm:py-6 ${isDark ? 'border-white/15 text-white' : 'border-black/15 text-[#4A4444]'}`}
                        >
                            <summary className="flex cursor-pointer list-none items-start gap-4 text-base sm:text-lg font-medium leading-relaxed marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
                                <span className="flex-1">{item.question}</span>
                                <span aria-hidden="true" className="ml-2 text-xl transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <p className={`mt-3 pr-8 text-base leading-7 ${isDark ? 'text-white/78' : 'text-[#4A4444]/76'}`}>
                                {item.answer}
                            </p>
                        </motion.details>
                    ))}
                </div>
            </div>
        </section>
    );
}
