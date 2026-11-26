'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSectionActions } from '@/context/SectionContext';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { SectionTemplateElement } from './SectionTemplateElement';

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
    const { registerSection, unregisterSection } = useSectionActions();
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
        <section
            data-wedding-section="faq"
            id={id}
            className={`relative z-10 overflow-x-clip px-4 py-16 sm:px-6 sm:py-24 ${visual.sectionClass}`}
            style={visual.sectionStyle}
        >
            <div className="mx-auto max-w-5xl grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="text-center lg:col-span-4 lg:sticky lg:top-28 lg:self-start lg:text-left"
                >
                    <div className="mb-4 flex items-center justify-center lg:justify-start">
                        <span
                            data-wedding-badge="true"
                            className={visual.badgeStyleClass || `text-[11px] font-medium uppercase ${visual.eyebrowClass}`}
                        >
                            Guest Guide
                        </span>
                    </div>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl leading-tight ${titleStyle.className}`} style={titleStyle.style}>
                        Questions &amp; Details
                    </h2>
                    <div data-wedding-divider="true" className={`mx-auto mt-5 lg:mx-0 ${visual.dividerClass}`} />
                    <p className={`mt-5 text-sm leading-7 sm:text-base ${isDark ? 'text-white/70' : 'text-[#4A4444]/72'}`}>
                        Everything you need to plan your visit and celebrate comfortably with us.
                    </p>
                    {wedding?.contact_person && (
                        <p className={`mt-4 text-xs uppercase tracking-[0.2em] opacity-75 ${visual.bodyClass}`}>
                            Questions? {wedding.contact_person}
                        </p>
                    )}
                    <SectionTemplateElement wedding={wedding} isDark={isDark} placement="divider" className="mt-6 lg:hidden" />
                </motion.div>

                <div className="border-t border-current/15 lg:col-span-8">
                    {items.map((item, index) => (
                        <motion.details
                            key={`${item.question}-${index}`}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: Math.min(index * 0.04, 0.2) }}
                            className={`group border-b py-5 sm:py-6 ${isDark ? 'border-white/15 text-white' : 'border-black/12 text-[#352C2C]'}`}
                        >
                            <summary
                                data-wedding-control="quiet"
                                className="flex cursor-pointer list-none items-start gap-4 text-left text-base font-medium leading-relaxed marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current sm:text-lg"
                            >
                                <span aria-hidden="true" className="mt-1 shrink-0 font-mono text-[11px] tracking-[0.2em] text-primary opacity-75 tabular-nums">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="flex-1 font-serif text-lg sm:text-xl">{item.question}</span>
                                <span aria-hidden="true" className="ml-2 text-xl font-light opacity-60 transition-transform duration-300 group-open:rotate-45">+</span>
                            </summary>
                            <p className={`mt-3 pl-8 pr-6 text-sm leading-7 sm:text-base ${isDark ? 'text-white/78' : 'text-[#4A4444]/76'}`}>
                                {item.answer}
                            </p>
                        </motion.details>
                    ))}
                </div>
            </div>
        </section>
    );
}
