'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Shirt, Info } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import VectorArtGuests from '../VectorArtGuests';

interface DetailsSectionProps {
    wedding: Wedding;
    invert?: boolean;
}

function DetailCard({ icon: Icon, title, value, subtitle, link, children, delay = 0, isSharp, isDark, isVintage }: {
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
}) {
    const cardClass = isSharp 
        ? `border border-white/20 shadow-none ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-none` 
        : isVintage
        ? `border-[4px] double border-primary/20 bg-white shadow-xl rounded-sm`
        : `rounded-[2rem] md:rounded-[3.5rem] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-primary/5`;
        
    const textColorHeading = isDark ? "text-white/40" : "text-[#4A4444]/40";
    const textColorValue = isDark ? "text-white" : "text-[#4A4444]";
    const textColorSub = isDark ? "text-white/60" : "text-[#4A4444]/60";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay }}
            className={`flex flex-col items-center text-center p-8 md:p-12 hover:-translate-y-3 transition-transform duration-500 h-full relative overflow-hidden group ${cardClass}`}
        >
            {!isSharp && <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
            
            <div className="relative z-10 w-full flex flex-col items-center h-full">
                {children || (
                    <div className={`w-14 h-14 bg-primary/10 flex items-center justify-center mb-8 shrink-0 transition-transform ${isSharp ? 'rounded-none rotate-0' : 'rounded-2xl rotate-3 group-hover:rotate-6'}`}>
                        <Icon className="w-7 h-7 text-primary" />
                    </div>
                )}
                <h3 className={`text-xl font-bold mb-4 uppercase tracking-widest ${textColorHeading}`}>{title}</h3>
                <p className={`text-2xl font-serif mb-2 leading-tight ${textColorValue}`}>{value}</p>
                <p className={`text-sm mb-6 max-w-[200px] flex-1 ${textColorSub}`}>{subtitle}</p>
                {link && (
                    <a href={link} target="_blank" className="text-primary font-bold border-b border-primary/30 pb-1 hover:border-primary transition-all text-[10px] md:text-xs uppercase tracking-widest mt-auto mb-2">
                        Get Directions
                    </a>
                )}
            </div>
        </motion.div>
    );
}

export default function DetailsSection({ wedding, invert = false }: DetailsSectionProps) {
    const rawDressCode = wedding.dress_code || '';
    const dressCodeData = rawDressCode.split('||');
    const attireText = dressCodeData[0] || 'Formal';
    const attireColor = dressCodeData[1] || wedding.motif_color || '#333333';

    const template = wedding.template || 'classic';
    const isSharp = ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);
    const isDark = ['midnight', 'cinematic', 'royal', 'urban', 'glitch', 'film', 'artdeco'].includes(template) || invert;
    const isVintage = ['vintage', 'rustic', 'boho', 'film'].includes(template);

    return (
        <section className={`py-24 md:py-32 relative z-10 ${isDark ? 'text-white' : 'text-[#4A4444]'}`}>
            <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <DetailCard 
                    delay={0}
                    icon={Calendar} 
                    title="Date" 
                    value={wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'} 
                    subtitle={wedding.wedding_time} 
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                />
                
                <DetailCard 
                    delay={0.1}
                    icon={MapPin} 
                    title="Location" 
                    value={wedding.venue_name || 'TBD'} 
                    subtitle={wedding.venue_address} 
                    link={wedding.maps_link} 
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                />
                
                <DetailCard 
                    delay={0.2}
                    icon={Shirt} 
                    title="AttireTheme" 
                    value={attireText} 
                    subtitle={dressCodeData[1] ? "Theme color preview above" : "Dress your best for our special day."}
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                >
                    {dressCodeData[1] ? (
                        <div className="w-20 h-20 md:w-24 md:h-24 mb-4 shrink-0 -mt-4 pb-2">
                            <VectorArtGuests color={attireColor} />
                        </div>
                    ) : (
                        <div className={`w-14 h-14 flex items-center justify-center mb-8 shrink-0 transition-transform ${isSharp ? 'rounded-none rotate-0 bg-transparent' : 'rounded-2xl rotate-3 group-hover:rotate-6 bg-primary/10'}`}>
                            <Shirt className="w-7 h-7 text-primary" />
                        </div>
                    )}
                </DetailCard>

                <DetailCard
                    delay={0.3}
                    icon={Info}
                    title="Extras"
                    value={wedding.hashtag ? `#${wedding.hashtag}` : 'Contact Us'}
                    subtitle={wedding.contact_person ? `Contact: ${wedding.contact_person}` : 'More details announced soon!'}
                    isSharp={isSharp} isDark={isDark} isVintage={isVintage}
                />
            </div>
        </section>
    );
}

export { DetailCard };
