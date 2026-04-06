'use client';

import RSVPForm from '@/components/RSVPForm';
import type { Wedding } from '@/types/wedding';

interface RSVPSectionProps {
    wedding: Wedding;
    isExpired: boolean;
}

export default function RSVPSection({ wedding, isExpired }: RSVPSectionProps) {

    return (
        <section id="rsvp" className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
            <div className="bg-white rounded-3xl sm:rounded-[5rem] px-4 sm:px-8 md:px-16 py-8 sm:py-16 md:py-24 soft-shadow text-center relative overflow-hidden ring-1 ring-primary/5">
                <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-primary/5 rounded-br-full" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif mb-6 sm:mb-8 text-[#4A4444]">Will You Join Us?</h2>
                <p className="text-foreground/60 italic mb-8 sm:mb-12 text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed">We&apos;d love to have you with us. Please RSVP by <span className="text-primary font-bold not-italic">{new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
                {isExpired ? (
                    <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[3rem] bg-neutral/50 border border-primary/10 text-center">
                        <p className="text-xl sm:text-2xl font-serif text-foreground/60">RSVP has closed for this event.</p>
                    </div>
                ) : (
                    <RSVPForm weddingId={wedding.id} />
                )}
            </div>
        </section>
    );
}
