'use client';

import { Calendar, MapPin, Shirt, Info } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import VectorArtGuests from '../VectorArtGuests';

interface DetailsSectionProps {
    wedding: Wedding;
    invert?: boolean;
}

function DetailCard({ icon: Icon, title, value, subtitle, link, children }: {
    icon: React.ElementType;
    title: string;
    value: string;
    subtitle?: string;
    link?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center text-center p-12 rounded-[3.5rem] bg-white soft-shadow hover:-translate-y-2 transition-transform duration-500 border border-primary/5 h-full">
            {children || (
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 rotate-3 shrink-0">
                    <Icon className="w-7 h-7 text-primary" />
                </div>
            )}
            <h3 className="text-xl font-bold mb-4 opacity-40 uppercase tracking-widest">{title}</h3>
            <p className="text-2xl font-serif mb-2 text-[#4A4444]">{value}</p>
            <p className="text-foreground/50 text-sm mb-6 max-w-[200px] flex-1">{subtitle}</p>
            {link && <a href={link} target="_blank" className="text-primary font-bold border-b border-primary/30 pb-1 hover:border-primary transition-all text-xs uppercase tracking-widest mt-auto mb-2">Get Directions</a>}
        </div>
    );
}

export default function DetailsSection({ wedding, invert = false }: DetailsSectionProps) {
    const rawDressCode = wedding.dress_code || '';
    const dressCodeData = rawDressCode.split('||');
    const attireText = dressCodeData[0] || 'Formal';
    const attireColor = dressCodeData[1] || wedding.motif_color || '#333333';

    return (
        <section className={`py-32 ${invert ? 'bg-black/10' : 'bg-white/50'}`}>
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <DetailCard 
                    icon={Calendar} 
                    title="Date" 
                    value={wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'} 
                    subtitle={wedding.wedding_time} 
                />
                
                <DetailCard 
                    icon={MapPin} 
                    title="Location" 
                    value={wedding.venue_name || 'TBD'} 
                    subtitle={wedding.venue_address} 
                    link={wedding.maps_link} 
                />
                
                <DetailCard 
                    icon={Shirt} 
                    title="AttireTheme" 
                    value={attireText} 
                    subtitle={dressCodeData[1] ? "Theme color preview above" : "Dress your best for our special day."}
                >
                    {dressCodeData[1] ? (
                        <div className="w-24 h-24 mb-4 shrink-0 -mt-4">
                            <VectorArtGuests color={attireColor} />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 rotate-3 shrink-0">
                            <Shirt className="w-7 h-7 text-primary" />
                        </div>
                    )}
                </DetailCard>

                {(wedding.contact_person || wedding.hashtag) ? (
                    <DetailCard
                        icon={Info}
                        title="Extras"
                        value={wedding.hashtag ? `#${wedding.hashtag}` : 'Contact Us'}
                        subtitle={wedding.contact_person ? `Contact: ${wedding.contact_person}` : 'See you there!'}
                    />
                ) : (
                    <DetailCard
                        icon={Info}
                        title="More Info"
                        value="Stay Tuned"
                        subtitle="More details will be announced soon."
                    />
                )}
            </div>
        </section>
    );
}

export { DetailCard };
