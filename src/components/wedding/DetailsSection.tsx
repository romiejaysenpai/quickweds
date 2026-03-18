'use client';

import { Calendar, MapPin, Shirt, Info } from 'lucide-react';
import type { Wedding } from '@/types/wedding';

interface DetailsSectionProps {
    wedding: Wedding;
    invert?: boolean;
}

function DetailCard({ icon: Icon, title, value, subtitle, link }: {
    icon: React.ElementType;
    title: string;
    value: string;
    subtitle?: string;
    link?: string;
}) {
    return (
        <div className="flex flex-col items-center text-center p-12 rounded-[3.5rem] bg-white soft-shadow hover:-translate-y-2 transition-transform duration-500 border border-primary/5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 rotate-3">
                <Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 opacity-40 uppercase tracking-widest">{title}</h3>
            <p className="text-2xl font-serif mb-2 text-[#4A4444]">{value}</p>
            <p className="text-foreground/50 text-sm mb-6 max-w-[200px]">{subtitle}</p>
            {link && <a href={link} target="_blank" className="text-primary font-bold border-b border-primary/30 pb-1 hover:border-primary transition-all text-xs uppercase tracking-widest">Get Directions</a>}
        </div>
    );
}

export default function DetailsSection({ wedding, invert = false }: DetailsSectionProps) {
    return (
        <section className={`py-32 ${invert ? 'bg-black/10' : 'bg-white/50'}`}>
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <DetailCard icon={Calendar} title="Date" value={new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} subtitle={wedding.wedding_time} />
                <DetailCard icon={MapPin} title="Location" value={wedding.venue_name} subtitle={wedding.venue_address} link={wedding.maps_link} />
                <DetailCard icon={Shirt} title="Attire" value={wedding.dress_code || 'Formal'} subtitle="Dress your best for our special day." />
                {(wedding.contact_person || wedding.hashtag) && (
                    <DetailCard
                        icon={Info}
                        title="Extras"
                        value={wedding.hashtag ? `#${wedding.hashtag}` : 'Contact Us'}
                        subtitle={wedding.contact_person ? `Contact: ${wedding.contact_person}` : 'See you there!'}
                    />
                )}
            </div>
        </section>
    );
}

export { DetailCard };
