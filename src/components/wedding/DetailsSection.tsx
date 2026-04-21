'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Shirt, Info } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import VectorArtGuests from '../VectorArtGuests';

interface DetailsSectionProps {
    wedding: Wedding;
    invert?: boolean;
}

function DetailCard({ icon: Icon, title, value, subtitle, link, children, delay = 0, isSharp, isDark, isVintage, template }: {
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
    template?: string;
}) {
    // Dynamic styling based on template category
    const cardClass = isSharp 
        ? `border border-white/10 shadow-none ${isDark ? 'bg-white/5 backdrop-blur-md' : 'bg-black/[0.02]'} rounded-none` 
        : isVintage
        ? `border-[1px] border-primary/20 bg-[#FFFDF9] shadow-lg rounded-sm ring-4 ring-primary/5 ring-offset-0`
        : `rounded-[2.5rem] md:rounded-[4rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-primary/5`;
        
    const textColorHeading = isDark ? "text-white/30" : "text-[#4A4444]/30";
    const textColorValue = isDark ? "text-white" : "text-[#4A4444]";
    const textColorSub = isDark ? "text-white/50" : "text-[#4A4444]/50";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col items-center text-center p-10 md:p-14 transition-all duration-700 h-full relative overflow-hidden group ${cardClass} hover:shadow-3xl`}
        >
            {/* Template-specific background decorations */}
            {!isSharp && !isVintage && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />
            )}
            
            <div className="relative z-10 w-full flex flex-col items-center h-full">
                {/* Icon Container with category-specific treatment */}
                <div className="mb-10 relative">
                    {children || (
                        <div className={`w-16 h-16 flex items-center justify-center transition-all duration-700 relative z-10 ${
                            isSharp 
                                ? 'bg-primary/10 rounded-none group-hover:bg-primary group-hover:scale-110' 
                                : isVintage
                                ? 'bg-transparent border-2 border-primary/20 rounded-full group-hover:border-primary'
                                : 'bg-white shadow-lg rounded-[1.5rem] rotate-3 group-hover:rotate-0 group-hover:scale-110'
                        }`}>
                            <Icon className={`w-7 h-7 transition-colors duration-700 ${isSharp ? 'text-primary group-hover:text-white' : 'text-primary'}`} />
                        </div>
                    )}
                    
                    {/* Shadow/Glow under icon for standard cards */}
                    {!isSharp && !isVintage && (
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    )}
                </div>

                <h3 className={`text-xs font-black mb-6 uppercase tracking-[0.3em] ${textColorHeading}`}>{title}</h3>
                
                <div className="flex-1 flex flex-col items-center w-full">
                    <p className={`text-2xl md:text-3xl font-serif mb-3 leading-tight tracking-tight ${textColorValue}`}>
                        {value}
                    </p>
                    <p className={`text-sm md:text-base mb-8 max-w-[220px] font-medium leading-relaxed opacity-80 ${textColorSub}`}>
                        {subtitle}
                    </p>
                </div>

                {link && (
                    <motion.button 
                        onClick={() => {
                            const address = value + ' ' + (subtitle || '');
                            const encodedAddress = encodeURIComponent(address);
                            const iosUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
                            const androidUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                            const webUrl = link || androidUrl;

                            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                                window.location.href = iosUrl;
                                // Fallback to web if app doesn't open
                                setTimeout(() => window.open(webUrl, '_blank'), 500);
                            } else if (/Android/i.test(navigator.userAgent)) {
                                window.location.href = `geo:0,0?q=${encodedAddress}`;
                                setTimeout(() => window.open(androidUrl, '_blank'), 500);
                            } else {
                                window.open(webUrl, '_blank');
                            }
                        }}
                        whileHover={{ letterSpacing: '0.4em', x: 5 }}
                        className="text-primary font-bold border-b-2 border-primary/10 pb-2 hover:border-primary transition-all text-[10px] md:text-xs uppercase tracking-[0.3em] mt-auto font-black flex items-center gap-2"
                    >
                        Get Directions <span className="text-lg">→</span>
                    </motion.button>
                )}
            </div>

            {/* Corner styling for Vintage/Editorial */}
            {isVintage && (
                <>
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/30" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/30" />
                </>
            )}
        </motion.div>
    );
}

export default function DetailsSection({ wedding, invert = false }: DetailsSectionProps) {
    const rawDressCode = wedding.dress_code || '';
    const dressCodeData = rawDressCode.split('||');
    const attireText = dressCodeData[0] || 'Formal Attire';
    const attireColor = dressCodeData[1] || wedding.motif_color || '#D16C78';

    const template = wedding.template || 'classic';
    const isSharp = ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);
    const isDark = ['midnight', 'cinematic', 'royal', 'urban', 'glitch', 'film', 'artdeco'].includes(template) || invert;
    const isVintage = ['vintage', 'rustic', 'boho', 'film'].includes(template);

    return (
        <section className={`py-24 md:py-40 relative z-10 ${isDark ? 'text-white' : 'text-[#4A4444]'}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                <DetailCard 
                    delay={0}
                    icon={Calendar} 
                    title="The Date" 
                    value={wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Setting Date'} 
                    subtitle={wedding.wedding_time || 'Check back soon for exact schedule'} 
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage} template={template}
                />
                
                <DetailCard 
                    delay={0.1}
                    icon={MapPin} 
                    title="The Venue" 
                    value={wedding.venue_name || 'Destination TBD'} 
                    subtitle={wedding.venue_address || 'Coming soon to your inbox'} 
                    link={wedding.maps_link} 
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage} template={template}
                />
                
                <DetailCard 
                    delay={0.2}
                    icon={Shirt} 
                    title="Dress Code" 
                    value={attireText} 
                    subtitle={dressCodeData[1] ? "Palette inspiration shown" : "Please refer to the attire guidelines"}
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage} template={template}
                >
                    {dressCodeData[1] ? (
                        <div className="w-20 h-20 md:w-24 md:h-24 mb-6 shrink-0 -mt-2 group-hover:scale-110 transition-transform duration-700">
                            <VectorArtGuests color={attireColor} />
                        </div>
                    ) : (
                        <div className={`w-16 h-16 flex items-center justify-center transition-all duration-700 ${
                            isSharp 
                                ? 'bg-primary/10 rounded-none group-hover:bg-primary group-hover:scale-110' 
                                : isVintage
                                ? 'bg-white border-2 border-primary/20 rounded-full group-hover:border-primary shadow-sm'
                                : 'bg-white shadow-lg rounded-[1.5rem] rotate-3 group-hover:rotate-0 group-hover:scale-110'
                        }`}>
                            <Shirt className={`w-7 h-7 transition-colors duration-700 ${isSharp ? 'text-primary group-hover:text-white' : 'text-primary'}`} />
                        </div>
                    )}
                </DetailCard>

                <DetailCard
                    delay={0.3}
                    icon={Info}
                    title="Socials"
                    value={wedding.hashtag ? `#${wedding.hashtag}` : 'Final Details'}
                    subtitle={wedding.contact_person ? `RSVP Organizer: ${wedding.contact_person}` : 'Official platform announcements'}
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage} template={template}
                />
            </div>

            {/* Invitation Card Spotlight Section */}
            {wedding.invitation_image && (
                <div className="max-w-5xl mx-auto px-4 md:px-6 mt-24 md:mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex flex-col items-center"
                    >
                        {/* Title for the invitation section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="mb-12 text-center"
                        >
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 block mb-3">Official Invitation</span>
                            <h2 className={`text-4xl md:text-5xl font-serif ${isDark ? 'text-white/80' : 'text-[#4A4444]/80'}`}>The Invitation</h2>
                        </motion.div>

                        {/* The Frame and Image */}
                        <motion.div
                            whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className={`relative w-full max-w-[800px] aspect-[4/5] md:aspect-[3/2] group perspective-1000 ${
                                template === 'royal' 
                                    ? 'bg-gradient-to-br from-accent/20 to-black/40 p-1 md:p-2' 
                                    : template === 'glitch'
                                    ? 'bg-black p-0 border-r-4 border-b-4 border-cyan-500'
                                    : isSharp 
                                    ? 'bg-black/20 p-2 border border-white/10' 
                                    : isVintage 
                                    ? 'bg-[#EAE4D3] p-4 md:p-8 shadow-inner ring-1 ring-black/5' 
                                    : 'bg-white/10 backdrop-blur-3xl p-3 md:p-6 rounded-[3rem] shadow-2xl shadow-primary/10'
                            }`}
                        >
                            <motion.div
                                className={`relative w-full h-full overflow-hidden ${
                                    template === 'royal'
                                        ? 'rounded-none border-[12px] md:border-[20px] border-accent/90 shadow-[0_0_60px_rgba(214,184,124,0.3)]'
                                        : template === 'glitch'
                                        ? 'rounded-none border-2 border-magenta-500/50 mix-blend-screen'
                                        : isSharp 
                                        ? 'rounded-none border-4 border-white/30 shadow-3xl' 
                                        : isVintage 
                                        ? 'rounded-sm border-[12px] md:border-[24px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]' 
                                        : 'rounded-[2rem] md:rounded-[3rem] border-[8px] md:border-[16px] border-white shadow-3xl'
                                }`}
                                style={{
                                    transformStyle: "preserve-3d",
                                }}
                            >
                                {/* Textured overlay for Vintage */}
                                {isVintage && (
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                                )}

                                {/* Scanline effect for Glitch */}
                                {template === 'glitch' && (
                                    <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                                )}

                                <img 
                                    src={wedding.invitation_image} 
                                    alt="Wedding Invitation" 
                                    className={`w-full h-full ${isSharp || template === 'glitch' ? 'object-cover' : 'object-contain'} group-hover:scale-110 transition-transform duration-[3000ms] ease-out`} 
                                />

                                {/* Glass reflect effect for modern/classic */}
                                {!isSharp && !isVintage && template !== 'glitch' && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-10" />
                                )}

                                {/* Specular highlight moving across on hover */}
                                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                                    <div className="w-[300%] h-24 bg-white/20 blur-[100px] -rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-[2000ms] ease-in-out" />
                                </div>
                            </motion.div>

                            {/* Decorative Corner Accents */}
                            {template === 'royal' && (
                                <div className="absolute inset-x-0 inset-y-0 border-[2px] border-white/20 m-6 pointer-events-none" />
                            )}
                            
                            {!isSharp && template !== 'glitch' && (
                                <>
                                    <div className={`absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 ${isVintage ? 'border-primary/40' : 'border-white/40 opacity-0 group-hover:opacity-100'} transition-opacity duration-500`} />
                                    <div className={`absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 ${isVintage ? 'border-primary/40' : 'border-white/40 opacity-0 group-hover:opacity-100'} transition-opacity duration-500`} />
                                </>
                            )}
                        </motion.div>

                        {/* Interaction Hint */}
                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 0.4 }}
                            transition={{ delay: 1 }}
                            className="mt-8 text-[10px] uppercase tracking-[0.2em] font-medium"
                        >
                            Interact to explore invitation
                        </motion.p>
                    </motion.div>
                </div>
            )}
        </section>
    );
}

export { DetailCard };
