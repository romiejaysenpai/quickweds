'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { derivePalette, getSectionTitleStyle, getTypography, getTemplateVisualProfile, type TemplateVisualProfile } from '@/lib/theme-engine';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';

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
    children, 
    delay = 0, 
    isSharp, 
    isDark, 
    isVintage, 
    className = "",
    palette,
    typography,
    visual
}: {
    icon: LucideIcon;
    title: string;
    value: string;
    subtitle?: string;
    link?: string;
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
    // Dynamic styling based on template category
    const cardClass = visual.cardClass;
        
    const textColorHeading = isDark ? "text-white/72" : "text-[#4A4444]/68";
    const textColorValue = isDark ? "text-white" : "text-[#4A4444]";
    const textColorSub = isDark ? "text-white/74" : "text-[#4A4444]/68";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col items-center text-center p-7 md:p-10 transition-all duration-700 h-full relative overflow-hidden group ${cardClass} hover:-translate-y-1 ${className}`}
        >
            {/* Template-specific background decorations */}
            {!isSharp && !isVintage && (
                <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" 
                    style={{ backgroundColor: `${palette.primary}11` }}
                />
            )}
            
            <div className="relative z-10 w-full flex flex-col items-center h-full justify-center">
                {/* Icon Container with category-specific treatment */}
                <div className="mb-5 relative">
                    {children || (
                        <div className="flex h-9 w-9 items-center justify-center text-primary">
                            <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
                        </div>
                    )}
                </div>

                <h3 className={`text-xs font-black mb-4 uppercase tracking-[0.3em] ${textColorHeading}`}>{title}</h3>
                
                <div className="flex-1 flex flex-col items-center w-full justify-center">
                    <p className={`text-2xl md:text-3xl ${typography.heading} mb-3 leading-tight tracking-tight break-words w-full ${textColorValue}`}>
                        {value}
                    </p>
                    <p className={`text-sm md:text-base mb-6 max-w-[280px] mx-auto font-medium leading-relaxed break-words ${textColorSub}`}>
                        {subtitle}
                    </p>
                </div>

                {link && (
                    <motion.button 
                        onClick={() => {
                            const address = value + ' ' + (subtitle || '');
                            const encodedAddress = encodeURIComponent(address);
                            const webUrl = link || `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                            window.open(webUrl, '_blank');
                        }}
                        className="text-primary font-bold border-b-2 border-primary/10 min-h-11 pb-2 hover:border-primary transition-all text-xs uppercase tracking-[0.3em] mt-auto font-black flex items-center gap-2"
                    >
                        Get Directions <span className="text-lg">→</span>
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

export default function DetailsSection({ wedding, invert = false, id }: DetailsSectionProps) {
    const { registerSection, unregisterSection } = useSectionContext();
    
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
    
    const isSharp = ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);
    const isDark = visual.isDark;
    const isVintage = ['vintage', 'rustic', 'boho', 'film'].includes(template);
    const inviteImages = parseInvitationImages(wedding.invitation_image);

    return (
        <section id={id} className={`py-16 sm:py-24 relative z-10 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className={visual.containerClass}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="mb-12 text-center"
                >
                    <div className="mb-6 flex items-center justify-center">
                        <span className={visual.badgeStyleClass || `mb-4 text-[10px] font-black uppercase ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}ESSENTIALS` : 'The Essentials'}
                        </span>
                    </div>
                    <h2 className={`text-4xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>{visual.detailTitle}</h2>
                    <div className={`mx-auto mt-6 ${visual.dividerClass}`} />
                </motion.div>
            </div>
            <div className={`${visual.containerClass} max-w-5xl`}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
                    <DetailCard
                        delay={0}
                        icon={Calendar}
                        title="The Date"
                        value={wedding.wedding_date ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Setting Date'}
                        subtitle={wedding.wedding_time || 'Check back soon for exact schedule'}
                        isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                        className="sm:col-span-2"
                        palette={palette}
                        typography={typography}
                        visual={visual}
                    />

                    <DetailCard
                        delay={0.1}
                        icon={MapPin}
                        title="The Ceremony"
                        className={wedding.reception_venue_name ? undefined : "sm:col-span-2"}
                        value={wedding.venue_name || 'Destination TBD'}
                        subtitle={wedding.venue_address || 'Coming soon to your inbox'}
                        link={wedding.maps_link}
                        isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                        palette={palette}
                        typography={typography}
                        visual={visual}
                    />

                    {wedding.reception_venue_name && (
                        <DetailCard
                            delay={0.2}
                            icon={MapPin}
                            title="The Reception"
                            value={wedding.reception_venue_name}
                            subtitle={wedding.reception_venue_address}
                            link={wedding.reception_maps_link}
                            isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                            palette={palette}
                            typography={typography}
                            visual={visual}
                        />
                    )}
                </div>
                {(wedding.hashtag || wedding.contact_person) && (
                    <p className={`mt-8 text-center text-sm leading-7 ${isDark ? 'text-white/75' : 'text-[#4A4444]/75'}`}>
                        {wedding.hashtag && <span className="block">#{wedding.hashtag.replace(/^#/, '')}</span>}
                        {wedding.contact_person && <span className="block">RSVP contact: {wedding.contact_person}</span>}
                    </p>
                )}
            </div>

            {/* Invitation Card Spotlight Section */}
            {inviteImages.length > 0 && (
                <div className="max-w-5xl mx-auto px-4 md:px-6 mt-24 md:mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex flex-col items-center"
                    >
                        {/* Title for the invitation section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="mb-16 text-center"
                        >
                            <span className={`text-[10px] uppercase tracking-[0.4em] font-bold block mb-3 ${isDark ? 'text-white/70' : 'text-[#4A4444]/68'}`}>Official Invitation</span>
                            <h2 className={`text-4xl md:text-5xl ${typography.heading} ${titleStyle.className}`} style={titleStyle.style}>The Invitation</h2>
                        </motion.div>

                        <div className="flex w-full flex-col items-center gap-10 md:gap-16">
                            {inviteImages.map((src, index) => (
                                <figure key={`${src}-${index}`} className="w-full max-w-[800px]">
                                    <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`View invitation page ${index + 1} in full size`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
                                        <img src={src} alt={`Invitation page ${index + 1}`} loading="lazy" decoding="async" className="h-auto w-full object-contain shadow-sm" />
                                    </a>
                                    <figcaption className={`mt-4 text-center text-sm ${isDark ? 'text-white/75' : 'text-[#4A4444]/75'}`}>
                                        <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-current/30">
                                            {inviteImages.length > 1 ? `View invitation · Page ${index + 1}` : 'View invitation'}
                                        </a>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </section>
    );
}

export { DetailCard };
