'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, Copy, Download } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useSectionActions } from '@/context/SectionContext';
import { useEffect, useState } from 'react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { SectionTemplateElement } from './SectionTemplateElement';
import { copyToClipboard } from '@/lib/client-clipboard';
import { toSafeHttpUrl } from '@/lib/url-safety';

function safeParseList<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value as T[];
    if (typeof value !== 'string' || !value.trim()) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
        return [];
    }
}

interface GiftSectionProps {
    wedding: Wedding;
    invert?: boolean;
    id: string;
}

export default function GiftSection({ wedding, invert = false, id }: GiftSectionProps) {
    const { registerSection, unregisterSection } = useSectionActions();
    const [copiedField, setCopiedField] = useState<'account' | 'name' | null>(null);
    const [savingQr, setSavingQr] = useState(false);

    const registryLinks = safeParseList<{ title?: string; label?: string; url: string }>(wedding.gift_registry_links);
    const cashFunds = safeParseList<{ title: string; description?: string; targetAmount: number; currency?: string; current?: number }>(wedding.cash_funds);
    const paymentLinks = safeParseList<{ title?: string; label?: string; type?: string; url: string }>(wedding.payment_links);

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

    useEffect(() => {
        if (!copiedField) return;
        const timer = window.setTimeout(() => setCopiedField(null), 2000);
        return () => window.clearTimeout(timer);
    }, [copiedField]);

    if (!hasGiftDetails) return null;

    const template = wedding.template || 'classic';
    const motifColor = wedding.motif_color || '#D16C78';
    const visual = getTemplateVisualProfile(template, motifColor, invert, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const isSharp = visual.isSharp || ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);

    const labelClass = visual.isDark ? 'text-white/70' : 'text-[#4A4444]/68';
    const mutedTextClass = visual.isDark ? 'text-white/72' : 'text-[#4A4444]/70';
    const cardClass = visual.cardClass;
    const insetClass = visual.isDark ? 'bg-white/[0.04] border-white/15' : 'bg-white/60 border-black/10';

    const handleCopy = async (text: string, field: 'account' | 'name') => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                await copyToClipboard(text);
            }
            setCopiedField(field);
        } catch {
            try {
                await copyToClipboard(text);
                setCopiedField(field);
            } catch {
                setCopiedField(null);
            }
        }
    };

    const handleSaveQr = async () => {
        if (!wedding.gift_qr_image || savingQr) return;
        setSavingQr(true);
        const filename = `${(wedding.bride_name || 'wedding').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-gift-qr.png`;
        try {
            const response = await fetch(wedding.gift_qr_image);
            if (!response.ok) throw new Error('Unable to fetch QR image');
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch {
            const safeQrUrl = toSafeHttpUrl(wedding.gift_qr_image);
            if (safeQrUrl) {
                window.open(safeQrUrl, '_blank', 'noopener,noreferrer');
            }
        } finally {
            setSavingQr(false);
        }
    };

    return (
        <section data-wedding-section="gift" id={id} className={`py-16 md:py-24 relative z-10 overflow-x-clip ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="max-w-5xl mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-10 md:mb-14"
                >
                    <div className="mb-5 flex items-center justify-center">
                        <span data-wedding-badge="true" className={visual.badgeStyleClass || `text-[11px] uppercase font-medium block ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}Registry` : 'With Love'}
                        </span>
                    </div>
                    <h2 className={`text-4xl md:text-5xl mb-5 tracking-tight ${titleStyle.className}`} style={titleStyle.style}>{visual.giftTitle}</h2>
                    <p className={`text-base md:text-lg leading-relaxed max-w-2xl mx-auto opacity-85 break-words px-4 ${visual.bodyClass}`}>
                        Your presence is our greatest joy. If you wish to honor us with a gift, our registries and wishes are shared below.
                    </p>
                    <div data-wedding-divider="true" className={`mx-auto mt-6 ${visual.dividerClass}`} />
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
                    <div className="flex-1 space-y-5 md:space-y-6 w-full">
                        {/* Bank Details Spotlight */}
                        {(wedding.gift_bank || wedding.gift_account_name || wedding.gift_account_number) && (
                            <motion.div data-wedding-card="true"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.05 }}
                                className={`relative overflow-hidden group p-5 sm:p-7 ${cardClass}`}
                            >
                                <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="card-seal" />
                                <details className="relative z-10 group/details" open={!registryLinks.length && !paymentLinks.length && !cashFunds.length}>
                                    <summary
                                        data-wedding-control="quiet"
                                        className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-4 marker:hidden"
                                    >
                                        <div>
                                            <span className={`block text-[11px] uppercase tracking-[0.24em] font-medium ${labelClass}`}>
                                                Direct Transfer
                                            </span>
                                            <span className="mt-1 block font-serif text-xl sm:text-2xl">
                                                Bank Transfer Details
                                            </span>
                                        </div>
                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center border border-current/20 transition-transform duration-300 group-open/details:rotate-180 ${isSharp ? 'rounded-none' : 'rounded-full'}`}>
                                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                    </summary>
                                    <div className="mt-6 space-y-5 border-t border-current/10 pt-6 relative z-10 text-left">
                                        {wedding.gift_bank && (
                                            <div>
                                                <p className={`text-[11px] uppercase tracking-[0.24em] font-medium mb-1.5 ${labelClass}`}>Bank</p>
                                                <p className="text-lg md:text-xl font-medium tracking-tight break-words">{wedding.gift_bank}</p>
                                            </div>
                                        )}
                                        {wedding.gift_account_name && (
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className={`text-[11px] uppercase tracking-[0.24em] font-medium mb-1.5 ${labelClass}`}>Account Name</p>
                                                    <p className="text-lg md:text-xl font-serif break-words">{wedding.gift_account_name}</p>
                                                </div>
                                                <button
                                                    data-wedding-control="secondary"
                                                    type="button"
                                                    onClick={() => wedding.gift_account_name && void handleCopy(wedding.gift_account_name, 'name')}
                                                    className={`inline-flex min-h-10 items-center gap-1.5 border border-current/20 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-current/5 ${isSharp ? 'rounded-none' : 'rounded-full'}`}
                                                >
                                                    {copiedField === 'name' ? (
                                                        <>
                                                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        {wedding.gift_account_number && (
                                            <div data-wedding-card="true" className={`p-4 sm:p-5 border ${insetClass} ${isSharp ? 'rounded-none' : 'rounded-2xl'}`}>
                                                <p className={`text-[11px] uppercase tracking-[0.24em] font-medium mb-2 ${labelClass}`}>Account Number</p>
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <p className="font-mono text-base md:text-lg select-all font-medium [overflow-wrap:anywhere]">
                                                        {wedding.gift_account_number}
                                                    </p>
                                                    <button data-wedding-control="primary"
                                                        type="button"
                                                        onClick={() => wedding.gift_account_number && void handleCopy(wedding.gift_account_number, 'account')}
                                                        className={`inline-flex min-h-10 items-center gap-1.5 bg-primary/12 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-primary/20 ${isSharp ? 'rounded-none' : 'rounded-full'}`}
                                                    >
                                                        {copiedField === 'account' ? (
                                                            <>
                                                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                                Copied
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                                                Copy
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            </motion.div>
                        )}

                        {/* Gift Registry Links */}
                        {registryLinks.length > 0 && (
                            <motion.div data-wedding-card="true"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className={`p-5 sm:p-7 ${cardClass}`}
                            >
                                <div className="flex items-center justify-between mb-7">
                                    <p className={`text-[11px] uppercase tracking-[0.24em] font-medium ${labelClass}`}>Selected Registries</p>
                                    <div className="h-px bg-current/15 flex-1 ml-5" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {registryLinks.map((link, i) => {
                                        const safeHref = toSafeHttpUrl(link.url);
                                        if (!safeHref) return null;
                                        return (
                                        <motion.a data-wedding-control="secondary"
                                            key={i}
                                            href={safeHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -2 }}
                                            className={`flex items-center justify-between gap-3 p-5 overflow-hidden relative transition-colors duration-300 group ${isSharp
                                                    ? 'border border-current/20 hover:bg-current/5 rounded-none'
                                                    : `rounded-xl border ${insetClass} hover:border-primary/40`
                                                }`}
                                        >
                                            <span className="font-serif text-lg tracking-tight relative z-10 break-words">{link.title || link.label || 'Registry'}</span>
                                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center border border-current/15 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white ${isSharp ? 'rounded-none' : 'rounded-full'}`}>
                                                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        </motion.a>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {paymentLinks.length > 0 && (
                            <motion.div data-wedding-card="true"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.15 }}
                                className={`p-5 sm:p-7 ${cardClass}`}
                            >
                                <div className="mb-7 flex items-center justify-between">
                                    <p className={`text-[11px] uppercase tracking-[0.24em] font-medium ${labelClass}`}>Digital Gifting</p>
                                    <div className="ml-5 h-px flex-1 bg-current/15" />
                                </div>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    {paymentLinks.map((link, i) => {
                                        const safeHref = toSafeHttpUrl(link.url);
                                        if (!safeHref) return null;
                                        return (
                                        <a data-wedding-control="secondary"
                                            key={`${link.title || link.label || link.type || 'payment'}-${i}`}
                                            href={safeHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`group flex min-h-[56px] items-center justify-between gap-4 border p-4 text-sm font-medium tracking-wide transition-colors ${
                                                isSharp ? 'rounded-none border-current/20 hover:bg-current/5' : `rounded-xl ${insetClass} hover:border-primary/40`
                                            }`}
                                        >
                                            <span className="font-serif text-base break-words">{link.title || link.label || link.type || 'Payment Link'}</span>
                                            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                        </a>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {cashFunds.length > 0 && (
                            <motion.div data-wedding-card="true"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className={`p-5 sm:p-7 ${cardClass}`}
                            >
                                <div className="mb-7 flex items-center justify-between">
                                    <p className={`text-[11px] uppercase tracking-[0.24em] font-medium ${labelClass}`}>Wishing Well &amp; Funds</p>
                                    <div className="ml-5 h-px flex-1 bg-current/15" />
                                </div>
                                <div className="space-y-4">
                                    {cashFunds.map((fund, i) => {
                                        const current = Number(fund.current || 0);
                                        const target = Number(fund.targetAmount || 0);
                                        const progress = target > 0 ? Math.min(100, Math.max(0, Math.round((current / target) * 100))) : 0;
                                        const currency = fund.currency || '';

                                        return (
                                            <div data-wedding-card="true" key={`${fund.title}-${i}`} className={`border p-5 ${insetClass} ${isSharp ? 'rounded-none' : 'rounded-xl'}`}>
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <h3 className="font-serif text-2xl leading-tight">{fund.title}</h3>
                                                        {fund.description && <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>{fund.description}</p>}
                                                    </div>
                                                    {target > 0 && (
                                                        <p className={`shrink-0 text-xs font-medium uppercase tracking-[0.16em] tabular-nums ${mutedTextClass}`}>
                                                            {currency}{current.toLocaleString('en-US')} / {currency}{target.toLocaleString('en-US')}
                                                        </p>
                                                    )}
                                                </div>
                                                {target > 0 && (
                                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-current/10">
                                                        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
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
                        <div className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[300px]">
                            <div data-wedding-card="true" className={`relative overflow-hidden p-5 sm:p-7 md:p-8 ${cardClass}`}>
                                <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="card-seal" />
                                <div className="relative z-10 text-center">
                                    <p className={`text-[11px] font-medium uppercase tracking-[0.26em] ${visual.eyebrowClass}`}>
                                        Instant Transfer
                                    </p>
                                    <h3 className={`mt-3 text-2xl leading-tight md:text-3xl ${visual.headingClass}`}>
                                        Scan to Gift
                                    </h3>
                                    <p className={`mx-auto mt-3 max-w-xs text-sm leading-6 ${visual.bodyClass}`}>
                                        Scan with your banking or e-wallet app, or save the code to your phone.
                                    </p>
                                </div>

                                <div className="relative z-10 mx-auto mt-7 max-w-[220px]">
                                    <div data-wedding-overlay="true" className={`bg-white p-3 shadow-[0_14px_40px_rgba(0,0,0,0.14)] ${isSharp ? 'rounded-none' : 'rounded-2xl'}`}>
                                        <div className={`bg-white p-2.5 ring-1 ring-black/10 ${isSharp ? 'rounded-none' : 'rounded-xl'}`}>
                                            <img
                                                src={wedding.gift_qr_image}
                                                alt="Payment QR code for digital gifting"
                                                className="aspect-square h-auto w-full bg-white object-contain opacity-100"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <button
                                            data-wedding-control="secondary"
                                            type="button"
                                            onClick={handleSaveQr}
                                            disabled={savingQr}
                                            className={`inline-flex min-h-11 items-center gap-2 border border-current/25 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-current/5 disabled:opacity-50 ${isSharp ? 'rounded-none' : 'rounded-full'}`}
                                        >
                                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                            {savingQr ? 'Saving...' : 'Save QR Image'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
