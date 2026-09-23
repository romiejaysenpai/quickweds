'use client';

import { motion } from 'framer-motion';
import type { Wedding } from '@/types/wedding';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
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
    const visual = getTemplateVisualProfile(template, motifColor, invert, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const isSharp = ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);

    const labelClass = visual.isDark ? 'text-white/72' : 'text-[#4A4444]/68';
    const mutedTextClass = visual.isDark ? 'text-white/72' : 'text-[#4A4444]/68';
    const cardClass = visual.cardClass;
    const insetClass = visual.isDark ? 'bg-white/5 border-white/15' : 'bg-white/55 border-black/10';

    return (
        <section id={id} className={`py-16 md:py-24 relative z-10 overflow-hidden ${visual.sectionClass}`} style={visual.sectionStyle}>
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-5xl mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-10 md:mb-14"
                >
                    <div className="mb-6 flex items-center justify-center">
                        <span className={visual.badgeStyleClass || `text-xs md:text-xs uppercase font-black block ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}REGISTRY` : 'With love'}
                        </span>
                    </div>
                    <h2 className={`text-4xl md:text-5xl mb-6 tracking-tight ${titleStyle.className}`} style={titleStyle.style}>{visual.giftTitle}</h2>
                    <p className={`text-base md:text-lg leading-relaxed max-w-3xl mx-auto opacity-80 break-words px-4 ${visual.bodyClass}`}>
                        Your presence is our greatest joy. If you wish to celebrate with a gift, our registries and funds are listed below.
                    </p>
                    <div className={`mx-auto mt-6 ${visual.dividerClass}`} />
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
                    <div className="flex-1 space-y-5 md:space-y-6 w-full">
                        {/* Bank Details Spotlight */}
                        {(wedding.gift_bank || wedding.gift_account_name || wedding.gift_account_number) && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.1 }}
                                className={`relative group p-5 sm:p-7 ${cardClass}`}
                            >
                                <details className="group/details">
                                    <summary className="cursor-pointer py-2 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-4">Bank transfer details</summary>
                                <div className="mt-6 space-y-5 relative z-10 text-left">
                                    {wedding.gift_bank && (
                                        <div>
                                            <p className={`text-xs uppercase tracking-[0.3em] font-black mb-2 ${labelClass}`}>Bank</p>
                                            <p className="text-xl md:text-2xl font-medium tracking-tight break-words">{wedding.gift_bank}</p>
                                        </div>
                                    )}
                                    {wedding.gift_account_name && (
                                        <div>
                                            <p className={`text-xs uppercase tracking-[0.3em] font-black mb-2 ${labelClass}`}>Account name</p>
                                            <p className="text-xl md:text-2xl font-serif break-words">{wedding.gift_account_name}</p>
                                        </div>
                                    )}
                                    {wedding.gift_account_number && (
                                        <div className="bg-primary/[0.03] p-6 rounded-2xl border border-primary/5">
                                            <p className={`text-xs uppercase tracking-[0.3em] font-black mb-3 ${labelClass}`}>Account number</p>
                                            <p className="font-mono text-base md:text-xl select-all font-medium flex flex-wrap items-center justify-between gap-3 [overflow-wrap:anywhere]">
                                                {wedding.gift_account_number}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!wedding.gift_account_number) return;
                                                        void copyToClipboard(wedding.gift_account_number);
                                                    }}
                                                    className="rounded-full bg-primary/10 px-4 py-3 text-xs uppercase tracking-widest opacity-70 transition-opacity hover:opacity-100"
                                                >
                                                    Copy
                                                </button>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                </details>
                            </motion.div>
                        )}

                        {/* Gift Registry Links with Premium List Style */}
                        {registryLinks.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`p-5 sm:p-7 ${cardClass}`}
                            >
                                <div className="flex items-center justify-between mb-10">
                                    <p className={`text-xs uppercase tracking-[0.18em] font-black ${labelClass}`}>Selected Registries</p>
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
                                                    : `rounded-xl border ${insetClass}`
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
                                className={`p-5 sm:p-7 ${cardClass}`}
                            >
                                <div className="mb-8 flex items-center justify-between">
                                    <p className={`text-xs uppercase tracking-[0.32em] font-black ${labelClass}`}>Digital Gifting</p>
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
                                                isSharp ? 'rounded-none border-primary/20 hover:bg-primary/5' : `rounded-xl ${insetClass}`
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
                                className={`p-5 sm:p-7 ${cardClass}`}
                            >
                                <div className="mb-8 flex items-center justify-between">
                                    <p className={`text-xs uppercase tracking-[0.32em] font-black ${labelClass}`}>Cash Funds</p>
                                    <div className="ml-6 h-px flex-1 bg-primary/20" />
                                </div>
                                <div className="space-y-5">
                                    {cashFunds.map((fund, i) => {
                                        const current = Number(fund.current || 0);
                                        const target = Number(fund.targetAmount || 0);
                                        const progress = target > 0 ? Math.min(100, Math.max(0, Math.round((current / target) * 100))) : 0;
                                        const currency = fund.currency || '';

                                        return (
                                            <div key={`${fund.title}-${i}`} className={`rounded-xl border p-5 ${insetClass}`}>
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <h3 className="font-serif text-2xl leading-tight">{fund.title}</h3>
                                                        {fund.description && <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>{fund.description}</p>}
                                                    </div>
                                                    {target > 0 && (
                                                        <p className={`shrink-0 text-xs font-black uppercase tracking-[0.18em] ${mutedTextClass}`}>
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

                    {/* QR Code Showcase */}
                    {wedding.gift_qr_image && (
                        <div className="w-full shrink-0 lg:sticky lg:top-32 lg:w-[300px]">
                            <div className={`relative overflow-hidden p-5 sm:p-7 md:p-9 ${cardClass}`}>
                                <div className="relative z-10 text-center">
                                    <p className={`text-xs font-black uppercase tracking-[0.36em] ${visual.eyebrowClass}`}>
                                        Instant Transfer
                                    </p>
                                    <h3 className={`mt-4 text-3xl leading-tight md:text-4xl ${visual.headingClass}`}>
                                        Scan to Gift
                                    </h3>
                                    <p className={`mx-auto mt-4 max-w-xs text-sm leading-6 ${visual.bodyClass}`}>
                                        Open your payment app and scan this code. Please check the account details before sending.
                                    </p>
                                </div>

                                <div className="relative z-10 mx-auto mt-8 max-w-[220px]">
                                    <div className={`bg-white p-3 shadow-[0_18px_55px_rgba(0,0,0,0.18)] ${isSharp ? 'rounded-none' : 'rounded-[1.65rem]'}`}>
                                        <div className={`bg-white p-3 ring-1 ring-black/10 ${isSharp ? 'rounded-none' : 'rounded-[1.15rem]'}`}>
                                            <img
                                                src={wedding.gift_qr_image}
                                                alt="Payment QR code for digital gifting"
                                                className="aspect-square h-auto w-full bg-white object-contain opacity-100"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    </div>
                                    <p className={`mx-auto mt-4 max-w-[260px] text-center text-xs font-black uppercase leading-5 tracking-[0.22em] ${labelClass}`}>
                                        Keep the full square visible while scanning
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
