'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Check, Copy, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { derivePalette, getSectionTitleStyle, getTypography, getTemplateVisualProfile, type TemplateVisualProfile } from '@/lib/theme-engine';
import { useSectionActions } from '@/context/SectionContext';
import { copyToClipboard } from '@/lib/client-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { Lightbox } from './GallerySection';
import SafeWeddingImage from './SafeWeddingImage';

function formatDetailDate(dateValue?: string | null) {
    if (!dateValue) return 'Setting Date';
    const trimmed = dateValue.trim();
    const normalized = /^\d{4}-\d{2}-\d{2}/.test(trimmed) ? `${trimmed.slice(0, 10)}T12:00:00` : trimmed;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return trimmed;
    return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface DetailsSectionProps {
    wedding: Wedding;
    invert?: boolean;
    id: string;
}

function parseInvitationImages(value: Wedding['invitation_image']): string[] {
    if (!value) return [];
    if (typeof value !== 'string') return [];

    try {
        if (value.trim().startsWith('[')) {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter((src): src is string => typeof src === 'string' && src.length > 0) : [];
        }
    } catch {
        return value ? [value] : [];
    }

    return [value];
}

function DetailCard({
    icon: Icon,
    title,
    value,
    subtitle,
    link,
    copyText,
    children,
    delay = 0,
    isSharp,
    isDark,
    className = '',
    typography,
    visual,
}: {
    icon: LucideIcon;
    title: string;
    value: string;
    subtitle?: string;
    link?: string;
    copyText?: string;
    children?: React.ReactNode;
    delay?: number;
    isSharp?: boolean;
    isDark?: boolean;
    isVintage?: boolean;
    className?: string;
    palette: any;
    typography: any;
    visual: TemplateVisualProfile;
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    const handleCopy = async () => {
        if (!copyText) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(copyText);
            } else {
                await copyToClipboard(copyText);
            }
            setCopied(true);
        } catch {
            try {
                await copyToClipboard(copyText);
                setCopied(true);
            } catch {
                setCopied(false);
            }
        }
    };

    const cardClass = visual.cardClass;
    const textColorHeading = isDark ? 'text-white/70' : 'text-[#4A4444]/68';
    const textColorValue = isDark ? 'text-white' : 'text-[#352C2C]';
    const textColorSub = isDark ? 'text-white/72' : 'text-[#4A4444]/70';

    return (
        <motion.div
            data-wedding-card="true"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex h-full flex-col items-center overflow-hidden p-7 text-center transition-all duration-500 md:p-10 ${cardClass} ${className}`}
        >
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
                <div className="mb-4">
                    {children || (
                        <div className="flex h-9 w-9 items-center justify-center text-primary">
                            <Icon className="h-5 w-5 stroke-[1.4]" aria-hidden="true" />
                        </div>
                    )}
                </div>

                <h3 className={`mb-3 text-[11px] font-medium uppercase tracking-[0.28em] ${textColorHeading}`}>{title}</h3>

                <div className="flex w-full flex-1 flex-col items-center justify-center">
                    <p className={`mb-2.5 w-full break-words text-2xl leading-tight tracking-tight md:text-3xl ${typography.heading} ${textColorValue}`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className={`mx-auto mb-6 max-w-[300px] break-words text-sm leading-relaxed md:text-base ${textColorSub}`}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {(link || copyText) && (
                    <div className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-2">
                        {link && (
                            <button
                                data-wedding-control="primary"
                                type="button"
                                onClick={() => {
                                    const address = value + ' ' + (subtitle || '');
                                    const encodedAddress = encodeURIComponent(address);
                                    const webUrl = link || `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                                    window.open(webUrl, '_blank', 'noopener,noreferrer');
                                }}
                                className={`inline-flex min-h-11 items-center gap-1.5 border border-current/25 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors hover:bg-current/5 ${
                                    isSharp ? 'rounded-none' : 'rounded-full'
                                }`}
                            >
                                Directions
                                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                        {copyText && (
                            <button
                                data-wedding-control="quiet"
                                type="button"
                                onClick={() => void handleCopy()}
                                className={`inline-flex min-h-11 items-center gap-1.5 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] opacity-75 transition-opacity hover:opacity-100 ${
                                    isSharp ? 'rounded-none' : 'rounded-full'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                        Copy Address
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function DetailsSection({ wedding, invert = false, id }: DetailsSectionProps) {
    const { registerSection, unregisterSection } = useSectionActions();
    const [inviteLightboxIndex, setInviteLightboxIndex] = useState<number | null>(null);
    const handleCloseInviteLightbox = useCallback(() => setInviteLightboxIndex(null), []);

    useEffect(() => {
        registerSection(id, 'Details');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    const template = wedding.template || 'classic';
    const motifColor = wedding.motif_color || '#D16C78';

    const palette = derivePalette(motifColor, invert);
    const typography = getTypography(template);
    const visual = getTemplateVisualProfile(template, motifColor, invert, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);

    const isSharp = visual.isSharp || ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);
    const isDark = visual.isDark;
    const isVintage = ['vintage', 'rustic', 'boho', 'film'].includes(template);
    const inviteImages = parseInvitationImages(wedding.invitation_image);

    return (
        <section data-wedding-section="details" id={id} className={`py-16 sm:py-24 relative z-10 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className={visual.containerClass}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="mb-12 text-center"
                >
                    <div className="mb-5 flex items-center justify-center">
                        <span data-wedding-badge="true" className={visual.badgeStyleClass || `mb-2 text-[11px] font-medium uppercase ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}Essentials` : 'When & Where'}
                        </span>
                    </div>
                    <h2 className={`text-4xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>{visual.detailTitle}</h2>
                    <div data-wedding-divider="true" className={`mx-auto mt-6 ${visual.dividerClass}`} />
                </motion.div>
            </div>
            <div className={`${visual.containerClass} max-w-5xl`}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
                    <DetailCard
                        delay={0}
                        icon={Calendar}
                        title="The Date"
                        value={formatDetailDate(wedding.wedding_date)}
                        subtitle={wedding.wedding_time || 'Check back soon for exact schedule'}
                        isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                        className="sm:col-span-2"
                        palette={palette}
                        typography={typography}
                        visual={visual}
                    />

                    <DetailCard
                        delay={0.08}
                        icon={MapPin}
                        title="The Ceremony"
                        className={wedding.reception_venue_name ? undefined : 'sm:col-span-2'}
                        value={wedding.venue_name || 'Destination TBD'}
                        subtitle={wedding.venue_address || 'Coming soon to your inbox'}
                        link={wedding.maps_link || (wedding.venue_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([wedding.venue_name, wedding.venue_address].filter(Boolean).join(', '))}` : undefined)}
                        copyText={wedding.venue_address || wedding.venue_name}
                        isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                        palette={palette}
                        typography={typography}
                        visual={visual}
                    />

                    {wedding.reception_venue_name && (
                        <DetailCard
                            delay={0.16}
                            icon={MapPin}
                            title="The Reception"
                            value={wedding.reception_venue_name}
                            subtitle={wedding.reception_venue_address}
                            link={wedding.reception_maps_link || (wedding.reception_venue_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([wedding.reception_venue_name, wedding.reception_venue_address].filter(Boolean).join(', '))}` : undefined)}
                            copyText={wedding.reception_venue_address || wedding.reception_venue_name}
                            isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                            palette={palette}
                            typography={typography}
                            visual={visual}
                        />
                    )}
                </div>
                {(wedding.hashtag || wedding.contact_person) && (
                    <p className={`mt-8 text-center text-sm leading-7 ${isDark ? 'text-white/75' : 'text-[#4A4444]/75'}`}>
                        {wedding.hashtag && <span className="block font-serif italic text-base">#{wedding.hashtag.replace(/^#/, '')}</span>}
                        {wedding.contact_person && <span className="block">RSVP contact: {wedding.contact_person}</span>}
                    </p>
                )}
            </div>

            {/* Invitation Card Spotlight Section */}
            {inviteImages.length > 0 && (
                <div className="max-w-5xl mx-auto px-4 md:px-6 mt-20 md:mt-28">
                    <motion.div
                        initial={{ opacity: 0, y: 36 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex flex-col items-center"
                    >
                        <div className="mb-12 text-center">
                            <span className={`text-[11px] uppercase tracking-[0.3em] font-medium block mb-3 ${isDark ? 'text-white/70' : 'text-[#4A4444]/68'}`}>Official Suite</span>
                            <h2 className={`text-4xl md:text-5xl ${typography.heading} ${titleStyle.className}`} style={titleStyle.style}>The Invitation</h2>
                        </div>

                        <div className="flex w-full flex-col items-center gap-10 md:gap-14">
                            {inviteImages.map((src, index) => (
                                <figure key={`${src}-${index}`} className="w-full max-w-[760px]">
                                    <button
                                        type="button"
                                        onClick={() => setInviteLightboxIndex(index)}
                                        aria-label={`View invitation page ${index + 1} in full size`}
                                        className="block w-full cursor-zoom-in overflow-hidden border border-current/10 bg-white/80 p-2 shadow-[0_24px_65px_rgba(30,24,22,0.12)] transition-transform duration-500 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                                    >
                                        <SafeWeddingImage src={src} alt={`Invitation page ${index + 1}`} loading="lazy" decoding="async" className="h-auto w-full object-contain" />
                                    </button>
                                    <figcaption className={`mt-4 text-center text-xs uppercase tracking-[0.2em] ${isDark ? 'text-white/70' : 'text-[#4A4444]/70'}`}>
                                        <a data-wedding-control="secondary" href={src} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-current/30">
                                            {inviteImages.length > 1 ? `Open full size · Page ${index + 1}` : 'Open full size'}
                                        </a>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {inviteLightboxIndex !== null && (
                    <Lightbox key="invite-lightbox" images={inviteImages} index={inviteLightboxIndex} onClose={handleCloseInviteLightbox} />
                )}
            </AnimatePresence>
        </section>
    );
}

export { DetailCard };
