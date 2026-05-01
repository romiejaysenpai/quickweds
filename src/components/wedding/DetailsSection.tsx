'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Shirt, Info } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import VectorArtGuests from '../VectorArtGuests';
import { derivePalette, getTypography, BENTO_PRESETS, getTemplateVisualProfile, type TemplateVisualProfile } from '@/lib/theme-engine';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';

interface DetailsSectionProps {
    wedding: Wedding;
    invert?: boolean;
    id: string;
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
    icon: React.ElementType;
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
        
    const textColorHeading = isDark ? "text-white/30" : "text-[#4A4444]/30";
    const textColorValue = isDark ? "text-white" : "text-[#4A4444]";
    const textColorSub = isDark ? "text-white/50" : "text-[#4A4444]/50";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col items-center text-center p-8 md:p-14 transition-all duration-700 h-full relative overflow-hidden group ${cardClass} hover:-translate-y-1 ${className}`}
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
                <div className="mb-8 relative">
                    {children || (
                        <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-all duration-700 relative z-10 ${
                            isSharp 
                                ? 'bg-primary/10 rounded-none group-hover:bg-primary group-hover:scale-110' 
                                : isVintage
                                ? 'bg-transparent border-2 border-primary/20 rounded-full group-hover:border-primary'
                                : 'bg-white shadow-lg rounded-[1.5rem] rotate-3 group-hover:rotate-0 group-hover:scale-110'
                        }`}>
                            <Icon className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-700 ${isSharp ? 'text-primary group-hover:text-white' : 'text-primary'}`} />
                        </div>
                    )}
                </div>

                <h3 className={`text-[10px] md:text-xs font-black mb-4 uppercase tracking-[0.3em] ${textColorHeading}`}>{title}</h3>
                
                <div className="flex-1 flex flex-col items-center w-full justify-center">
                    <p className={`text-2xl md:text-4xl ${typography.heading} mb-3 leading-tight tracking-tight break-words w-full ${textColorValue}`}>
                        {value}
                    </p>
                    <p className={`text-xs md:text-base mb-6 max-w-[280px] mx-auto font-medium leading-relaxed opacity-80 break-words ${textColorSub}`}>
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
                        whileHover={{ letterSpacing: '0.4em', x: 5 }}
                        className="text-primary font-bold border-b-2 border-primary/10 pb-2 hover:border-primary transition-all text-[10px] md:text-xs uppercase tracking-[0.3em] mt-auto font-black flex items-center gap-2"
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
    const visual = getTemplateVisualProfile(template, motifColor, invert);
    
    const rawDressCode = wedding.dress_code || '';
    const dressCodeData = rawDressCode.split('||');
    const attireText = dressCodeData[0] || 'Formal Attire';
    const attireColor = dressCodeData[1] || motifColor;

    const isSharp = ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);
    const isDark = ['midnight', 'cinematic', 'royal', 'urban', 'glitch', 'film', 'artdeco'].includes(template) || invert;
    const isVintage = ['vintage', 'rustic', 'boho', 'film'].includes(template);

    // Use Bento presets for modern templates
    const isBento = ['editorial', 'vogue', 'minimal', 'urban', 'boho', 'luxury'].includes(template);
    const layoutClasses = isBento ? BENTO_PRESETS.details : ["", "", "", ""];

    return (
        <section id={id} className={`py-24 md:py-40 relative z-10 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className={visual.containerClass}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="mb-12 text-center"
                >
                    <p className={`mb-4 text-[10px] font-black uppercase ${visual.eyebrowClass}`}>The essentials</p>
                    <h2 className={`text-4xl md:text-6xl ${visual.headingClass}`}>{visual.detailTitle}</h2>
                    <div className={`mx-auto mt-6 ${visual.dividerClass}`} />
                </motion.div>
            </div>
            <div className={`${visual.containerClass} grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8`}>
                <DetailCard 
                    delay={0}
                    icon={Calendar} 
                    title="The Date" 
                    value={wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Setting Date'} 
                    subtitle={wedding.wedding_time || 'Check back soon for exact schedule'} 
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                    className={layoutClasses[0]}
                    palette={palette}
                    typography={typography}
                    visual={visual}
                />
                
                <DetailCard 
                    delay={0.1}
                    icon={MapPin} 
                    title="The Venue" 
                    value={wedding.venue_name || 'Destination TBD'} 
                    subtitle={wedding.venue_address || 'Coming soon to your inbox'} 
                    link={wedding.maps_link} 
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                    className={layoutClasses[1]}
                    palette={palette}
                    typography={typography}
                    visual={visual}
                />
                
                <DetailCard 
                    delay={0.2}
                    icon={Shirt} 
                    title="Dress Code" 
                    value={attireText} 
                    subtitle={dressCodeData[1] ? "Palette inspiration shown" : "Please refer to the attire guidelines"}
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                    className={layoutClasses[2]}
                    palette={palette}
                    typography={typography}
                    visual={visual}
                >
                    {dressCodeData[1] ? (
                        <div className="w-16 h-16 md:w-20 md:h-20 mb-6 shrink-0 -mt-2 group-hover:scale-110 transition-transform duration-700">
                            <VectorArtGuests color={attireColor} />
                        </div>
                    ) : (
                        <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-all duration-700 ${
                            isSharp 
                                ? 'bg-primary/10 rounded-none group-hover:bg-primary group-hover:scale-110' 
                                : isVintage
                                ? 'bg-white border-2 border-primary/20 rounded-full group-hover:border-primary shadow-sm'
                                : 'bg-white shadow-lg rounded-[1.5rem] rotate-3 group-hover:rotate-0 group-hover:scale-110'
                        }`}>
                            <Shirt className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-700 ${isSharp ? 'text-primary group-hover:text-white' : 'text-primary'}`} />
                        </div>
                    )}
                </DetailCard>

                <DetailCard
                    delay={0.3}
                    icon={Info}
                    title="Socials"
                    value={wedding.hashtag ? `#${wedding.hashtag}` : 'Final Details'}
                    subtitle={wedding.contact_person ? `RSVP Organizer: ${wedding.contact_person}` : 'Official platform announcements'}
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                    className={layoutClasses[3]}
                    palette={palette}
                    typography={typography}
                    visual={visual}
                />
            </div>

            {/* Invitation Card Spotlight Section */}
            {wedding.invitation_image && (
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
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 block mb-3">Official Invitation</span>
                            <h2 className={`text-4xl md:text-5xl ${typography.heading} ${isDark ? 'text-white/80' : 'text-[#4A4444]/80'}`}>The Invitation</h2>
                        </motion.div>

                        {/* Multi-image display logic */}
                        <div className="w-full flex flex-col gap-12 md:gap-24 items-center">
                            {(() => {
                                let inviteImages: string[] = [];
                                try {
                                    if (typeof wedding.invitation_image === 'string' && wedding.invitation_image.startsWith('[')) {
                                        inviteImages = JSON.parse(wedding.invitation_image);
                                    } else if (wedding.invitation_image) {
                                        inviteImages = [wedding.invitation_image as string];
                                    }
                                } catch (e) {
                                    if (wedding.invitation_image) inviteImages = [wedding.invitation_image as string];
                                }

                                return inviteImages.map((src, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 40, rotateX: 10 }}
                                        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ 
                                            duration: 1.2, 
                                            delay: index * 0.2,
                                            ease: [0.16, 1, 0.3, 1] 
                                        }}
                                        whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
                                        className={`relative w-full max-w-[800px] group perspective-1000 ${
                                            template === 'royal' 
                                                ? 'bg-gradient-to-br from-accent/20 to-black/40 p-1 md:p-2' 
                                                : template === 'glitch'
                                                ? 'bg-black p-0 border-r-4 border-b-4 border-cyan-500'
                                                : isSharp 
                                                ? 'bg-black/20 p-2 border border-white/10' 
                                                : isVintage 
                                                ? 'bg-[#EAE4D3] p-4 md:p-8 shadow-inner ring-1 ring-black/5' 
                                                : 'bg-white/10 backdrop-blur-3xl p-3 md:p-6 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-primary/10'
                                        }`}
                                    >
                                        <div
                                            className={`relative w-full overflow-hidden ${
                                                template === 'royal'
                                                    ? 'rounded-none border-[10px] md:border-[18px] border-accent/90 shadow-[0_0_50px_rgba(214,184,124,0.2)]'
                                                    : template === 'glitch'
                                                    ? 'rounded-none border-2 border-magenta-500/50 mix-blend-screen'
                                                    : isSharp 
                                                    ? 'rounded-none border-4 border-white/30 shadow-3xl' 
                                                    : isVintage 
                                                    ? 'rounded-sm border-[10px] md:border-[20px] border-white shadow-[0_15px_40px_rgba(0,0,0,0.25)]' 
                                                    : 'rounded-[1.8rem] md:rounded-[2.5rem] border-[6px] md:border-[12px] border-white shadow-3xl'
                                            }`}
                                        >
                                            <img 
                                                src={src} 
                                                alt={`Invitation Page ${index + 1}`} 
                                                className={`w-full h-auto ${isSharp || template === 'glitch' ? 'object-cover' : 'object-contain'} group-hover:scale-105 transition-transform duration-[4000ms] ease-out`} 
                                            />
                                            
                                            {/* Page Number Badge */}
                                            {inviteImages.length > 1 && (
                                                <div className="absolute top-4 right-4 z-30">
                                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${isDark ? 'bg-white/10 text-white/50' : 'bg-black/5 text-black/40'}`}>
                                                        Page {index + 1}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Overlays */}
                                            {isVintage && (
                                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                                            )}
                                            {template === 'glitch' && (
                                                <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                                            )}
                                            {!isSharp && !isVintage && template !== 'glitch' && (
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-10" />
                                            )}
                                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                                                <div className="w-[300%] h-32 bg-white/10 blur-[120px] -rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-[2500ms] ease-in-out" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ));
                            })()}
                        </div>

                        {/* Interaction Hint */}
                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 0.4 }}
                            transition={{ delay: 1 }}
                            className="mt-12 text-[10px] uppercase tracking-[0.2em] font-medium"
                        >
                            {wedding.invitation_image?.toString().startsWith('[') && JSON.parse(wedding.invitation_image as string).length > 1 ? 'Scroll to see all pages' : 'Interact to explore invitation'}
                        </motion.p>
                    </motion.div>
                </div>
            )}
        </section>
    );
}

export { DetailCard };
