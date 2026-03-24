'use client';

import RSVPForm from '@/components/RSVPForm';
import type { Wedding } from '@/types/wedding';

interface RSVPSectionProps {
    wedding: Wedding;
    isExpired: boolean;
}

export default function RSVPSection({ wedding, isExpired }: RSVPSectionProps) {

    return (
        <section id="rsvp" className="max-w-4xl mx-auto px-6 py-32">
            <div className="bg-white rounded-[5rem] p-16 md:p-24 soft-shadow text-center relative overflow-hidden ring-1 ring-primary/5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full" />
                <h2 className="text-5xl md:text-7xl font-serif mb-8 text-[#4A4444]">Will You Join Us?</h2>
                <p className="text-foreground/60 italic mb-12 text-xl max-w-lg mx-auto leading-relaxed">We&apos;d love to have you with us. Please RSVP by <span className="text-primary font-bold not-italic">{new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
                {isExpired ? (
                    <div className="p-12 rounded-[3rem] bg-neutral/50 border border-primary/10 text-center">
                        <p className="text-2xl font-serif text-foreground/60">RSVP has closed for this event.</p>
                    </div>
                ) : (
                    <RSVPForm weddingId={wedding.id} />
                )}
            </div>
        </section>
    );
}
