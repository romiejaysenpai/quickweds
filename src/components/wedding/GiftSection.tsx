'use client';

import { motion } from 'framer-motion';
import type { Wedding } from '@/types/wedding';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
import { copyToClipboard } from '@/lib/client-clipboard';

interface GiftSectionProps {
    wedding: Wedding;
    invert?: boolean;
    id: string;
}

export default function GiftSection({ wedding, invert = false, id }: GiftSectionProps) {
    const { registerSection, unregisterSection } = useSectionContext();

    let registryLinks: { title?: string; label?: string; url: string }[] = [];
    let cashFunds: { title: string; description?: string; targetAmount: number; currency?: string; current?: number }[] = [];
    let paymentLinks: { title?: string; label?: string; type?: string; url: string }[] = [];

    try {
        if (wedding.gift_registry_links) registryLinks = typeof wedding.gift_registry_links === 'string' ? JSON.parse(wedding.gift_registry_links) : wedding.gift_registry_links;
        if (wedding.cash_funds) cashFunds = typeof wedding.cash_funds === 'string' ? JSON.parse(wedding.cash_funds) : wedding.cash_funds;
        if (wedding.payment_links) paymentLinks = typeof wedding.payment_links === 'string' ? JSON.parse(wedding.payment_links) : wedding.payment_links;
    } catch { }

    const hasGiftDetails = Boolean(
        wedding.gift_bank ||
        wedding.gift_qr_image ||
        wedding.gift_account_number ||
        registryLinks.length > 0 ||
        cashFunds.length > 0 ||
        paymentLinks.length > 0
    );

    useEffect(() => {
        if (hasGiftDetails) registerSection(id, 'Gift');
        return () => unregisterSection(id);
    }, [hasGiftDetails, id, registerSection, unregisterSection]);

    if (!hasGiftDetails) return null;

    const template = wedding.template || 'classic';
    const motifColor = wedding.motif_color || '#D16C78';
    const visual = getTemplateVisualProfile(template, motifColor, invert);
    const isSharp = ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);
    const isVintage = ['vintage', 'rustic', 'boho', 'film'].includes(template);

    const cardClass = isSharp
        ? visual.cardClass
        : isVintage
            ? visual.cardClass
            : visual.cardClass;

    return (
        <section id={id} className={`py-24 md:py-40 relative z-10 overflow-hidden ${visual.sectionClass}`} style={visual.sectionStyle}>
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-20 md:mb-32"
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.6 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        style={{ letterSpacing: '0.4em' }}
                        className={`text-[10px] md:text-xs uppercase font-black mb-6 block ${visual.eyebrowClass}`}
                    >
                        Foundation for our Future
                    </motion.span>
                    <h2 className={`text-5xl md:text-7xl mb-8 tracking-tight ${visual.headingClass}`}>{visual.giftTitle}</h2>
                    <p className={`text-xl md:text-2xl leading-relaxed font-serif italic max-w-3xl mx-auto opacity-80 break-words px-4 ${visual.bodyClass}`}>
                        Your presence is our greatest joy. If you wish to celebrate with a gift, our registries and funds are listed below.
                    </p>
                    <div className={`mx-auto mt-6 ${visual.dividerClass}`} />
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-12 md:gap-20 items-start">
                    <div className="flex-1 space-y-8 md:space-y-12 w-full">
                        {/* Bank Details Spotlight */}
                        {(wedding.gift_bank || wedding.gift_account_name || wedding.gift_account_number) && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.1 }}
                                className={`relative group p-6 sm:p-10 md:p-14 ${cardClass}`}
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 21h18M3 10h18M5 10V21M19 10V21M9 10V21M15 10V21M3 10l9-7 9 7" /></svg>
                                </div>
                                <div className="space-y-10 relative z-10 text-left">
                                    {wedding.gift_bank && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 mb-2">Financial Institution</p>
                                            <p className="text-2xl md:text-3xl font-black tracking-tight break-words">{wedding.gift_bank}</p>
                                        </div>
                                    )}
                                    {wedding.gift_account_name && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 mb-2">Account Bearer</p>
                                            <p className="text-2xl md:text-3xl font-serif italic break-words">{wedding.gift_account_name}</p>
                                        </div>
                                    )}
                                    {wedding.gift_account_number && (
                                        <div className="bg-primary/[0.03] p-6 rounded-2xl border border-primary/5">
                                            <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 mb-3">Electronic Transfer Number</p>
                                            <p className="font-mono text-xl md:text-3xl tracking-[0.1em] select-all font-bold flex items-center justify-between gap-4 break-words">
                                                {wedding.gift_account_number}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!wedding.gift_account_number) return;
                                                        void copyToClipboard(wedding.gift_account_number);
                                                    }}
                                                    className="rounded-full bg-primary/10 px-3 py-1 text-[8px] uppercase tracking-widest opacity-70 transition-opacity hover:opacity-100"
                                                >
                                                    Copy
                                                </button>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Gift Registry Links with Premium List Style */}
                        {registryLinks.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`p-6 sm:p-10 md:p-14 ${cardClass}`}
                            >
                                <div className="flex items-center justify-between mb-10">
                                    <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Selected Registries</p>
                                    <div className="h-px bg-primary/20 flex-1 ml-6" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {registryLinks.map((link, i) => (
                                        <motion.a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className={`flex items-center justify-between p-6 overflow-hidden relative transition-all duration-500 group ${isSharp
                                                    ? 'border border-primary/20 hover:bg-primary/5 rounded-none'
                                                    : 'bg-white/50 backdrop-blur-sm hover:bg-white rounded-3xl border border-primary/5'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.03] transition-opacity" />
                                            <span className="font-black text-sm md:text-base uppercase tracking-wider relative z-10">{link.title || link.label || 'Registry'}</span>
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                                                <span className="text-xs">↗</span>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {paymentLinks.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.25 }}
                                className={`p-6 sm:p-10 md:p-14 ${cardClass}`}
                            >
                                <div className="mb-8 flex items-center justify-between">
                                    <p className="text-[10px] uppercase tracking-[0.32em] font-black opacity-35">Digital Gifting</p>
                                    <div className="ml-6 h-px flex-1 bg-primary/20" />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {paymentLinks.map((link, i) => (
                                        <a
                                            key={`${link.title || link.label || link.type || 'payment'}-${i}`}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex min-h-[56px] items-center justify-between gap-4 border p-4 text-sm font-black uppercase tracking-[0.14em] transition-colors ${
                                                isSharp ? 'rounded-none border-primary/20 hover:bg-primary/5' : 'rounded-2xl border-primary/10 bg-white/55 hover:bg-white'
                                            }`}
                                        >
                                            <span className="break-words">{link.title || link.label || link.type || 'Payment Link'}</span>
                                            <span aria-hidden="true" className="shrink-0 text-primary">↗</span>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {cashFunds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className={`p-6 sm:p-10 md:p-14 ${cardClass}`}
                            >
                                <div className="mb-8 flex items-center justify-between">
                                    <p className="text-[10px] uppercase tracking-[0.32em] font-black opacity-35">Cash Funds</p>
                                    <div className="ml-6 h-px flex-1 bg-primary/20" />
                                </div>
                                <div className="space-y-5">
                                    {cashFunds.map((fund, i) => {
                                        const current = Number(fund.current || 0);
                                        const target = Number(fund.targetAmount || 0);
                                        const progress = target > 0 ? Math.min(100, Math.max(0, Math.round((current / target) * 100))) : 0;
                                        const currency = fund.currency || '';

                                        return (
                                            <div key={`${fund.title}-${i}`} className="rounded-2xl border border-primary/10 bg-white/55 p-5">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <h3 className="font-serif text-2xl leading-tight">{fund.title}</h3>
                                                        {fund.description && <p className="mt-2 text-sm leading-6 opacity-65">{fund.description}</p>}
                                                    </div>
                                                    {target > 0 && (
                                                        <p className="shrink-0 text-xs font-black uppercase tracking-[0.18em] opacity-45">
                                                            {currency}{current.toLocaleString()} / {currency}{target.toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                                {target > 0 && (
                                                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-primary/10">
                                                        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* QR Code Showcase with Glassmorphic Frame */}
                    {wedding.gift_qr_image && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full lg:w-[450px] shrink-0 sticky top-32"
                        >
                            <div className={`relative p-8 md:p-12 overflow-hidden ${cardClass}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-30" />

                                <div className={`aspect-square overflow-hidden bg-white/80 p-6 shadow-2xl relative z-10 ${isSharp ? 'rounded-none' : 'rounded-[2rem]'
                                    }`}>
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
                                    <img
                                        src={wedding.gift_qr_image}
                                        alt="Payment QR Code"
                                        className="w-full h-full object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent pointer-events-none" />
                                </div>

                                <div className="text-center mt-12 relative z-10">
                                    <p className="text-[10px] uppercase tracking-[0.5em] font-black opacity-30 mb-2">Instant Transfer</p>
                                    <p className="text-sm font-serif italic text-primary/60">Scan to gift digitally</p>

                                    <div className="flex justify-center gap-2 mt-8 opacity-20">
                                        <div className="w-8 h-8 rounded-full border border-current" />
                                        <div className="w-8 h-8 rounded-full border border-current" />
                                        <div className="w-8 h-8 rounded-full border border-current" />
                                    </div>
                                </div>

                                {/* Floating Decorative Element */}
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px] opacity-50" />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
